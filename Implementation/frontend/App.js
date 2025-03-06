import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';  
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from './components/navigation/BottomNavigation';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import InteractiveRecommendations from './components/screens/InteractiveRecommendations';
import ChatbotScreen from './components/screens/ChatbotScreen';
import QuizScreen from './components/screens/QuizScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import firebase from '@react-native-firebase/app';
import { SafeAreaProvider } from 'react-native-safe-area-context';


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
    <SafeAreaProvider>
      <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={BottomNavigation} />
        <Stack.Screen name="InteractiveRecommendations" component={InteractiveRecommendations} />
        <Stack.Screen name="ChatBot" component={ChatbotScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name='Profile' component={ProfileScreen} />
        <Stack.Screen name='Settings' component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
