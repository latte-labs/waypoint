import React, { useState, useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, Animated, Easing, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../styles/BottomNavigatorStyle';
import HomeScreen from '../screens/HomeScreen';
import { BlurView } from '@react-native-community/blur';
import InteractiveRecommendations from '../screens/InteractiveRecommendations';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Dummy Placeholder Component for "More" tab
const MorePlaceholder = () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
const Tab = createBottomTabNavigator();

function BottomNavigation() {
  const tabBarAnimation = useRef(new Animated.Value(1)).current;
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const timeoutRef = useRef(null);
  const animation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const route = useRoute();
  const isMapScreen = route.name === "Map"; // Detect if on Interactive Map Screen

  // Toggles "More" Menu
  const toggleMenu = () => {
    setMenuVisible((prev) => !prev);
    Animated.timing(animation, {
      toValue: menuVisible ? 0 : 1,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  // Closes "More" Menu
  const closeMenu = () => {
    setMenuVisible(false);
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  };

  // Hide Bottom Navigation after 5 seconds of inactivity
  const resetInactivityTimer = () => {
    setIsTabBarVisible(true); // Show the bottom navigation
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsTabBarVisible(false); // Hide the bottom navigation after 5s
    }, 5000);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => clearTimeout(timeoutRef.current); // Cleanup
  }, []);

  const navigateToScreen = (screen) => {
    closeMenu();
    navigation.navigate(screen);
  };

  // Animates Popup Menu
  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust height of the popup
  });

  return (
    <>
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={resetInactivityTimer}
        pointerEvents="auto"
      >
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let icon;
              if (route.name === 'Home') icon = '🏠';
              else if (route.name === 'Map') icon = '📍';
              else if (route.name === 'Itinerary') icon = '🗺';
              else if (route.name === 'More') icon = '≡';

              return <Text style={{ fontSize: size, color, paddingBottom: 25 }}>{icon}</Text>;
            },
            tabBarActiveTintColor: '#FF6F00',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: isMapScreen ? { display: "none" } : [styles.tabBar, {
              transform: [{
                translateY: tabBarAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [200, 0],
                }),
              }],
              zIndex: 100,
            }],
            tabBarHideOnKeyboard: true,
            tabBarLabelStyle: styles.tabBarLabel,
            headerShown: false,
          })}
          screenListeners={{ focus: resetInactivityTimer }}
        >
          <Tab.Screen name="Home" component={HomeScreen} listeners={{ focus: resetInactivityTimer }} />
          <Tab.Screen name="Map" component={InteractiveRecommendations} options={{ tabBarStyle: { display: "none" } }} />
          <Tab.Screen name="Itinerary" component={ChatbotScreen} listeners={{ focus: resetInactivityTimer }} />
          <Tab.Screen name="More" component={MorePlaceholder} listeners={() => ({
            tabPress: (e) => {
              e.preventDefault();
              resetInactivityTimer();
              toggleMenu();
            },
          })} />
        </Tab.Navigator>

        {/* Detect Tap Outside & Close "More" Menu */}
        {menuVisible && !isMapScreen && (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu}>
            <BlurView style={styles.blurBackground} blurType="light" blurAmount={10} />
          </TouchableOpacity>
        )}

        {/* Small Animated Popup Menu */}
        {menuVisible && !isMapScreen && (
          <Animated.View style={[styles.popupMenu, { height: menuHeight }]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Profile')}>
              <Text style={styles.menuText}>👤 Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('Settings')}>
              <Text style={styles.menuText}>⚙️ Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen('ChatBot')}>
              <Text style={styles.menuText}>🤖 Chatbot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Game')}>
              <Text style={styles.menuText}>⭐ Game</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Go to Events')}>
              <Text style={styles.menuText}>🔔 Events</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </TouchableOpacity>
    </>
  );
}

export default BottomNavigation;
