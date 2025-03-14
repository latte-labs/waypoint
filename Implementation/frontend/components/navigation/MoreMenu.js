import React from "react";
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";

const MoreMenu = ({closeMenu}) => {
    const navigation = useNavigation();

    const handleNavigate = (screen) => {
        closeMenu(); //closing menu before navigating
        navigation.navigate(screen);
    }

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
        </View>
    )
}

export default MoreMenu;
  