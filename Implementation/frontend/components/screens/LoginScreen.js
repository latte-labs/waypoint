import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, Animated, Keyboard, Easing} from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { database } from '../../firebase'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const passwordRef = useRef(null);

  
  const cardPosition = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (event) => {
      const keyboardHeight = event.endCoordinates.height;
      Animated.timing(cardPosition, {
        toValue: -keyboardHeight, // 40px buffer so it's not glued to the top
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
  
    const hideSub = Keyboard.addListener('keyboardWillHide', () => {
      Animated.timing(cardPosition, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    });
  
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);
  

  // ✅ Input validation
  const validateInputs = () => {
    let valid = true;
    let newErrors = { email: null, password: null };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.toLowerCase().match(emailRegex)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ✅ Function to log login event to Firebase
  const logLoginToFirebase = async (userId) => {
    try {
      const userLoginRef = database().ref(`/logins/${userId}`);
      await userLoginRef.push({ timestamp: new Date().toISOString() });

      // ✅ Also update last login timestamp in Firebase
      const userRef = database().ref(`/users/${userId}`);
      await userRef.update({ lastLogin: new Date().toISOString() });
    } catch (error) {
      console.error('Firebase Error:', error);
      Alert.alert('Firebase Error', 'Failed to log login event.');
    }
  };

  // ✅ Function to store user session in AsyncStorage (now includes travel_style_id)
  const storeUserSession = async (user) => {
    try {
        const userData = {
            id: String(user.id), 
            name: user.name,
            email: user.email,
            travel_style_id: user.travel_style_id,  
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('user_id', String(user.id));

        console.log("✅ User session stored:", userData);
    } catch (error) {
        console.error('❌ AsyncStorage Error:', error);
    }
};
const fetchAndStoreProfileImage = async (userId) => {
  try {
    const snapshot = await database().ref(`users/${userId}/profilePhotoUrl`).once('value');
    const photoUrl = snapshot.val();

    if (photoUrl) {
      const cacheBustedUrl = `${photoUrl}?ts=${Date.now()}`;
      await AsyncStorage.setItem('profileImage', cacheBustedUrl);
      console.log("✅ Profile image saved to AsyncStorage:", cacheBustedUrl);
    } else {
      console.log("ℹ️ No profile photo URL found in Firebase for this user.");
    }
  } catch (error) {
    console.error("❌ Error fetching profile image:", error);
  }
};


// ✅ Function to fetch 3 most recent itineraries
const fetchAndStoreRecentItineraries = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/itineraries/users/${userId}/itineraries/recent`);

    if (response.status === 200 && response.data.length > 0) {
      await AsyncStorage.setItem('recent_itineraries', JSON.stringify(response.data));
      console.log("✅ Recent itineraries saved:", response.data);
    } else {
      console.log("ℹ️ No recent itineraries found.");
    }
  } catch (error) {
    console.error("❌ Error fetching recent itineraries:", error);
  }
};


  

// ✅ Handle Login (modified to ensure `travel_style_id` is included)
const handleLogin = async () => {
  if (!validateInputs()) return;
  setLoading(true);

  try {
      const response = await axios.post(
          `${API_BASE_URL}/users/auth/login`,
          { email: email.toLowerCase(), password },
          { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
          const user = response.data.user;

          if (!user.travel_style_id) {
              console.warn("⚠ travel_style_id is missing from backend response");
              user.travel_style_id = 4;  // ✅ Default to Undefined if not present
          }

          // ✅ Store user details in AsyncStorage
          await storeUserSession(user);

          // ✅ Fetch and store recent itineraries (only if any exist)
          await fetchAndStoreRecentItineraries(user.id);

          // ✅ Log login event to Firebase
          await logLoginToFirebase(user.id);

          // ✅ Fetch and store profile image
          await fetchAndStoreProfileImage(user.id);

          // ✅ Navigate to HomeScreen with user details
          navigation.replace('Main', { user });  
      }
  } catch (error) {
    const detail = error.response?.data?.detail;
    const newErrors = { email: null, password: null };

    if (detail === "Email not found") {
      newErrors.email = "Email not found. Try another email or sign up.";
    } else if (detail === "Incorrect password") {
      newErrors.password = "Incorrect password. Try again.";
    } else {
      if (!newErrors.email && !newErrors.password) {
        Alert.alert("Login Failed", detail || "Invalid credentials");
      }
    }    
    setErrors(newErrors);
    
  } finally {
      setLoading(false);
  }
};



  return (
    <ImageBackground
    source={require('../../assets/images/login-image.jpg')} // ✅ your background image
    style={styles.background}
    resizeMode="cover"
    >
      
    <View
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headingContainer}>
        <Text style={styles.heading}>EXPLORE</Text>
        <Text style={styles.heading}>THE WORLD</Text>
        <Text style={styles.tagline}>Your Journey, Your Way.</Text>
      </View>


      <Animated.View style={[styles.card, { transform: [{ translateY: cardPosition }] }]}>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
      <View style={[
        styles.inputContainer,
        { borderColor: errors.email ? 'red' : '#ccc' }
      ]}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text.toLowerCase().trim());
            setErrors((prev) => ({ ...prev, email: null }));
          }}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />


        {email.length > 0 && (
          <TouchableOpacity onPress={() => setEmail('')}>
            <Icon name="times-circle" size={16} color="#999" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>
          {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}
          <View style={[styles.passwordContainer,{ borderColor: errors.password ? 'red' : '#ccc' }] }>
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setErrors((prev) => ({ ...prev, password: null }));
              }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
            />


            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Icon
                name={showPassword ? 'eye-slash' : 'eye'}
                size={16}
                color="#999"
              />
            </TouchableOpacity>
          </View>


          {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading || Object.values(errors).some((msg) => msg)}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Logging In...' : 'Login'}
            </Text>
          </TouchableOpacity>


      </Animated.View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },  
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingRight: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  
  toggle: {
    paddingHorizontal: 8,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    paddingBottom: 30
  },
  loginButton: {
    backgroundColor: '#263986',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 24,
  },
  
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  signupText: {
    color: '#263986',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
    textAlign: 'center',
  },
  
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headingContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  
  heading: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  
  tagline: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '300',
    marginBottom: 16,
    textAlign: 'center',
  },
  
});

export default LoginScreen;
