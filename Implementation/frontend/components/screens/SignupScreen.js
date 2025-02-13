// components/screens/SignupScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Validation function
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

  const handleSignup = async () => {
    if (!validateInputs()) return;
  
    setLoading(true);
  
    try {
      const response = await axios.post(`${API_BASE_URL}/users/`, {
        name,
        email: email.toLowerCase(),
        password,
      });
  
      if (response.status === 200) {
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
