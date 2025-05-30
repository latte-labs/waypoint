import React, { useEffect, useState, useCallback, useLayoutEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert, ScrollView, TextInput, StatusBar, Keyboard, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import API_BASE_URL from '../../config';
import ImagePicker from 'react-native-image-crop-picker';
import { getDatabase, ref, update, onValue, get, remove } from '@react-native-firebase/database';
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CustomDropdown from './CustomDropdown';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring
} from 'react-native-reanimated';


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
    packingStyle: '',
    travelCompanion: '',
    budgetRange: '',
    planningHabit: '',
    tripRole: '',
  });
  const [completion, setCompletion] = useState(0);
  const [friendCount, setFriendCount] = useState(0);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const rotate = useSharedValue(0);
  const buttonsVisible = useSharedValue(0);

  const fabRotationStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

const leftButtonStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: withTiming(buttonsVisible.value ? -15 : 0, { duration: 300 }),
      },
    ],
    opacity: withTiming(buttonsVisible.value, { duration: 300 }),
  };
});

const farLeftButtonStyle = useAnimatedStyle(() => {
  return {
    transform: [
      {
        translateY: withTiming(buttonsVisible.value ? -30 : 0, { duration: 300 }),
      },
    ],
    opacity: withTiming(buttonsVisible.value, { duration: 300 }),
  };
});


  const calculateCompletion = (data) => {
    const fields = [
      'username', 'bio', 'location', 'languages',
      'favoriteDestinations', 'dreamDestination', 'travelApp',
      'instagram', 'packingStyle', 'travelCompanion',
      'budgetRange', 'planningHabit', 'tripRole',
    ];
  
    const filled = fields.filter(key => data[key]?.trim()).length;
    const percent = Math.round((filled / fields.length) * 100);
    setCompletion(percent);
  };
  
  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return;
  
      const db = getDatabase();
      const userRef = ref(db, `users/${user.id}`);
  
      const unsubscribe = onValue(userRef, async (snapshot) => {
        const userData = snapshot.val();
  
        if (userData) {
          // ✅ Load Profile Image
          const photoUrl = userData.profilePhotoUrl;
          const isPhotoValid = photoUrl && typeof photoUrl === 'string' && photoUrl.trim() !== '' && !photoUrl.includes('null');
          
          if (isPhotoValid) {
            const cacheBustedUrl = `${photoUrl}?ts=${Date.now()}`;
            setProfileImage(cacheBustedUrl);
            await AsyncStorage.setItem('profileImage', cacheBustedUrl);
          } else {
            setProfileImage(null); // ensure it's cleared from state
            await AsyncStorage.removeItem('profileImage');
            console.log("🚫 No valid image found. Removed from AsyncStorage and UI.");
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
            packingStyle = '',
            travelCompanion = '',
            budgetRange = '',
            planningHabit = '',
            tripRole = '',
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
            packingStyle,
            travelCompanion,
            budgetRange,
            planningHabit,
            tripRole,
            travelStyle: profileData.travelStyle,
          };
          
          
  
          setProfileData(profileFromDB);
          // ✅ Load Friend Count
          const friendsRef = ref(db, `/friends/${user.id}`);
          onValue(friendsRef, (snapshot) => {
            if (snapshot.exists()) {
              setFriendCount(Object.keys(snapshot.val()).length);
            } else {
              setFriendCount(0);
            }
          });
          calculateCompletion(profileFromDB);
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
      
          // ✅ Also load profileData fallback if Firebase fails or is slow
          const backup = await AsyncStorage.getItem('@profile_data');
          if (backup) {
            const profile = JSON.parse(backup);
          
            // 🚫 Avoid restoring image from old profile data if Firebase has cleared it
            const hasImage = await AsyncStorage.getItem('profileImage');
            if (!hasImage) {
              setProfileImage(null); // explicitly clear
            }
          
            setProfileData(profile);
            calculateCompletion(profile);
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
      title: 'My Profile',
      headerStyle: {
        backgroundColor: '#263986',
        shadowColor: 'transparent', // ✅ iOS shadow
        elevation: 0, // ✅ Android shadow
        borderBottomWidth: 0, // ✅ Extra precaution
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '600',
      },
      headerRight: () =>
        isEditing ? (
          <View style={{ flexDirection: 'row', gap: 20, marginRight: 15 }}>
            <TouchableOpacity onPress={saveProfile}>
              <FontAwesome name="save" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={cancelEdit}>
              <FontAwesome name="times" size={20} color="red" />
            </TouchableOpacity>
          </View>
        ) : null,
    });
  }, [navigation, isEditing, profileData]);
  
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
  
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });
  
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  
  

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
        [`users/${user.id}/packingStyle`]: profileData.packingStyle,
        [`users/${user.id}/travelCompanion`]: profileData.travelCompanion,
        [`users/${user.id}/budgetRange`]: profileData.budgetRange,
        [`users/${user.id}/planningHabit`]: profileData.planningHabit,
        [`users/${user.id}/tripRole`]: profileData.tripRole,
      };
      
      
  
      await update(ref(db), updates);
      await AsyncStorage.setItem('@profile_data', JSON.stringify(profileData));
      setIsEditing(false);
      Alert.alert("Success", "Your profile has been saved.");
    } catch (error) {
      console.error("❌ Error saving profile to Firebase:", error);
      Alert.alert("Save Failed", "Could not update your profile. Please try again.");
    }
  };

  

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        

        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              if (profileImage) {
                setShowPhotoOptions(true);
              } else {
                handleProfileImagePress();
              }
            }}            
            style={styles.profileImageWrapper}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.profileImage, styles.placeholderImage]}>
                <Text>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.profileContainer}>
        <TouchableOpacity
          style={styles.friendCountButton}
          onPress={() => navigation.navigate('Friends')}
        >
          <Text style={styles.friendCountText}>{friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}</Text>
        </TouchableOpacity>

          {uploading && (
            <ActivityIndicator size="small" color="#888" style={{ marginTop: 12 }} />
          )}

          <Text style={styles.name}>{user?.name || 'User Name'}</Text>
          <View style={styles.emailRow}>
            <FontAwesome
              name="envelope"
              size={14}
              color="gray"
              style={styles.emailIcon}
            />
            <Text style={styles.emailText}>{user?.email}</Text>
          </View>


          <Text style={styles.quizStatus}>
            {travelStyle?.name
              ? `Your travel style: ${travelStyle.name}`
              : "You haven't taken the quiz yet."}
          </Text>
          <View style={styles.progressBarWrapper}>
            <Text style={styles.progressText}>Profile Completion: {completion}%</Text>
            <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${completion}%`,
                  backgroundColor: completion === 100 ? '#28a745' : '#263986', // green if complete
                },
              ]}
            />
            </View>
          </View>

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

        <View style={styles.cardContainer}>
          <Text style={styles.cardHeader}>Travel Behavior</Text>
          {isEditing ? (
            <CustomDropdown
              label="Packing Style"
              value={profileData.packingStyle}
              options={['Light', 'Medium', 'Heavy']}
              onChange={(val) => setProfileData({ ...profileData, packingStyle: val })}
            />
          ) : (
            <>
              <Text style={{ fontWeight: 'bold' }}>Packing Style</Text>
              <Text style={styles.textValue}>{profileData.packingStyle || 'Not set'}</Text>
            </>
          )}

          {isEditing ? (
            <CustomDropdown
              label="Travel Companion"
              value={profileData.travelCompanion}
              options={['Solo', 'Partner', 'Family', 'Friends', 'Group']}
              onChange={(val) => setProfileData({ ...profileData, travelCompanion: val })}
            />
          ) : (
            <>
              <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Travel Companion</Text>
              <Text style={styles.textValue}>{profileData.travelCompanion || 'Not set'}</Text>
            </>
          )}

          {isEditing ? (
            <CustomDropdown
              label="Budget Range"
              value={profileData.budgetRange}
              options={['Budget', 'Mid-range', 'Luxury']}
              onChange={(val) => setProfileData({ ...profileData, budgetRange: val })}
            />
          ) : (
            <>
              <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Budget Range</Text>
              <Text style={styles.textValue}>{profileData.budgetRange || 'Not set'}</Text>
            </>
          )}
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardHeader}>Planning Habits</Text>
          {isEditing ? (
            <CustomDropdown
              label="Planning Habit"
              value={profileData.planningHabit}
              options={['Spontaneous', 'Semi-Planned', 'Itinerary-Focused']}
              onChange={(val) => setProfileData({ ...profileData, planningHabit: val })}
            />
          ) : (
            <>
              <Text style={{ fontWeight: 'bold' }}>Planning Habit</Text>
              <Text style={styles.textValue}>{profileData.planningHabit || 'Not set'}</Text>
            </>
          )}

          {isEditing ? (
            <CustomDropdown
              label="Trip Role"
              value={profileData.tripRole}
              options={['Planner', 'Follower']}
              onChange={(val) => setProfileData({ ...profileData, tripRole: val })}
            />
          ) : (
            <>
              <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Trip Role</Text>
              <Text style={styles.textValue}>{profileData.tripRole || 'Not set'}</Text>
            </>
          )}
        </View>
      </ScrollView>
      {showPhotoOptions && profileImage && (
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          paddingTop: 20,
          paddingBottom: 40,
          paddingHorizontal: 24,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
        }}>
          <View style={{ alignItems: 'center' }}>
          <Image
            source={{ uri: profileImage }}
            style={{
              width: '100%',
              height: 220,
              borderRadius: 12,
              marginBottom: 24,
              resizeMode: 'contain',
              backgroundColor: '#f3f3f3',
            }}
          />

          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#263986',
              paddingVertical: 12,
              borderRadius: 10,
              marginBottom: 14,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
            onPress={() => {
              setShowPhotoOptions(false);
              handleProfileImagePress();
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Upload New Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#e53935',
              paddingVertical: 12,
              borderRadius: 10,
              marginBottom: 14,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
            }}
            onPress={async () => {
              try {
                const db = getDatabase();
                await remove(ref(db, `users/${user.id}/profilePhotoUrl`));
                await AsyncStorage.removeItem('profileImage');
                setProfileImage(null);                
                setShowPhotoOptions(false);
              } catch (err) {
                console.error('Failed to delete photo:', err);
                Alert.alert('Error', 'Failed to delete profile photo.');
              }
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Delete Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowPhotoOptions(false)} style={{ alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 15, marginTop: 4 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

<View style={[styles.fabContainer, { bottom: keyboardHeight + 24 }]}>
  {/* Cancel Button */}
  <Animated.View style={[styles.fabButton, styles.cancelButtonBg, farLeftButtonStyle]}>
    <TouchableOpacity onPress={() => {
      buttonsVisible.value = 0;
      rotate.value = withSpring(0);
      setIsEditing(false);
    }}>
      <FontAwesome name="times" size={20} color="#fff" />
    </TouchableOpacity>
  </Animated.View>

  {/* Save Button */}
  <Animated.View style={[styles.fabButton, styles.saveButtonBg, leftButtonStyle]}>
    <TouchableOpacity onPress={() => {
      buttonsVisible.value = 0;
      rotate.value = withSpring(0);
      saveProfile();
    }}>
      <FontAwesome name="save" size={20} color="#fff" />
    </TouchableOpacity>
  </Animated.View>

  {/* Main FAB (Edit / Cancel Toggle) */}
  <Animated.View style={[styles.fabButton, styles.editButtonBg, fabRotationStyle]}>
    <TouchableOpacity
      onPress={() => {
        const isOpening = buttonsVisible.value === 0;
        buttonsVisible.value = isOpening ? 1 : 0;
        rotate.value = withSpring(isOpening ? 60 : 0);
        setIsEditing(isOpening); // 💡 toggle editing state
      }}
    >
      <FontAwesome name="pencil" size={20} color="#fff" />
    </TouchableOpacity>
  </Animated.View>
</View>


    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  container: { flexGrow: 1, backgroundColor: '#fff' },
  travelStyleContainer: { alignItems: 'center', marginVertical: 10 },
  travelStyleName: { fontSize: 16, fontWeight: '600', color: '#FF6F00' },
  travelStyleDescription: { fontSize: 14, color: '#555', textAlign: 'center', paddingHorizontal: 20 },
  noTravelStyle: { fontSize: 14, fontStyle: 'italic', color: '#888', marginBottom: 10 },
  headerContainer: {
    backgroundColor: '#263986',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 60,
    paddingBottom: 70,
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  profileImageWrapper: {
    position: 'absolute',
    top: 70,
    zIndex: 2,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#f9f9f9',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  editProfileButton: {
    marginTop: 80,
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  editProfileText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    // marginTop: 40,
  },
  
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
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
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center', // vertical alignment
    justifyContent: 'center', // horizontal center (optional if centered on screen)
    marginTop: 4,
  },
  
  emailIcon: {
    marginRight: 6,
  },
  
  emailText: {
    fontSize: 14,
    color: 'gray',
    lineHeight: 16, // makes the text vertically centered
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
    borderColor: 'white',
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
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginTop: 6,
    fontSize: 14,
  },  
  textValue: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
    lineHeight: 20,
  },
  
  cardContainer: {
    backgroundColor: '#f9f9f9',
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderLeftColor: '#263986', 
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },  
  cardHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#263986',
    borderBottomWidth: 2,
    borderBottomColor: '#d0d8ff',
    paddingBottom: 6,
    marginBottom: 16,
  },
  
  dropdown: {
    marginTop: 4,
    borderColor: '#ccc',
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 12,
  },
  
  saveButton: {
    backgroundColor: '#1E1E1E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  
  cancelButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  
  cancelText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  progressBarWrapper: {
    width: '80%',
    marginTop: 14,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#263986',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    zIndex: 10,
  },  
  
  fabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  
  editButtonBg: {
    backgroundColor: '#263986',
  },
  
  saveButtonBg: {
    backgroundColor: '#1E1E1E',
  },
  
  cancelButtonBg: {
    backgroundColor: '#e53935',
  },
  friendCountButton: {
    marginTop: 80,
    backgroundColor: '#263986',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  friendCountText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  
  
});

export default ProfileScreen;
