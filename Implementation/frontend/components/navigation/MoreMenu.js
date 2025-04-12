import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing
  } from 'react-native-reanimated';
  

const MoreMenu = ({ closeMenu }) => {
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null);
    const [profileName, setProfileName] = useState("Guest");

    useEffect(() => {
        // Retrieve the profile image from AsyncStorage on mount
        const fetchProfileData = async () => {
            try {
                const storedImage = await AsyncStorage.getItem('profileImage');
                if (storedImage) {
                    setProfileImage(storedImage);
                }
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setProfileName(userData.name || "Guest");
                }
            } catch (error) {
                console.error('Error retrieving profile image:', error);
            }
        };

        fetchProfileData();
    }, []);

    const handleNavigate = (screen) => {
        closeMenu(); //closing menu before navigating
        navigation.navigate("Main", { screen: screen });
    }

    // ✅ Handle Logout
    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove([
                'user',
                'last_searched_weather',
                'profileImage',
                'recent_itineraries'
            ]);
            navigation.replace('Login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    

    return (
        <View style={navigationStyles.moreContainer}>
            {/* Profile Card */}
            <View style={{
                backgroundColor: '#F3F4F6',
                borderRadius: 16,
                paddingVertical: 20,
                paddingHorizontal: 16,
                alignItems: 'center',
                width: '90%',
                alignSelf: 'center',
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                }}>
                <TouchableOpacity onPress={() => handleNavigate("Profile")} activeOpacity={0.85}>
                    <View style={{ alignItems: 'center' }}>
                    {profileImage ? (
                        <Image
                        source={{ uri: profileImage }}
                        style={{
                            width: 90,
                            height: 90,
                            borderRadius: 45,
                            borderWidth: 2,
                            borderColor: '#fff',
                            backgroundColor: '#e5e7eb',
                            marginBottom: 12,
                        }}
                        />
                    ) : (
                        <Icon name="user-circle" size={90} color="#ccc" style={{ marginBottom: 12 }} />
                    )}

                    <Text style={{
                        fontSize: 16,
                        fontWeight: '700',
                        color: '#111',
                        textAlign: 'center',
                    }}>
                        My Profile
                    </Text>
                    <Text style={{
                        fontSize: 14,
                        color: '#6B7280',
                        marginTop: 4,
                        textAlign: 'center',
                    }}>
                        {profileName}
                    </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => handleNavigate("Settings")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="cog" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Settings</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleNavigate("Chatbot")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="robot" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Chatbot</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleNavigate("CheckIn")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="sign-in-alt" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Check In</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleNavigate("Badges")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="trophy" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Achievements</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleNavigate("Friends")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="user-friends" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Friends</Text>
                </View>
            </TouchableOpacity>

            <View style={{ marginTop: 40 }}>
                <Button title="Log Out" onPress={handleLogout} />
            </View>
        </View>
    )
}

export default MoreMenu;
