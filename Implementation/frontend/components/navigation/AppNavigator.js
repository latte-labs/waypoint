import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ItineraryListScreen from '../screens/itinerary/ItineraryListScreen';
import InteractiveRecommendations from '../screens/InteractiveRecommendations';
import BottomNavigation from './BottomNavigation';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QuizScreen from '../screens/QuizScreen';
import SafeAreaWrapper from '../screens/SafeAreaWrapper';
import CustomBottomNavigation from './CustomBottomNavigation';
import MoreMenu from './MoreMenu';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <View style={styles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,  // Backswipe works
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="InteractiveRecommendations" component={InteractiveRecommendations} />
        <Stack.Screen name="ItineraryList" component={ItineraryListScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name="MoreMenu">
          {() => <MoreMenu />}
        </Stack.Screen>
      </Stack.Navigator>

      {/* Persistent Bottom Navigation */}
      <CustomBottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default AppNavigator;
