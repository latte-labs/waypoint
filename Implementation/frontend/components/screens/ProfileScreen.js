import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../../config';
import ImagePicker from 'react-native-image-crop-picker';
import { getDatabase, ref, update, onValue, get } from '@react-native-firebase/database';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelStyle, setTravelStyle] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
  
      const db = getDatabase();
      const imageRef = ref(db, `users/${user.id}/profilePhotoUrl`);
  
      const unsubscribe = onValue(imageRef, async (snapshot) => {
        const imageUrl = snapshot.val();
  
        if (imageUrl) {
          console.log("✅ Firebase Returned URL:", imageUrl);
          const cacheBustedUrl = `${imageUrl}?ts=${Date.now()}`;
          setProfileImage(cacheBustedUrl);
          await AsyncStorage.setItem('profileImage', cacheBustedUrl);
          } else {
          const fallback = await AsyncStorage.getItem('profileImage');
          if (fallback) {
            console.log("ℹ️ Using fallback image from AsyncStorage");
            setProfileImage(fallback);
          } else {
            setProfileImage(null);
            console.log("🚫 No image found in Firebase or cache");
          }
        }
      });
  
      return () => {
        // ❗ Clean up to avoid memory leaks and stale listeners
        imageRef && unsubscribe();
      };
    }, [user?.id])
  );
        
  const handleProfileImagePress = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true,
        compressImageQuality: 0.8,
      });
  
      if (!image || !image.path) {
        console.log("ℹ️ Image picker cancelled by user.");
        return;
      }
  
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
  
      setUploading(true); // ✅ Start spinner
  
      const response = await fetch(`${API_BASE_URL}/images/generate-profile-photo-url/?user_id=${userId}`);
      if (!response.ok) throw new Error("Failed to get presigned URL");
  
      const { presigned_url, image_url } = await response.json();
  
      const imageData = await fetch(image.path);
      const blob = await imageData.blob();
  
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presigned_url);
      xhr.setRequestHeader('Content-Type', 'image/jpeg');
  
      xhr.onload = async () => {
        setUploading(false); // ✅ Stop spinner
        if (xhr.status !== 200) {
          console.log('S3 Upload failed:', xhr.responseText);
          return;
        }
  
        try {
          const db = getDatabase();
          const updates = {};
          const cacheBustedUrl = `${image_url}?ts=${Date.now()}`;
          updates[`users/${userId}/profilePhotoUrl`] = cacheBustedUrl;
          await update(ref(db), updates);
  
          await AsyncStorage.setItem('profileImage', cacheBustedUrl);
          setProfileImage(cacheBustedUrl);
        } catch (error) {
          console.error("Firebase update failed:", error);
          Alert.alert("Upload Failed", "Could not save to Firebase.");
        }
      };
  
      xhr.onerror = (e) => {
        setUploading(false); // ✅ Stop spinner
        console.log('XHR Error:', e);
        Alert.alert('Upload Failed', 'Network request failed during upload.');
      };
  
      xhr.send(blob);
  
    } catch (err) {
      setUploading(false); // ✅ Stop spinner on catch
      if (err?.message?.includes('cancelled')) {
        console.log("ℹ️ User cancelled image selection.");
      } else {
        console.error('Upload failed:', err);
        Alert.alert('Upload Failed', 'There was a problem uploading your photo. Please try again.');
      }
    }
  };
     

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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileContainer}>

        <View style={{ alignItems: 'center' }}>
          <TouchableOpacity onPress={handleProfileImagePress}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log("Image failed to load:", profileImage);
                  Alert.alert("Failed to load image", "URL might be wrong or access denied");
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text>No Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.tapToChange}>Tap to change photo</Text>
        </View>


          {uploading && (
            <ActivityIndicator size="small" color="#888" style={{ marginTop: 12 }} />
          )}
          <Text style={styles.name}>{user?.name || 'User Name'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.quizStatus}>
            {travelStyle?.name
              ? `Your travel style: ${travelStyle.name}`
              : "You haven't taken the quiz yet."}
          </Text>

        </View>

        {/* Buttons */}
        <Button title="Edit Profile" onPress={() => alert('Edit Profile Feature Coming Soon!')} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flexGrow: 1, backgroundColor: '#fff' },
  travelStyleContainer: { alignItems: 'center', marginVertical: 10 },
  travelStyleName: { fontSize: 16, fontWeight: '600', color: '#FF6F00' },
  travelStyleDescription: { fontSize: 14, color: '#555', textAlign: 'center', paddingHorizontal: 20 },
  noTravelStyle: { fontSize: 14, fontStyle: 'italic', color: '#888', marginBottom: 10 },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 40,
    marginTop: 40,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#999',
  },
  
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  
  email: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
    textAlign: 'center',
  },
  
  quizStatus: {
    fontSize: 13,
    fontStyle: 'italic',
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#263986',
  },
  
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tapToChange: {
    fontSize: 12,
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
  }
  
  
  
  
});

export default ProfileScreen;
