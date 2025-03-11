import React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ItineraryListScreen from '../screens/itinerary/ItineraryListScreen';
import InteractiveRecommendations from '../screens/InteractiveRecommendations';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QuizScreen from '../screens/QuizScreen';
import CustomBottomNavigation from './CustomBottomNavigation';
import MoreMenu from './MoreMenu';
import { navigationStyles } from '../../styles/NavigationStyles';
import ItineraryDetailScreen from '../screens/itinerary/ItineraryDetailScreen';
import ItineraryDayScreen from '../screens/itinerary/ItineraryDayScreen';
import ItineraryFormScreen from '../screens/itinerary/ItineraryFormScreen';
import LocationPermissions from '../screens/permissions/LocationPermissions';


const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <View style={navigationStyles.container}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,  // Backswipe works
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Map" component={InteractiveRecommendations} />
        <Stack.Screen name="Itinerary" component={ItineraryListScreen} />
        <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
        <Stack.Screen name="ItineraryDay" component={ItineraryDayScreen} />
        <Stack.Screen name="ItineraryForm" component={ItineraryFormScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name="Location" component={LocationPermissions} />
        <Stack.Screen name="More">
          {() => <MoreMenu />}
        </Stack.Screen>
      </Stack.Navigator>

      {/* Persistent Bottom Navigation */}
      <CustomBottomNavigation />
    </View>
  );
}

export default AppNavigator;
