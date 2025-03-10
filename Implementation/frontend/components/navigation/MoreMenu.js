import React from "react";
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";

const MoreMenu = () => {
    const navigation = useNavigation();

    return (
        <View style={navigationStyles.container}>

            {/** Profile Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={navigationStyles.menuItem}>
                <Text style={navigationStyles.menuText}>👤 Profile</Text>
            </TouchableOpacity>

            {/** Settings Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={navigationStyles.menuItem}>
                <Text style={navigationStyles.menuText}>⚙️ Settings</Text>
            </TouchableOpacity>

            {/** Chatbot Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Chatbot")} style={navigationStyles.menuItem}>
                <Text style={navigationStyles.menuText}>🤖 Chatbot</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MoreMenu;
  