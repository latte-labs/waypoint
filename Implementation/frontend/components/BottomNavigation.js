import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import styles from '../styles/BottomNavigatorStyle';
import HomeScreen from './HomeScreen';
import QuizScreen from './QuizScreen';

// Profile component placeholder
// Delete this when Profile component is made and imported
function Profile() {
  return (
    <Text>Placeholder Profile page</Text>
  )
}

// Setting component placeholder
// Delete this when Setting component is made and imported
function Setting() {
  return (
    <Text>Placeholder Settings page</Text>
  )
}

function BottomNavigation() {
  const Tab = createBottomTabNavigator()

  return (
   
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let icon;
            if (route.name === 'Home') {
              icon = '🏠';
            } else if (route.name === 'Quiz') {
              icon = '👤';
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
        <Tab.Screen name="Quiz" component={QuizScreen} />
        <Tab.Screen name="Profile" component={Profile} />
        <Tab.Screen name="Setting" component={Setting} />

      </Tab.Navigator>
    
  );
}

export default BottomNavigation;
