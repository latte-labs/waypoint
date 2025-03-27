import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { database } from '../../firebase';  // ✅ Import Firebase Realtime Database

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Validate Input Fields
  const validateInputs = () => {
    let valid = true;
    let newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.toLowerCase().match(emailRegex)) {
      newErrors.email = 'Invalid email format';
      valid = false;
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  // ✅ Function to Log Signup Event in Firebase
  const logSignupToFirebase = async (userId) => {
    try {
      const userSignupRef = database().ref(`/signups/${userId}`);
      await userSignupRef.push({ timestamp: new Date().toISOString() });
    } catch (error) {
      Alert.alert('Firebase Error', 'Failed to log signup event.');
    }
  };

  // ✅ Function to Check if Email Already Exists
  const checkEmailAvailability = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/check_email/`, { params: { email } });
      return response.data.exists;
    } catch (error) {
      console.error("❌ Error checking email:", error.response?.data || error.message);
      return false;
    }
  };

  // ✅ Handle Signup with Email Check
  const handleSignup = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    try {
      console.log("🔄 Checking if email exists...");
      const emailExists = await checkEmailAvailability(email);
      if (emailExists) {
        Alert.alert("Signup Failed", "Email already in use.");
        setLoading(false);
        return;
      }

      console.log("📥 Fetching default travel style...");
      let defaultTravelStyleId = 4;
      try {
        const travelStyleResponse = await axios.get(`${API_BASE_URL}/default_travel_style`);
        defaultTravelStyleId = travelStyleResponse.data.travel_style_id || 4;
      } catch (error) {
        console.warn("⚠️ Warning: Unable to fetch default travel style. Using fallback value (4).");
      }

      console.log("🔄 Sending signup request...");
      const response = await axios.post(`${API_BASE_URL}/users/`, {
        name,
        email: email.toLowerCase(),
        password,
        travel_style_id: defaultTravelStyleId, 
      });

      if (response.status === 200) {
        const user = response.data;

        // ✅ Log signup event to Firebase
        await logSignupToFirebase(user.id);

        // ✅ Also update Firebase `/users/{userId}` with user details
        const userRef = database().ref(`/users/${user.id}`);
        await userRef.set({
          name: user.name,
          email: user.email,
          createdAt: new Date().toISOString(),
          travel_style_id: user.travel_style_id,  // ✅ Save travel style in Firebase
        });

        Alert.alert('Success', 'Account created successfully!');
        navigation.replace('Login');
      }
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/images/signup-image.jpeg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Full Name"
              value={name}
              onChangeText={setName}
            />
          </View>
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}
  
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Email"
              value={email}
              onChangeText={(text) => setEmail(text.toLowerCase())}
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.error}>{errors.email}</Text>}
  
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.inputText}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          {errors.password && <Text style={styles.error}>{errors.password}</Text>}
  
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
  
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
  
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 12
  },
  inputText: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 12,
  },
  error: {
    color: 'red',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  signupButton: {
    backgroundColor: '#263986',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginText: {
    color: '#263986',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});


export default SignupScreen;
