// components/screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Switch, StyleSheet, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SettingsScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [travelStyle, setTravelStyle] = useState('Adventure');
  const [language, setLanguage] = useState('English');

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Settings</Text>

        {/* Travel Style Selection */}
        <Text style={styles.label}>Travel Style:</Text>
        <Picker selectedValue={travelStyle} onValueChange={(itemValue) => setTravelStyle(itemValue)}>
          <Picker.Item label="Adventure" value="Adventure" />
          <Picker.Item label="Relaxation" value="Relaxation" />
          <Picker.Item label="Culture" value="Culture" />
        </Picker>

        {/* Notifications Toggle */}
        <View style={styles.row}>
          <Text style={styles.label}>Enable Notifications:</Text>
          <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />
        </View>

        {/* Language Selection */}
        <Text style={styles.label}>Language:</Text>
        <Picker selectedValue={language} onValueChange={(itemValue) => setLanguage(itemValue)}>
          <Picker.Item label="English" value="English" />
          <Picker.Item label="Spanish" value="Spanish" />
          <Picker.Item label="French" value="French" />
        </Picker>

        {/* Account Management Buttons */}
        <Button title="Change Password" onPress={() => alert('Change Password Feature Coming Soon!')} />
        <Button title="Delete Account" color="red" onPress={() => alert('Delete Account Feature Coming Soon!')} />

        {/* Navigation Buttons */}
        <Button title="Go Back to Profile" onPress={() => navigation.navigate('Profile')} />
        <Button title="Log Out" onPress={() => navigation.replace('Login')} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
});

export default SettingsScreen;
