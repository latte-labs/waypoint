import React, { useState, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, Animated, View, TouchableWithoutFeedback } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import styles from '../../styles/BottomNavigatorStyle';
import HomeScreen from '../screens/HomeScreen';
import InteractiveRecommendations from '../screens/InteractiveRecommendations';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ItineraryListScreen from '../screens/itinerary/ItineraryListScreen';
import { BlurView } from '@react-native-community/blur';

// Dummy Placeholder Component for "More" tab
const MorePlaceholder = () => <View style={{ flex: 1, backgroundColor: 'transparent' }} />;

const Tab = createBottomTabNavigator();

function BottomNavigation() {
  const [menuVisible, setMenuVisible] = useState(false);
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
      useNativeDriver: false,
    }).start();
  };

  // Closes "More" Menu
  const closeMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  // Navigate to screen and close menu
  const navigateToScreen = (screen) => {
    closeMenu();
    navigation.navigate(screen);
  };

  // Popup menu animation height
  const menuHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 200], // Adjust height of the popup
  });

  return (
    <TouchableWithoutFeedback onPress={closeMenu}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Home: '🏠',
                Map: '📍',
                Itinerary: '🗺',
                More: '≡',
              };
              return <Text style={{ fontSize: size, color, paddingBottom: 25 }}>{icons[route.name]}</Text>;
            },
            tabBarActiveTintColor: '#FF6F00',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: styles.tabBar,
            tabBarHideOnKeyboard: true,
            tabBarLabelStyle: styles.tabBarLabel,
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Map" component={InteractiveRecommendations} options={{ tabBarStyle: { display: "none" } }} />
          <Tab.Screen name="Itinerary" component={ChatbotScreen} />
          <Tab.Screen
            name="More"
            component={MorePlaceholder}
            listeners={{
              tabPress: (e) => {
                e.preventDefault();
                toggleMenu();
              },
            }}
          />
        </Tab.Navigator>

        {/* Detect Tap Outside to Close "More" Popup */}
        {menuVisible && !isMapScreen && (
          <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeMenu}>
            <BlurView style={styles.blurBackground} blurType="light" blurAmount={10} />
          </TouchableOpacity>
        )}

        {/* Small Animated Popup Menu */}
        {menuVisible && !isMapScreen && (
          <Animated.View style={[styles.popupMenu, { height: menuHeight }]}>
            {[
              { label: "👤 Profile", screen: "Profile" },
              { label: "⚙️ Settings", screen: "Settings" },
              { label: "🤖 Chatbot", screen: "ChatBot" },
              { label: "⭐ Game", screen: "" },
              { label: "🔔 Events", screen: "" },
            ].map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={() => navigateToScreen(item.screen)}>
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

export default BottomNavigation;
