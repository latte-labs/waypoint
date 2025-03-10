import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigationStyles } from "../../styles/NavigationStyles";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

const CustomBottomNavigation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [activeRouteName, setActiveRouteName] = useState("Home");

    useFocusEffect(
        React.useCallback(() => {
            let currentRoute = route.name || "Home"; // Default to Home
            const state = navigation.getState();
            if (state?.routes?.length) {
                const mainRoute = state.routes.find(r => r.name === "Main");
                if (mainRoute?.state?.routes?.length) {
                    const activeIndex = mainRoute.state.index;
                    currentRoute = mainRoute.state.routes[activeIndex]?.name || "Home";
                }
            }

            // ✅ Ensure Home is set when navigating into "Main"
            if (currentRoute === "Main") {
                currentRoute = "Home";
            }

            setActiveRouteName(currentRoute); // ✅ Update only if valid
            console.log("✅ Active Route:", currentRoute); // ✅ Debugging Log
        }, [navigation, route]) // ✅ Runs only when navigation or route changes
    );

    // Screens where bottom nav should be hidden
    const hiddenScreens = ['QuizScreen', "Map"];
    if (hiddenScreens.includes(activeRouteName)) return null; // Hides the nav

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
                        onPress={() => {
                            //setActiveRouteName(item.name);

                            navigation.navigate("Main", { screen: item.name })
                            setTimeout(() => {
                                setActiveRouteName(item.name); // ✅ Update active state **after** navigation
                            }, 100);
                        }
                        }


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