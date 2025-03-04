import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from './components/navigation/BottomNavigation';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import InteractiveMapScreen from './components/screens/InteractiveMapScreen';
import firebase from '@react-native-firebase/app';
import InteractiveRecommendations from './components/screens/InteractiveRecommendations';
import ChatbotScreen from './components/screens/ChatbotScreen';

const Stack = createStackNavigator();

function App() {
  useEffect(() => {
    if (!firebase.apps.length) {
      firebase.initializeApp()
        .then(() => console.log("✅ Firebase initialized successfully"))
        .catch(error => console.error("🔥 Firebase initialization error:", error));
    } else {
      console.log("✅ Firebase already initialized.");
    }
  }, []);

  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}> 
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Main" component={BottomNavigation} />
          <Stack.Screen name="InteractiveMap" component={InteractiveMapScreen} />
          <Stack.Screen name='InteractiveRecommendations' component={InteractiveRecommendations} />
          <Stack.Screen name='ChatBot' component={ChatbotScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
