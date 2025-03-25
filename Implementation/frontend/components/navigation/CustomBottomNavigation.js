import React from "react";
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { navigationStyles } from "../../styles/NavigationStyles";
import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import MoreMenu from "./MoreMenu";
import { BlurView } from "@react-native-community/blur";
import { StyleSheet } from "react-native";
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const CustomBottomNavigation = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const [activeRouteName, setActiveRouteName] = useState("Home");
    const [isMoreMenuVisible, setMoreMenuVisible] = useState(false);

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

            // Ensure Home is set when navigating into "Main"
            if (currentRoute === "Main") {
                currentRoute = "Home";
            }

            setActiveRouteName(currentRoute); // Update only if valid
            console.log("Active Route:", currentRoute); // Debugging Log
        }, [navigation, route]) // Runs only when navigation or route changes
    );

    // Screens where bottom nav should be hidden
    const hiddenScreens = ['QuizScreen', 'LocationPermissions'];
    if (hiddenScreens.includes(activeRouteName)) return null; // Hides the nav

    const menuItems = [
        { name: "Home", icon: "home" },
        { name: "Map", icon: "map-marker" },
        { name: "Itinerary", icon: "list-alt" },
        { name: "More", icon: "bars" }
      ];      

    return (
        <>
            <View style={navigationStyles.navContainer}>
                {menuItems.map((item) => {
                    const isActive = activeRouteName === item.name; // Check if the current screen is active
                    if (item.name === "More") {
                        return (
                            <TouchableOpacity
                                key="More"
                                style={navigationStyles.navItem}
                                onPress={() => setMoreMenuVisible(true)}
                            >
                                <View style={navigationStyles.navContent}>
                                    <FontAwesome name={item.icon} size={20} color={isActive ? "#1E3A8A" : "#444"} style={navigationStyles.navIcon} />
                                 {activeRouteName === item.name && (
                                        <Text style={navigationStyles.navText}>{item.name}</Text>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    } else {

                        return (
                            <TouchableOpacity
                                key={item.name}
                                style={[navigationStyles.navItem, isActive && navigationStyles.navItemActive]} // Apply active styles
                                onPress={() => {
                                    navigation.navigate("Main", { screen: item.name })
                                    setTimeout(() => {
                                        setActiveRouteName(item.name); // ✅ Update active state **after** navigation
                                    }, 100);
                                }
                                }


                            >
                                <View style={[navigationStyles.navContent, isActive && navigationStyles.navContentActive]}>
                                <FontAwesome
                                    name={item.icon}
                                    size={20}
                                    color={isActive ? "#FFF" : "#444"}
                                    style={navigationStyles.navIcon}
                                    />
                                    {isActive && <Text style={navigationStyles.navText}>{item.name}</Text>}
                                </View>
                            </TouchableOpacity>
                        );
                    }
                })}
            </View>

            <Modal
                visible={isMoreMenuVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setMoreMenuVisible(false)}
            >
                <View style={{ flex: 1 }}>
                    {/* Blurred background */}
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        pointerEvents="none"
                        blurType="light"
                        blurAmount={5}
                    />

                    {/* A full-screen touchable to dismiss the modal when tapping outside */}
                    <TouchableWithoutFeedback onPress={() => setMoreMenuVisible(false)}>
                        <View style={{ flex: 1 }} />
                    </TouchableWithoutFeedback>

                    {/* Modal content on the right side */}
                    <View style={navigationStyles.modalContainer}>
                        <MoreMenu closeMenu={() => setMoreMenuVisible(false)} />
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default CustomBottomNavigation;