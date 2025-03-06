import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      {errors.name ? <Text style={styles.error}>{errors.name}</Text> : null}

      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={(text) => setEmail(text.toLowerCase())} keyboardType="email-address" />
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

      <Button title={loading ? 'Signing Up...' : 'Sign Up'} onPress={handleSignup} disabled={loading} />
      <Button title="Already have an account? Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', fontSize: 14, marginBottom: 5 },
});

export default SignupScreen;
