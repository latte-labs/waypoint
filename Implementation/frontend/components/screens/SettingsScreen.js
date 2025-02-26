// components/screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Switch, StyleSheet, SafeAreaView, Platform, StatusBar, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../config';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [openTravelStyle, setOpenTravelStyle] = useState(false);
  const [openLanguage, setOpenLanguage] = useState(false);

  const travelStyles = [
    { label: 'Adventure', value: 'Adventure' },
    { label: 'Relaxation', value: 'Relaxation' },
    { label: 'Culture', value: 'Cultural' }
  ];

  const languages = [
    { label: 'English', value: 'English' },
    { label: 'Spanish', value: 'Spanish' },
    { label: 'French', value: 'French' }
  ];

  useEffect(() => {
    const fetchUserPreferences = async () => {
      try {
        console.log("🔄 Fetching stored user data...");
        const storedUser = await AsyncStorage.getItem('user');

        if (!storedUser) {
          console.error("❌ User not found in AsyncStorage!");
          setLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
        console.log("📥 Retrieved User ID:", userData.id);

        const response = await axios.get(`${API_BASE_URL}/quiz_results/user/${userData.id}`);

        console.log("📥 API Response:", response.data);

        if (response.status === 200) {
          setTravelStyle(response.data.travel_style || "Adventure");
          setLanguage(response.data.language || "English");
        } else {
          console.warn("⚠️ Travel style not found in API response.");
        }
      } catch (error) {
        console.error("❌ Error fetching travel style:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPreferences();
  }, []);

  const updateTravelStyle = async (newStyle) => {
    console.log(`🔄 Updating travel style to: ${newStyle}`);
    setTravelStyle(newStyle);

    try {
      if (!userId) {
        console.error("❌ User ID not found, cannot update travel style!");
        return;
      }

      console.log("📤 Sending PUT Request with body:", { travel_style: newStyle });

      const response = await axios.put(`${API_BASE_URL}/quiz_results/user/${userId}`, 
        { travel_style: newStyle }, 
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        console.log("✅ Travel style updated successfully!");
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const updatedUser = { ...JSON.parse(storedUser), travel_style: newStyle };
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error("❌ Error updating travel style:", error.response?.data || error.message);
    }
  };

  const updateLanguage = async (newLanguage) => {
    console.log(`🔄 Updating language to: ${newLanguage}`);
    setLanguage(newLanguage);
  
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
  
        // ✅ Preserve the existing travel style while updating language
        const updatedUser = { ...userData, language: newLanguage };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
  
        console.log("✅ Language updated in AsyncStorage.");
      }
    } catch (error) {
      console.error("❌ Error updating language:", error.message);
    }
  };
  

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
        <Text style={styles.title}>Settings</Text>

        {/* Travel Style Selection */}
        <View style={[styles.dropdownWrapper, { zIndex: 3000 }]}>
          <Text style={styles.label}>Travel Style:</Text>
          <DropDownPicker
            open={openTravelStyle}
            value={travelStyle}
            items={travelStyles}
            setOpen={setOpenTravelStyle}
            setValue={setTravelStyle}
            onChangeValue={updateTravelStyle}
            containerStyle={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdown}
            style={styles.dropdownPicker}
            zIndex={3000} // Ensures travel style dropdown appears above language dropdown
            modalProps={{ animationType: 'fade' }}
            removeClippedSubviews={false} // ✅ Prevents rendering issues
          />
        </View>

        {/* Language Selection */}
        <View style={[styles.dropdownWrapper, { zIndex: 2000 }]}>
          <Text style={styles.label}>Language:</Text>
          <DropDownPicker
            open={openLanguage}
            value={language}
            items={languages}
            setOpen={setOpenLanguage}
            setValue={setLanguage}
            onChangeValue={updateLanguage}
            containerStyle={styles.dropdownContainer}
            dropDownContainerStyle={styles.dropdown}
            style={styles.dropdownPicker}
            zIndex={2000} // Ensures it does not overlap Travel Style dropdown
            modalProps={{ animationType: 'fade' }}
            removeClippedSubviews={false} // ✅ Prevents UI bugs
          />
        </View>

        {/* Notifications Toggle */}
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications:</Text>
          <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />
        </View>

        {/* Navigation Buttons */}
        <Button title="Go Back to Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Log Out" onPress={() => navigation.replace('Login')} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
  keyboardContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  dropdownWrapper: { width: '100%', marginBottom: 20 },
  dropdownContainer: { width: '100%' },
  dropdown: { backgroundColor: '#fafafa', elevation: 5 },
  dropdownPicker: { borderColor: '#ccc' },
});

export default SettingsScreen;
