import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

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
const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const trophyImages = {
  park: {
    Bronze: require('../../assets/achievements/park/bronze_park.png'),
    Silver: require('../../assets/achievements/park/silver_park.jpeg'),
    Gold: require('../../assets/achievements/park/gold_park.jpeg'),
  },
  bar: {
    Bronze: require('../../assets/achievements/bar/bronze_bar.jpeg'),
    Silver: require('../../assets/achievements/bar/silver_bar.png'),
    Gold: require('../../assets/achievements/bar/gold_bar.jpeg'),
  },
  museum: {
    Bronze: require('../../assets/achievements/museum/bronze_museum.jpeg'),
    Silver: require('../../assets/achievements/museum/silver_museum.jpeg'),
    Gold: require('../../assets/achievements/museum/gold_museum.jpeg'),
  },
};



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
  const [showInfo, setShowInfo] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadgeInfo, setNewBadgeInfo] = useState(null);
  const badgeScale = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const badgeRotation = useSharedValue(0);
  useEffect(() => {
    if (showBadgeModal) {
      badgeScale.value = 0;
      badgeOpacity.value = 0;
      badgeRotation.value = 0;
  
      badgeScale.value = withSpring(1, { damping: 8, stiffness: 150 });
      badgeOpacity.value = withSpring(1);
      badgeRotation.value = withTiming(720, {
        duration: 1500,
        easing: Easing.out(Easing.exp),
      });
    }
  }, [showBadgeModal]);
  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
    opacity: badgeOpacity.value,
  }));
  
  

  function getBadge(count) {
    if (count >= 20) return 'Gold';
    if (count >= 10) return 'Silver';
    if (count >= 5) return 'Bronze';
    return null;
  }
  function getBadgeImage(category, tier) {
    const lowerCat = category?.toLowerCase();
    return trophyImages[lowerCat]?.[tier] || null;
  }
  
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
    let badgeShown = false;
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
      const categoryKey = place.category.toLowerCase();

      // Get previous check-in count for this category
      const prevSnapshot = await database().ref(`/game/${userId}/${categoryKey}`).once('value');
      const prevData = prevSnapshot.val() || {};
      const prevCount = Object.keys(prevData).length;
      const prevBadge = getBadge(prevCount);
      
      await database().ref(`/game/${userId}/${place.category.toLowerCase()}/${checkinId}`).set(checkInData);
      await database().ref(`/users/${userId}/onboarding/checked_in`).set(true);
      // Get new check-in count
      const updatedSnapshot = await database().ref(`/game/${userId}/${categoryKey}`).once('value');
      const updatedData = updatedSnapshot.val() || {};
      const newCount = Object.keys(updatedData).length;
      const newBadge = getBadge(newCount);

      // Check if badge tier increased
      if (newBadge && newBadge !== prevBadge) {
        setNewBadgeInfo({
          badgeTier: newBadge,
          category: capitalize(categoryKey),
        });
        setShowBadgeModal(true);
        badgeShown = true;
      }
      

      setUserCheckIns(prev => [...prev, place.cached_data?.place_id || place.id || place.name]);

      if (!badgeShown) {
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
      }      
          
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
  function getBadge(count) {
  if (count >= 20) return 'Gold';
  if (count >= 10) return 'Silver';
  if (count >= 5) return 'Bronze';
  return null;
}


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
        <>
          {/* Info icon above card */}
          <View style={styles.infoButtonContainer}>
            <TouchableOpacity
              onPress={() => setShowInfo(true)}
              activeOpacity={0.8}
              style={styles.pillButton}
            >
              <Icon name="info-circle" size={16} color="#1E3A8A" />
            </TouchableOpacity>
          </View>


          {/* Bottom Card: Shows selected place details and check-in button/message */}
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
            ) : (
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
        </>
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

      {showInfo && (
        <View style={{
          position: 'absolute',
          top: '28%',
          left: 28,
          right: 28,
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 8,
          zIndex: 20,
        }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10, color: '#111' }}>
            Why Log a Visit?
          </Text>

          <Text style={{ fontSize: 14.5, color: '#444', lineHeight: 21, marginBottom: 12 }}>
            Logging a visit lets you track places you've been, earn unique category-based badges, and build your travel journey.
          </Text>

          <Text style={{ fontSize: 14.5, color: '#444', lineHeight: 21 }}>
            To log a visit:
          </Text>
          <Text style={{ fontSize: 14.5, color: '#444', marginTop: 4 }}>
            1. Move near a place on the map
          </Text>
          <Text style={{ fontSize: 14.5, color: '#444' }}>
            2. Tap on a nearby marker
          </Text>
          <Text style={{ fontSize: 14.5, color: '#444' }}>
            3. Press “Log Visit” to check in and start collecting badges!
          </Text>

          <TouchableOpacity
            onPress={() => setShowInfo(false)}
            style={{
              alignSelf: 'flex-end',
              marginTop: 20,
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: '#1E3A8A',
              borderRadius: 10,
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Got it</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal
        visible={showBadgeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              🏆 New Badge Unlocked!
            </Text>
            <Animated.Image
              source={getBadgeImage(newBadgeInfo?.category, newBadgeInfo?.badgeTier)}
              style={[{ width: 120, height: 120, marginBottom: 16 }, animatedBadgeStyle]}
              resizeMode="contain"
            />

            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              You earned the {newBadgeInfo?.badgeTier} badge in {newBadgeInfo?.category}!
            </Text>

            <TouchableOpacity
              onPress={() => {
                setShowBadgeModal(false);
                navigation.navigate("Badges");
              }}
              style={{
                backgroundColor: '#1E3A8A',
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 10,
                alignItems: 'center',
                width: '100%',
                marginBottom: 10,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                View Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowBadgeModal(false)}
              style={{
                backgroundColor: '#E5E7EB',
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 10,
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text style={{ color: '#1F2937', fontWeight: 'bold', textAlign: 'center' }}>
                Check Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
};

export default MapCheckInScreen;
