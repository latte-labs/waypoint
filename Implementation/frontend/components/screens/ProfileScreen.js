import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../../config';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelStyle, setTravelStyle] = useState(null);

  // ✅ Load user data from AsyncStorage on Focus
  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          console.log("🔄 Fetching user data from AsyncStorage...");
          const storedUser = await AsyncStorage.getItem('user');
          if (!storedUser) {
            console.error("❌ No user found in AsyncStorage!");
            return;
          }

          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          console.log("📥 Retrieved Travel Style ID:", userData.travel_style_id);

          if (userData.travel_style_id && userData.travel_style_id !== 4) {
            console.log("🔄 Fetching travel style details...");
            fetchTravelStyle(userData.travel_style_id);
          } else {
            console.log("🚫 Travel Style is Undefined (4) or not set.");
            setTravelStyle(null);
          }
        } catch (error) {
          console.error("❌ Error loading user data:", error);
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }, [])
  );

  // ✅ Fetch Travel Style Details from Backend
  const fetchTravelStyle = async (travelStyleId) => {
    try {
      console.log(`🔄 Fetching travel style details for ID: ${travelStyleId}`);
      const response = await axios.get(`${API_BASE_URL}/travel-styles/${travelStyleId}`);

      if (response.status === 200 && response.data) {
        console.log("✅ Travel Style Retrieved:", response.data);
        setTravelStyle(response.data);
      } else {
        console.warn("⚠️ Travel Style API response missing data.");
        setTravelStyle(null);
      }
    } catch (error) {
      console.error("❌ Error fetching travel style:", error.response?.data || error.message);
      setTravelStyle(null);
    }
  };

  // ✅ Handle Logout
  const handleLogout = async () => {
    await AsyncStorage.removeItem('user'); // Clear stored user data
    navigation.replace('Login'); // Redirect to Login
  };

  // ✅ Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Profile Picture */}
        <Image
          source={{ uri: user?.profile_image || 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />

        {/* User Info */}
        <Text style={styles.name}>{user?.name || 'Unknown User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>

        {/* Travel Style Info */}
        {travelStyle ? (
          <View style={styles.travelStyleContainer}>
            <Text style={styles.travelStyleName}>{travelStyle.name}</Text>
            <Text style={styles.travelStyleDescription}>{travelStyle.description}</Text>
          </View>
        ) : (
          <Text style={styles.noTravelStyle}>
            {user?.travel_style_id === 4 ? "You haven't taken the quiz yet." : "Fetching travel style..."}
          </Text>
        )}

        {/* Buttons */}
        <Button title="Edit Profile" onPress={() => alert('Edit Profile Feature Coming Soon!')} />
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 16, color: 'gray', marginBottom: 10 },
  travelStyleContainer: { alignItems: 'center', marginVertical: 10 },
  travelStyleName: { fontSize: 16, fontWeight: '600', color: '#FF6F00' },
  travelStyleDescription: { fontSize: 14, color: '#555', textAlign: 'center', paddingHorizontal: 20 },
  noTravelStyle: { fontSize: 14, fontStyle: 'italic', color: '#888', marginBottom: 10 },
});

export default ProfileScreen;
