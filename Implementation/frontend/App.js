import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import { createStackNavigator } from '@react-navigation/stack';
import BottomNavigation from './components/navigation/BottomNavigation';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import FirebaseTestScreen from './components/screens/FirebaseTestScreen'; // ✅ Added test screen

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}> 
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Firebase Test Screen (Temporary, for debugging) */}
          <Stack.Screen name="FirebaseTest" component={FirebaseTestScreen} /> 

          {/* Authentication Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          
          {/* Main App (After Login) */}
          <Stack.Screen name="Main" component={BottomNavigation} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

export default App;
