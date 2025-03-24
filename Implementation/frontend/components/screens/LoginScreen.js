import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity} from 'react-native';
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
            id: String(user.id),  // ✅ Ensure `user_id` is stored as a string (UUID)
            name: user.name,
            email: user.email,
            travel_style_id: user.travel_style_id,  
        };

        await AsyncStorage.setItem('user', JSON.stringify(userData));
        await AsyncStorage.setItem('user_id', String(user.id));  // ✅ Store `user_id` separately for quick access

        console.log("✅ User session stored:", userData);
    } catch (error) {
        console.error('❌ AsyncStorage Error:', error);
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

          // ✅ Log login event to Firebase
          await logLoginToFirebase(user.id);

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
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: errors.email ? 'red' : '#ccc' } // 👈 Always applies a color
        ]}        
        placeholder="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text.toLowerCase().trim());
          setErrors((prev) => ({ ...prev, email: null }));
        }}        
        keyboardType="email-address"
      />

      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <View style={[styles.passwordContainer,{ borderColor: errors.password ? 'red' : '#ccc' }] }>
        <TextInput style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setErrors((prev) => ({ ...prev, password: null }));
          }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
          <Icon
            name={showPassword ? 'eye-slash' : 'eye'}
            size={20}
            color="#333"
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>


      {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

      <Button 
        title={loading ? 'Logging In...' : 'Login'} 
        onPress={handleLogin} 
        disabled={loading || Object.values(errors).some((msg) => msg)} 
      />

      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff', // Optional for clarity
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc', 
    borderRadius: 5,
    marginBottom: 5,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start', // ✅ aligns error message with input
    marginLeft: '10%', // ✅ aligns with input left edge (80% width)
  },
  passwordContainer: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 2,
    paddingRight: 10,
    marginBottom: 5,
  },
  
  
  toggle: {
    paddingHorizontal: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  }
  
  
});

export default LoginScreen;
