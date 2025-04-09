import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import API_BASE_URL from '../../config';
import styles from '../../styles/CheckInScreenStyles';
import Icon from 'react-native-vector-icons/FontAwesome'
import { useNavigation } from '@react-navigation/native';
import AchievementsScreen from './AchievementsScreen';

// calculate distance (in meters) between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const toRad = (val) => (val * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const MapCheckInScreen = () => {
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [userCheckIns, setUserCheckIns] = useState([]);
  const [region, setRegion] = useState(null);
  const mapRef = useRef(null);
  const CIRCLE_RADIUS = 200;
  const navigation = useNavigation();

  // Retrieve user check-ins from Firebase on mount
  useEffect(() => {
    const fetchUserCheckIns = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const userId = userData.id;
          const snapshot = await database().ref(`/game/${userId}`).once('value');
          const data = snapshot.val();
          let checkedPlaceIds = [];
          if (data) {
            Object.values(data).forEach(category => {
              Object.values(category).forEach(checkInData => {
                checkedPlaceIds.push(checkInData.place_id);
              });
            });
          }
          setUserCheckIns(checkedPlaceIds);
        }
      } catch (error) {
        console.error("Error fetching user check-ins:", error);
      }
    };

    fetchUserCheckIns();
  }, []);

  // Get user location and fetch nearby places on mount
  useEffect(() => {
    fetchUserLocationAndPlaces();
  }, []);

  const fetchUserLocationAndPlaces = () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        fetchNearbyPlaces(latitude, longitude);
      },
      (error) => {
        console.error("Location Error:", error);
        setLocationError("Unable to retrieve current location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

 // Fetch nearby places (2000m radius)
  const fetchNearbyPlaces = async (latitude, longitude) => {
    try {
      // use the filtered endpoint that returns only places in allowed categories.
      const response = await axios.get(`${API_BASE_URL}/places/cached/filtered`, {
        params: {
          location: `${latitude},${longitude}`,
          radius: 2000, 
        },
      });
      const fetchedPlaces = response.data;
      setPlaces(fetchedPlaces);

      if (fetchedPlaces.length > 0) {
        let nearest = fetchedPlaces[0];
        let minDistance = Infinity;
        fetchedPlaces.forEach((p) => {
          const dist = getDistance(latitude, longitude, p.latitude, p.longitude);
          if (dist < minDistance) {
            minDistance = dist;
            nearest = p;
          }
        });
        setSelectedPlace(nearest);
      }
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      Alert.alert("Error", "Failed to fetch nearby places. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // Called when user confirms check in
  const confirmCheckIn = useCallback(async (place) => {
    
    if (!place) return;
    setLoading(true);
    try {
      const checkinId = uuidv4();
      const createdAt = new Date().toISOString();

      const storedUser = await AsyncStorage.getItem('user');
      if (!storedUser) {
        Alert.alert("Error", "User not logged in.");
        setLoading(false);
        return;
      }
      const userData = JSON.parse(storedUser);
      const userId = userData.id;

      const checkInData = {
        coordinates: {
          latitude: place.latitude,
          longitude: place.longitude,
        },
        place_id: place.cached_data?.place_id || place.id || place.name,
        created_at: createdAt,
      };

      await database().ref(`/game/${userId}/${place.category.toLowerCase()}/${checkinId}`).set(checkInData);
      await database().ref(`/users/${userId}/onboarding/checked_in`).set(true);

      setUserCheckIns(prev => [...prev, place.cached_data?.place_id || place.id || place.name]);

      Alert.alert(
        "Visit Logged",
        `You’ve successfully logged a visit at ${place.cached_data?.name || place.name}.`,
        [
          { text: "No, Stay Here", style: "cancel" },
          {
            text: "View My Progress",
            onPress: () => {
              navigation.navigate("Badges");
            },
          },
        ]
      );
          
    } catch (error) {
      console.error("Check In Error:", error);
      Alert.alert("Error", "Failed to complete check in. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Map Display: Render MapView and Circle at the same time
  const mapRegion = region || {
    latitude: userLocation?.latitude || 49.2827,
    longitude: userLocation?.longitude || -123.1207,
    latitudeDelta: userLocation ? 0.01 : 0.05,
    longitudeDelta: userLocation ? 0.01 : 0.05,
  };

  // Check if selected place is within 200m of user's location
  const inRange = selectedPlace
    ? getDistance(userLocation.latitude, userLocation.longitude, selectedPlace.latitude, selectedPlace.longitude) <= CIRCLE_RADIUS
    : false;


  // Determine if the user has already checked in at the selected place
  const alreadyCheckedIn = selectedPlace
    ? userCheckIns.includes(selectedPlace.cached_data?.place_id || selectedPlace.id || selectedPlace.name)
    : false;

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text>Loading map and markers...</Text>
      </View>
    );
  }

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const centerMapOnUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 300);
    } else {
      Alert.alert("Location not available", "Try updating your location first.");
    }
  };
  

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onMapReady={() => console.log("Map is ready.")}
      >
        {/* Circle drawn around user's location */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={200}
            fillColor="rgba(66, 66, 221, 0.2)"
            strokeColor="rgba(0, 0, 255, 0.3)"
            strokeWidth={2}
          />
        )}
        {/* Markers for each place */}
        {places.map((p, index) => (
          <Marker
            key={p.cached_data?.place_id || p.id || `${p.name}-${index}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.cached_data?.name || p.name}
            onPress={() => setSelectedPlace(p)}
            pinColor={
              selectedPlace &&
              ((selectedPlace.cached_data?.place_id || selectedPlace.id || selectedPlace.name) ===
                (p.cached_data?.place_id || p.id || p.name))
                ? 'red'
                : '#1E3A8A'
            }
          />
        ))}
      </MapView>

      {/* Bottom Card: Shows selected place details and check-in button/message */}
      {selectedPlace && (
        <View style={styles.bottomCard}>
          <Text style={styles.placeTitle}>
            {selectedPlace.cached_data?.name || selectedPlace.name}
          </Text>
          <Text style={styles.placeCategory}>{capitalize(selectedPlace.category)}</Text>
          {alreadyCheckedIn ? (
            <Text style={{ color: 'green', marginTop: 10 }}>Visit already logged</Text>
          ) : !inRange ? (
            <TouchableOpacity style={[styles.checkInButton, styles.disabledButton]} disabled={true}>
              <Text style={styles.disabledButtonText}>Too Far to Log Visit. Get Closer.</Text>
            </TouchableOpacity>
          ):(
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => {
                Alert.alert(
                  "Confirm Log Visit",
                  `Do you want to log a visit at ${selectedPlace.cached_data?.name || selectedPlace.name}?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Confirm", onPress: () => confirmCheckIn(selectedPlace) }
                  ]
                );                
              }}
            >
              <Text style={styles.checkInButtonText}>Log Visit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Refresh button */}
      <View style={styles.gpsControlContainer}>
        <TouchableOpacity
          style={styles.pillButton}
          onPress={fetchUserLocationAndPlaces}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={16} color="#1E3A8A" />
          <Text style={styles.pillButtonText}>Update My Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillButton}
          onPress={centerMapOnUser}
          activeOpacity={0.8}
        >
          <Icon name="crosshairs" size={16} color="#1E3A8A" />
        </TouchableOpacity>
      </View>




    </View>
  );
};

export default MapCheckInScreen;
