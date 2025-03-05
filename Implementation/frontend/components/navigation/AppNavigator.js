import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import BottomNavigation from './BottomNavigation';
import QuizScreen from '../screens/QuizScreen';  // ✅ Include separately for navigation

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomNavigation} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />  {/* ✅ This allows navigation */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
