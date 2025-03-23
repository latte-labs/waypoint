import React from "react";
import { View, Text, TouchableOpacity, Button } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';


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
