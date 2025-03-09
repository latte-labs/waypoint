import React from "react";
import { View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import { useNavigation } from "@react-navigation/native";

const MoreMenu = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>

            {/** Profile Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Profile")} style={styles.menuItem}>
                <Text style={styles.menuText}>👤 Profile</Text>
            </TouchableOpacity>

            {/** Settings Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.menuItem}>
                <Text style={styles.menuText}>⚙️ Settings</Text>
            </TouchableOpacity>

            {/** Chatbot Screen */}
            <TouchableOpacity onPress={() => navigation.navigate("Chatbot")} style={styles.menuItem}>
                <Text style={styles.menuText}>🤖 Chatbot</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    menuItem: {
      padding: 15,
    },
    menuText: {
      fontSize: 18,
    },
  });
  
  export default MoreMenu;
  