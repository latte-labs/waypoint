import React from "react";
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { navigationStyles } from "../../styles/NavigationStyles";

const MoreMenu = () => {
    const navigation = useNavigation();

    return (
        <View style={navigationStyles.moreContainer}>

            {/** Profile Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>👤 Profile</Text>
            </TouchableOpacity>

            {/** Settings Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>⚙️ Settings</Text>
            </TouchableOpacity>

            {/** Chatbot Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Chatbot")} style={navigationStyles.moreMenuItem}>
                <Text style={navigationStyles.moreMenuText}>🤖 Chatbot</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MoreMenu;
  