import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import styles from '../styles/BottomNavigatorStyle';
import HomeScreen from './HomeScreen';
import QuizScreen from './QuizScreen';

function BottomNavigation() {
  const Tab = createBottomTabNavigator();

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
        
      </Tab.Navigator>
    
  );
}

export default BottomNavigation;
