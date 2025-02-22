import React, { useEffect, useState } from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user data from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

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
          source={{ uri: user?.profile_image || 'https://via.placeholder.com/150' }} // ✅ Show actual profile pic or placeholder
          style={styles.profileImage}
        />

        {/* User Info */}
        <Text style={styles.name}>{user?.name || 'Unknown User'}</Text>
        <Text style={styles.email}>{user?.email || 'No email available'}</Text>

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
});

export default ProfileScreen;
