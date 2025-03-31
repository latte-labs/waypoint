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
import { navigationStyles } from '../../styles/NavigationStyles';
import ItineraryDetailScreen from '../screens/itinerary/ItineraryDetailScreen';
import ItineraryDayScreen from '../screens/itinerary/ItineraryDayScreen';
import ItineraryFormScreen from '../screens/itinerary/ItineraryFormScreen';
import InviteCollaboratorsScreen from '../screens/itinerary/InviteCollaboratorsScreen';
import MapCheckInScreen from '../screens/MapCheckInScreen';
import AchievementsScreen from '../screens/AchievementsScreen';
import ProfileStack from '../screens/ProfileStack';
import AddFriendsScreen from '../screens/AddFriendsScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';




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
        <Stack.Screen name="InviteCollaborators" component={InviteCollaboratorsScreen} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name='CheckIn' component={MapCheckInScreen} />
        <Stack.Screen name='Badges' component={AchievementsScreen} />
        <Stack.Screen name='Profile' component={ProfileStack} />
        <Stack.Screen name='Friends' component={AddFriendsScreen} />
        <Stack.Screen name='PublicProfile' component={PublicProfileScreen} />
      </Stack.Navigator>

      {/* Persistent Bottom Navigation */}
      <CustomBottomNavigation />
    </View>
  );
}

export default AppNavigator;
