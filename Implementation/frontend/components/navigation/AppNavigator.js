import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from './BottomNavigation';
import QuizScreen from '../screens/QuizScreen';  // ✅ Include separately for navigation
import SafeAreaWrapper from '../screens/SafeAreaWrapper';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomNavigation} />
      <Stack.Screen name="QuizScreen" component={() => (
        <SafeAreaWrapper>
          <QuizScreen />
        </SafeAreaWrapper>
      )} />
    </Stack.Navigator>

  );
}

export default AppNavigator;
