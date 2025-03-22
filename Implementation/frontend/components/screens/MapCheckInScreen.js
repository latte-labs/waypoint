import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import API_BASE_URL from '../../config';
import styles from '../../styles/CheckInScreenStyles';

// Helper function to calculate distance between two coords (in meters)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const toRad = (val) => (val * Math.PI) / 180;
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
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

    // Allowed categories for achievements system
    const allowedCategories = ['park', 'museum', 'bar'];

    // On mount, fetch user check-ins from Firebase
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

    // On mount, get user location and fetch places
    useEffect(() => {
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                setRegion({
                    latitude: latitude,
                    longitude: longitude,
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
    }, []);

    // Fetch nearby places from backend
    const fetchNearbyPlaces = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/places/search`, {
                params: {
                    location: `${latitude},${longitude}`,
                    radius: 300, // small radius
                },
            });

            // Filter out duplicates
            const deduplicated = response.data.filter((place, index, self) =>
                index === self.findIndex((p) => p.cached_data.place_id === place.cached_data.place_id)
            );
            // Filter by allowed categories
            const filtered = deduplicated.filter(place =>
                allowedCategories.includes(place.category.toLowerCase())
            );

            // Ensure each place has top-level latitude and longitude, falling back to cached_data geometry if needed
            const normalized = filtered.map(place => ({
                ...place,
                latitude: place.latitude || (place.cached_data?.geometry?.location?.lat ? parseFloat(place.cached_data.geometry.location.lat) : undefined),
                longitude: place.longitude || (place.cached_data?.geometry?.location?.lng ? parseFloat(place.cached_data.geometry.location.lng) : undefined),
            }));

            setPlaces(normalized);

            // Select the nearest place by default
            if (normalized.length > 0) {
                let nearest = normalized[0];
                let minDistance = Infinity;
                normalized.forEach((p) => {
                    const dist = getDistance(
                        latitude,
                        longitude,
                        p.latitude,
                        p.longitude
                    );
                    if (dist < minDistance) {
                        minDistance = dist;
                        nearest = p;
                    }
                });
                setSelectedPlace(nearest); // set it as the initial selection
            }

        } catch (error) {
            console.error("Error fetching nearby places:", error);
            Alert.alert("Error", "Failed to fetch nearby places. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Confirm check in
    const confirmCheckIn = useCallback(async (place) => {
        if (!place) return;
        setLoading(true);
        try {
            const checkinId = uuidv4();
            const createdAt = new Date().toISOString();

            // Retrieve the current user data
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
                Alert.alert("Error", "User not logged in.");
                setLoading(false);
                return;
            }
            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Prepare check in data
            const checkInData = {
                coordinates: {
                    latitude: place.latitude,
                    longitude: place.longitude
                },
                place_id: place.cached_data?.place_id || place.id || place.name,
                created_at: createdAt,
            };

            // Write to Firebase
            await database().ref(`/game/${userId}/${place.category.toLowerCase()}/${checkinId}`).set(checkInData);

            // Update local state to disable further check-ins
            setUserCheckIns(prev => [...prev, place.cached_data?.place_id || place.id || place.name]);

            Alert.alert(
                "Check In Successful",
                `You have checked in at ${place.cached_data?.name || place.name}`
            );
        } catch (error) {
            console.error("Check In Error:", error);
            Alert.alert("Error", "Failed to complete check in. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Only render the map when both userLocation and places data are available
    if (!userLocation || places.length === 0) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading map and markers...</Text>
            </View>
        );
    }

    // Region for the map. Zoom in around the user's location if available
    const mapRegion = region || {
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
    };

    // Is the user already checked in at the selected place?
    const alreadyCheckedIn = selectedPlace
        ? userCheckIns.includes(selectedPlace.cached_data?.place_id || selectedPlace.id || selectedPlace.name)
        : false;

    return (
        <View style={styles.container}>
            {/* MAP SECTION */}
            <MapView
                ref={mapRef}
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
                onMapReady={() => {
                    console.log("Map is ready and should display markers now.");
                }}
            >
                {/* Markers for each place */}
                {places.map((p, index) => (
                    <Marker
                        key={p.cached_data?.place_id || p.id || `${p.name}-${index}`}
                        coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                        title={p.cached_data?.name || p.name}
                        // On press, set this place as the selected place
                        onPress={() => setSelectedPlace(p)}
                        pinColor={selectedPlace && (selectedPlace.cached_data?.place_id || selectedPlace.id || selectedPlace.name) ===
                            (p.cached_data?.place_id || p.id || p.name)
                            ? 'red'
                            : 'green'}
                    />
                ))}
            </MapView>

            {/* BOTTOM CARD SECTION */}
            {selectedPlace && (
                <View style={styles.bottomCard}>
                    <Text style={styles.placeTitle}>
                        {selectedPlace.cached_data?.name || selectedPlace.name}
                    </Text>
                    <Text style={styles.placeCategory}>{selectedPlace.category}</Text>

                    {alreadyCheckedIn ? (
                        <Text style={{ color: 'green', marginTop: 10 }}>
                            Already checked in
                        </Text>
                    ) : (
                        <TouchableOpacity
                            style={styles.checkInButton}
                            onPress={() => {
                                Alert.alert(
                                    "Confirm Check In",
                                    `Do you want to check in at ${selectedPlace.cached_data?.name || selectedPlace.name}?`,
                                    [
                                        { text: "Cancel", style: "cancel" },
                                        { text: "Confirm", onPress: () => confirmCheckIn(selectedPlace) }
                                    ]
                                );
                            }}
                        >
                            <Text style={{ color: '#fff' }}>Check In</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );
}

export default MapCheckInScreen;