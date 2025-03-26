import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../../config';
import ImagePicker from 'react-native-image-crop-picker';
import { getDatabase, ref, update, onValue, get } from '@react-native-firebase/database';
import FontAwesome from 'react-native-vector-icons/FontAwesome'


const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [travelStyle, setTravelStyle] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    location: '',
    languages: '',
    favoriteDestinations: '',
    travelStyle: '',
    dreamDestination: '',
    travelApp: '',
    instagram: '',
  });


  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
  
      const db = getDatabase();
      const userRef = ref(db, `users/${user.id}`);
  
      const unsubscribe = onValue(userRef, async (snapshot) => {
        const userData = snapshot.val();
  
        if (userData) {
          // ✅ Load Profile Image
          if (userData.profilePhotoUrl) {
            console.log("✅ Firebase Returned URL:", userData.profilePhotoUrl);
            const cacheBustedUrl = `${userData.profilePhotoUrl}?ts=${Date.now()}`;
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
  
          // ✅ Load Profile Fields
          const {
            username = '',
            bio = '',
            location = '',
            languages = '',
            favoriteDestinations = '',
            dreamDestination = '',
            travelApp = '',
            instagram = '',
          } = userData;
          
          const profileFromDB = {
            username,
            bio,
            location,
            languages,
            favoriteDestinations,
            dreamDestination,
            travelApp,
            instagram,
            travelStyle: profileData.travelStyle,
          };
          
  
          setProfileData(profileFromDB);
          await AsyncStorage.setItem('@profile_data', JSON.stringify(profileFromDB));
        } else {
          console.warn("⚠️ No user data found in Firebase.");
        }
      });
  
      return () => {
        userRef && unsubscribe();
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

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        isEditing ? (
          <View style={{ flexDirection: 'row', gap: 20, marginRight: 15 }}>
            <TouchableOpacity onPress={saveProfile}>
              <FontAwesome name="save" size={20} color="green" />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit}>
              <FontAwesome name="times" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={{ marginRight: 15 }}>
            <FontAwesome name="edit" size={20} color="#1E3A8A" />
          </TouchableOpacity>
        )
      ),
    });
  }, [navigation, isEditing, profileData]);
  

  // ✅ Show loading indicator while fetching data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }
  
  const cancelEdit = async () => {
    setIsEditing(false);
  
    try {
      const stored = await AsyncStorage.getItem('@profile_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfileData(parsed);
      }
    } catch (err) {
      console.warn("⚠️ Could not load backup profile data on cancel.");
    }
  };
  

  const saveProfile = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User ID not found");
      return;
    }
  
    try {
      const db = getDatabase();
      const updates = {
        [`users/${user.id}/username`]: profileData.username,
        [`users/${user.id}/bio`]: profileData.bio,
        [`users/${user.id}/location`]: profileData.location,
        [`users/${user.id}/languages`]: profileData.languages,
        [`users/${user.id}/favoriteDestinations`]: profileData.favoriteDestinations,
        [`users/${user.id}/dreamDestination`]: profileData.dreamDestination,
        [`users/${user.id}/travelApp`]: profileData.travelApp,
        [`users/${user.id}/instagram`]: profileData.instagram,
      };
      
  
      await update(ref(db), updates);
      await AsyncStorage.setItem('@profile_data', JSON.stringify(profileData));
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error saving profile to Firebase:", error);
      Alert.alert("Save Failed", "Could not update your profile. Please try again.");
    }
  };
  

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
        <View style={styles.cardContainer}>
          <Text style={styles.cardHeader}>About</Text>

          {/* Username */}
          <Text style={{ fontWeight: 'bold' }}>Username / Display Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Add username / display name"
              value={profileData.username}
              onChangeText={(text) => setProfileData({ ...profileData, username: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.username || 'Add username / display name'}</Text>
          )}

          {/* Bio */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Bio / Travel Philosophy</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { height: 80 }]}
              multiline
              placeholder="Tell us about yourself"
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.bio || 'Tell us about yourself'}</Text>
          )}

          {/* Location */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Home Country / City</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Tell us where you're from"
              value={profileData.location}
              onChangeText={(text) => setProfileData({ ...profileData, location: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.location || "Tell us where you're from"}</Text>
          )}

          {/* Languages */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Languages Spoken</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="What languages do you speak?"
              value={profileData.languages}
              onChangeText={(text) => setProfileData({ ...profileData, languages: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.languages || 'What languages do you speak?'}</Text>
          )}

          {/* Favorite Destinations */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Top 3 Favorite Destinations</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Tell us what is your fav destinations"
              value={profileData.favoriteDestinations}
              onChangeText={(text) => setProfileData({ ...profileData, favoriteDestinations: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.favoriteDestinations || 'Tell us what is your fav destinations'}</Text>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardHeader}>Fun Facts</Text>

          {/* Dream Destination */}
          <Text style={{ fontWeight: 'bold' }}>Dream Destination</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Where do you dream to go?"
              value={profileData.dreamDestination}
              onChangeText={(text) => setProfileData({ ...profileData, dreamDestination: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.dreamDestination || 'Where do you dream to go?'}</Text>
          )}

          {/* Travel App */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Favorite Travel App</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="Share your favorite travel app"
              value={profileData.travelApp}
              onChangeText={(text) => setProfileData({ ...profileData, travelApp: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.travelApp || 'Share your favorite travel app'}</Text>
          )}

          {/* Instagram */}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Instagram Handle</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              placeholder="@yourhandle"
              value={profileData.instagram}
              onChangeText={(text) => setProfileData({ ...profileData, instagram: text })}
            />
          ) : (
            <Text style={styles.textValue}>{profileData.instagram || '@yourhandle'}</Text>
          )}
        </View>

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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  textValue: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
  },  
  cardContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    elevation: 3, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  }
  
});

export default ProfileScreen;
