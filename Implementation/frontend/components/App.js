import React from 'react';
import { SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';  
import BottomNavigation from './BottomNavigation'; 

function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={{ flex: 1, backgroundColor:'#ffffff'}}> 
        <BottomNavigation /> 
      </SafeAreaView>
    </NavigationContainer>
      
    
  );
}

export default App;
