import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import BottomNavigation from './BottomNavigation';
import QuizScreen from '../screens/QuizScreen';  // ✅ Include separately for navigation
import SafeAreaWrapper from '../screens/SafeAreaWrapper';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <SafeAreaWrapper>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={BottomNavigation} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} /> 
      </Stack.Navigator>
    </SafeAreaWrapper>
  );
}

export default AppNavigator;
