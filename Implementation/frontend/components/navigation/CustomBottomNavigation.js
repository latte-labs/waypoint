import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigationStyles } from "../../styles/NavigationStyles";

const CustomBottomNavigation = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const state = navigation.getState();
    let activeRouteName = route.name;
    //const activeRouteName = state.routes?.find(r => r.name === "Main")?.state?.routes?.[state.routes?.find(r => r.name === "Main")?.state?.index]?.name || route.name;
    
    // If navigating inside "Main", extract the focused route inside it
    if (state?.routes) {
        const mainRoute = state.routes.find(r => r.name === "Main");
        if (mainRoute?.state?.routes) {
            const activeIndex = mainRoute.state.index;
            activeRouteName = mainRoute.state.routes[activeIndex].name;
        }
    }
    console.log("Active Route:", activeRouteName); // ✅ Debugging Log

    // Screens where bottom nav should be hidden
    const hiddenScreens = ['QuizScreen', "Map"];
    if (hiddenScreens.includes(route.name)) return null // Hides the nav

    const menuItems = [
        { name: "Home", icon: "🏠" },
        { name: "Map", icon: "📍" },
        { name: "Itinerary", icon: "🗺" },
        { name: "More", icon: "≡" }
    ];

    return (
        <View style={navigationStyles.navContainer}>
            {menuItems.map((item) => {
                const isActive = activeRouteName === item.name; // Check if the current screen is active
                
                return (
                    <TouchableOpacity
                        key={item.name}
                        style={[navigationStyles.navItem, isActive && navigationStyles.navItemActive]} // Apply active styles
                        onPress={() => navigation.navigate("Main", { screen: item.name })}
                    >
                        <View style={[navigationStyles.navContent, isActive && navigationStyles.navContentActive]}>
                            <Text style={navigationStyles.navIcon}>{item.icon}</Text>
                            {isActive && <Text style={navigationStyles.navText}>{item.name}</Text>} 
                        </View> 
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
  
  export default CustomBottomNavigation;