import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Button, Image } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';


const MoreMenu = ({ closeMenu }) => {
    const navigation = useNavigation();
    const [profileImage, setProfileImage] = useState(null);

    useEffect(() => {
        // Retrieve the profile image from AsyncStorage on mount
        const fetchProfileImage = async () => {
            try {
                const storedImage = await AsyncStorage.getItem('profileImage');
                if (storedImage) {
                    setProfileImage(storedImage);
                }
            } catch (error) {
                console.error('Error retrieving profile image:', error);
            }
        };

        fetchProfileImage();
    }, []);


    const handleNavigate = (screen) => {
        closeMenu(); //closing menu before navigating
        navigation.navigate("Main", { screen: screen });
    }

    // ✅ Handle Logout
    const handleLogout = async () => {
        await AsyncStorage.removeItem('user'); // Clear stored user data
        navigation.replace('Login'); // Redirect to Login
    };

    return (
        <View style={navigationStyles.moreContainer}>
            {/* Display Profile Image */}
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
                {profileImage ? (
                    <Image
                        source={{ uri: profileImage }}
                        style={{ width: 100, height: 100, borderRadius: 50 }}
                    />
                ) : (
                    <Icon name="user" size={50} color="#ccc" style={{ marginRight: 10 }} />
                )}
            </View>

            <TouchableOpacity onPress={() => handleNavigate("Profile")} style={navigationStyles.moreMenuItem}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon name="user" size={20} color="#1E3A8A" style={{ marginRight: 12 }} />
                    <Text style={navigationStyles.moreMenuText}>Profile</Text>
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

            <Button title="Log Out" onPress={(handleLogout)} />
        </View>
    )
}

export default MoreMenu;
