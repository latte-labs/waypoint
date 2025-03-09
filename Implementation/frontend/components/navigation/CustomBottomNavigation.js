import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const CustomBottomNavigation = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Screens where bottom nav should be hidden
    const hiddenScreens = ['QuizScreen', "Map"];
    if (hiddenScreens.includes(route.name)) return null // Hides the nav

    return (
        <View style={styles.navContainer}>

            {/** Home Screen */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Main", {screen: "Home"})}>
                <Text style={styles.navText}>🏠 Home</Text>
            </TouchableOpacity>

            {/** Map Screen */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Main", {screen: "InteractiveRecommendations"})}>
                <Text style={styles.navText}>📍 Map</Text>
            </TouchableOpacity>

            {/** Map Screen */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Main", { screen: "ItineraryList"})}>
                <Text style={styles.navText}>🗺 Itinerary</Text>
            </TouchableOpacity>

            {/** More Menu */}
            <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate("Main", {screen: "MoreMenu"})}>
                <Text style={styles.navText}>≡ More</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    navContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      height: 60,
      backgroundColor: "#FFF",
      borderTopWidth: 1,
      borderColor: "#DDD",
    },
    navItem: {
      padding: 10,
    },
    navText: {
      fontSize: 14,
    },
  });
  
  export default CustomBottomNavigation;