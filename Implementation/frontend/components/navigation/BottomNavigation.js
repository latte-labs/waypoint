import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, Animated, Easing } from 'react-native';
import styles from '../../styles/BottomNavigatorStyle';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SafeAreaWrapper from '../screens/SafeAreaWrapper';

// Dummy Placeholder Component (prevents navigation errors)
const MorePlaceholder = () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
const Tab = createBottomTabNavigator();

function BottomNavigation() {

  const [menuVisible, setMenuVisible] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    Animated.timing(animation, {
      toValue: menuVisible ? 0 : 1, // Toggle between open and closed
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
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
            } else if (route.name === 'Quiz') {
              icon = '📚';
            } else if (route.name === 'Profile') {
              icon = '👤';
            } else if (route.name === 'Setting') {
              icon = '⚙️';
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
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Setting" component={SettingsScreen} />
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
      {/* Small Animated Popup Menu */}
      <Animated.View style={[styles.popupMenu, { height: menuHeight }]}>
        <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Favorites')}>
          <Text style={styles.menuText}>⭐ Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Notifications')}>
          <Text style={styles.menuText}>🔔 Notifications</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}

export default BottomNavigation;
