import React from "react";
import { View, Text, TouchableOpacity, Button } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';

const MoreMenu = ({ closeMenu }) => {
    const navigation = useNavigation();

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

            {/** Profile Screen */}
            <TouchableOpacity onPress={() => handleNavigate("Profile")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>👤 Profile</Text>
            </TouchableOpacity>

            {/** Settings Screen */}
            <TouchableOpacity onPress={() => handleNavigate("Settings")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>⚙️ Settings</Text>
            </TouchableOpacity>

            {/** Chatbot Screen */}
            <TouchableOpacity onPress={() => handleNavigate("Chatbot")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>🤖 Chatbot</Text>
            </TouchableOpacity>

            <Button title="Log Out" onPress={(handleLogout)} />
        </View>
    )
}

export default MoreMenu;
