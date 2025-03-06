import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/BottomNavigatorStyle';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { BlurView } from '@react-native-community/blur';
import InteractiveRecommendations from '../screens/InteractiveRecommendations';
import ChatbotScreen from '../screens/ChatbotScreen';

// Dummy Placeholder Component (prevents navigation errors)
const MorePlaceholder = () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
const Tab = createBottomTabNavigator();

function BottomNavigation() {

  const [menuVisible, setMenuVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(animation, {
      toValue: menuVisible ? 0 : 1, // Toggle between open and closed
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    setMenuVisible(false);
    Animated.timing(animation, {
      toValue: 0, // Hide menu
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  const navigateToScreen = (screen) => {
    closeMenu(); // Close the popup menu first
    navigation.navigate(screen); // Navigate to the selected screen
  };

  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust height of the popup
  });

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon;
            if (route.name === 'Home') {
              icon = '🏠';
            } else if (route.name === 'Map') {
              icon = '📍';
            } else if (route.name === 'Chatbot') {
              icon = '🤖';
            } else if (route.name === 'More') {
              icon = '➕'; // More tab icon
            }
            return <Text style={{ fontSize: size, color, paddingBottom: 25, }}>{icon}</Text>;
          },
          tabBarActiveTintColor: '#FF6F00',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map" component={InteractiveRecommendations} />
        <Tab.Screen name="Chatbot" component={ChatbotScreen} />
        {/* "More" tab opens the small popup menu instead of navigating */}
        <Tab.Screen
          name="More"
          component={MorePlaceholder} // Placeholder, will never be used
          listeners={() => ({
            tabPress: (e) => {
              e.preventDefault(); // Prevent navigation
              toggleMenu();
            },
          })}
        />
      </Tab.Navigator>
      {/* Detect Tap Outside the Menu & Close It */}
      {menuVisible && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu}>
          <BlurView style={styles.blurBackground} blurType="light" blurAmount={10} />
        </TouchableOpacity>
      )}

      {/* Small Animated Popup Menu */}
      <Animated.View style={[styles.popupMenu, { height: menuHeight }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Profile')}>
          <Text style={styles.menuText}>👤 Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Settings')}>
          <Text style={styles.menuText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Game')}>
          <Text style={styles.menuText}>⭐ Game</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Events')}>
          <Text style={styles.menuText}>🔔 Events</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

export default BottomNavigation;
