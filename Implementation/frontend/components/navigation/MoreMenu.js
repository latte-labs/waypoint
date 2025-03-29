import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import styles from "../../styles/CheckInScreenStyles";


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
            <TouchableOpacity onPress={() => handleNavigate("Profile")} style={{ width: '90%' }}>
                <View style={navigationStyles.profileHeader}>
                    {profileImage ? (
                        <Image
                            source={{ uri: profileImage }}
                            style={navigationStyles.profileHeaderImage}
                        />
                    ) : (
                        <Icon name="user-circle" size={60} color="#ccc" style={{ marginRight: 15 }} />
                    )}
                    <Text style={navigationStyles.profileHeaderName}>{profileName}</Text>
                </View>
            </TouchableOpacity>

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

            <View style={{ marginTop: 40 }}>
                <Button title="Log Out" onPress={handleLogout} />
            </View>
        </View>
    )
}

export default MoreMenu;
