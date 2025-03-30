// components/screens/AuthLoadingScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const AuthLoadingScreen = ({ navigation }) => {
  const scaleAnim = useRef(new Animated.Value(0.2)).current;  // start small
  const opacityAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(500), // ⏳ wait before starting
      Animated.timing(scaleAnim, {
        toValue: 8,
        duration: 1300,
        easing: Easing.inOut(Easing.cubic), // 🎯 smooth and professional
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      checkLoginStatus();
    });
  }, []);  
  

  const checkLoginStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        navigation.replace('Main');
      } else {
        navigation.replace('Login');
      }
    } catch (error) {
      console.error('❌ Error checking login status:', error);
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/logo.png')} // 🔁 your logo file
        style={[
          styles.logo,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f3a8a', // or your brand background
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 140, 
    height: 140,
  },
});

export default AuthLoadingScreen;
