import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert, ActivityIndicator } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase'; // ensure firebase is properly initialized
import API_BASE_URL from '../../config';
import styles from '../../styles/CheckInScreenStyles';

const CheckIn = () => {
    const [loading, setLoading] = useState(false);
    const [places, setPlaces] = useState([]);
    const [locationError, setLocationError] = useState(null);
    const [userCheckIns, setUserCheckIns] = useState([]);
    const allowedCategories = ['park', 'museum', 'bar'];

    // Fetch user's existing check-ins from Firebase
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

    useEffect(() => {
        fetchLocationAndPlaces();
    }, []);

    // Retrieves current location then fetches nearby places
    const fetchLocationAndPlaces = () => {
        setLoading(true);
        Geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
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

    // Calls backend API to get places within a small radius
    const fetchNearbyPlaces = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/places/search`, {
                params: {
                    location: `${latitude},${longitude}`,
                    radius: 300, // small radius for precise check in
                },
            });
            setPlaces(response.data);
        } catch (error) {
            console.error("Error fetching nearby places:", error);
            Alert.alert("Error", "Failed to fetch nearby places. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const deduplicatedPlaces = places.filter((place, index, self) =>
        index === self.findIndex((p) => p.cached_data.place_id === place.cached_data.place_id)
    );
    const filteredPlaces = deduplicatedPlaces.filter(place =>
        allowedCategories.includes(place.category.toLowerCase())
    );

    const handlePlaceSelection = (place) => {
        if (userCheckIns.includes(place.cached_data.place_id)) return;

        Alert.alert(
            "Confirm Check In",
            `Do you want to check in at ${place.cached_data?.name || place.name}?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Confirm",
                    onPress: () => confirmCheckIn(place)
                }
            ]
        );
    };

    // Writes the check in information to Firebase
    const confirmCheckIn = async (place) => {
        setLoading(true);
        try {
            const checkinId = uuidv4();
            const createdAt = new Date().toISOString();

            // Retrieve the current user data from AsyncStorage (as set in LoginScreen.js)
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
                Alert.alert("Error", "User not logged in.");
                setLoading(false);
                return;
            }
            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Prepare check in data. If the API returns a coordinates object, use it; otherwise, fallback.
            const checkInData = {
                coordinates: place.coordinates || { latitude: place.latitude, longitude: place.longitude },
                place_id: place.cached_data.place_id,
                created_at: createdAt,
            };

            // Write data to Firebase following the structure:
            // game -> user_id -> category -> checkin_completion_id -> checkInData
            await database().ref(`/game/${userId}/${place.category.toLowerCase()}/${checkinId}`).set(checkInData);

            setUserCheckIns(prev => [...prev, place.cached_data.place_id]);
            Alert.alert("Check In Successful", `You have checked in at ${place.cached_data?.name || place.name}`);
        } catch (error) {
            console.error("Check In Error:", error);
            Alert.alert("Error", "Failed to complete check in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading...</Text>
            </View>
        );
    }

    if (locationError) {
        return (
            <View style={styles.errorContainer}>
                <Text>{locationError}</Text>
                <Button title="Try Again" onPress={fetchLocationAndPlaces} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Place to Check In</Text>
            <FlatList
                data={filteredPlaces}
                keyExtractor={(item) => item.cached_data.place_id}
                renderItem={({ item }) => {
                    const alreadyCheckedIn = userCheckIns.includes(item.cached_data.place_id);
                    return (
                        <TouchableOpacity
                            style={[styles.flatListItem, { opacity: alreadyCheckedIn ? 0.5 : 1 }]}
                            onPress={() => handlePlaceSelection(item)}
                            disabled={alreadyCheckedIn}
                        >
                            <Text style={styles.placeName}>{item.cached_data?.name || item.name}</Text>
                            <Text style={styles.categoryText}>{item.category}</Text>
                            {alreadyCheckedIn && <Text style={styles.checkedInText}>Checked In</Text>}
                        </TouchableOpacity>
                    );
                }}
                ListEmptyComponent={() => (
                    <Text>No places found nearby. Try refreshing.</Text>
                )}
            />
            <Button title="Refresh" onPress={fetchLocationAndPlaces} />
        </View>
    );
};

export default CheckIn;
