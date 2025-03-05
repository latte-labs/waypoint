import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import styles from '../../styles/BottomNavigatorStyle';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import SafeAreaWrapper from '../screens/SafeAreaWrapper';


const Tab = createBottomTabNavigator();

function BottomNavigation() {
  return (
    <SafeAreaWrapper>
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
          }
          return <Text style={{ fontSize: size, color }}>{icon}</Text>;
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
        <Tab.Screen name="Recommendations" component={RecommendationsScreen} />
      </Tab.Navigator>
    </SafeAreaWrapper>
  );
}

export default BottomNavigation;
