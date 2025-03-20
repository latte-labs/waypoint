import React, { useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase'; // ensure firebase is properly initialized
import API_BASE_URL from '../../config';

const CheckIn = () => {
  const [loading, setLoading] = useState(false);

  const handleCheckIn = () => {
    setLoading(true);
    // Retrieve user's current location
    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Call your backend to use Google Places API (small radius for check-in)
          const response = await axios.get(`${API_BASE_URL}/places/search`, {
            params: {
              location: `${latitude},${longitude}`,
              radius: 500, // small radius for precise verification
            },
          });
          const places = response.data;

          // Valid categories for achievements
          const validCategories = ['park', 'bar', 'museum'];
          // Find a matching place that has a valid category
          const matchingPlace = places.find(place =>
            validCategories.includes(place.category.toLowerCase())
          );

          if (matchingPlace) {
            // Generate a unique check in ID
            const checkinId = uuidv4();
            const createdAt = new Date().toISOString();

            // Retrieve user data from AsyncStorage (stored on login)
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
              Alert.alert('Error', 'User session not set.');
              setLoading(false);
              return;
            }
            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Construct check in data
            const checkInData = {
              coordinates: { latitude, longitude },
              place_id: matchingPlace.place_id,
              created_at: createdAt,
            };

            // Write the check in data to Firebase under the game node
            // The path follows: game/user_id/{category}/{checkin_completion_id}
            await database().ref(`/game/${userId}/${matchingPlace.category.toLowerCase()}/${checkinId}`).set(checkInData);

            Alert.alert('Check In Successful', `You have checked in at ${matchingPlace.name}`);
          } else {
            Alert.alert('Check In Failed', 'No valid place found nearby.');
          }
        } catch (error) {
          console.error('Check In Error:', error);
          Alert.alert('Error', 'Failed to verify check in. Please try again.');
        }
        setLoading(false);
      },
      (error) => {
        console.error('Location Error:', error);
        Alert.alert('Error', 'Unable to get current location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ marginBottom: 20, fontSize: 18 }}>Check In Screen</Text>
      <Button title={loading ? "Checking In..." : "Check In"} onPress={handleCheckIn} disabled={loading} />
    </View>
  );
};

export default CheckIn;
