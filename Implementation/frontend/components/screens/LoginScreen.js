import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { database } from '../../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Input validation
  const validateInputs = () => {
    let valid = true;
    let newErrors = {};

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
    } catch (error) {
      Alert.alert('Firebase Error', 'Failed to log login event.');
    }
  };

  // ✅ Handle Login
  const handleLogin = async () => {
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/users/auth/login`, 
        { email: email.toLowerCase(), password }, 
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        const user = response.data.user; 

        // ✅ Store user details in AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(user));
        await AsyncStorage.setItem('user_id', String(user.id));

        // ✅ Log login event to Firebase
        await logLoginToFirebase(user.id);

        // ✅ Also update last login timestamp in Firebase
        const userRef = database().ref(`/users/${user.id}`);
        await userRef.update({ lastLogin: new Date().toISOString() });

        Alert.alert('Success', 'Login successful!');
        navigation.replace('Main'); 
      }
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text.toLowerCase())}
        keyboardType="email-address"
      />
      {errors.email ? <Text style={styles.error}>{errors.email}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {errors.password ? <Text style={styles.error}>{errors.password}</Text> : null}

      <Button title={loading ? 'Logging In...' : 'Login'} onPress={handleLogin} disabled={loading} />
      <Button title="Don't have an account? Sign Up" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '80%', padding: 10, borderWidth: 1, marginBottom: 10, borderRadius: 5 },
  error: { color: 'red', fontSize: 14, marginBottom: 5 },
});

export default LoginScreen;
