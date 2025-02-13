// components/screens/ProfileScreen.js
import React from 'react';
import { View, Text, Button, Image, StyleSheet, SafeAreaView } from 'react-native';

const ProfileScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Profile Picture (Placeholder) */}
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }} // Placeholder profile pic
          style={styles.profileImage}
        />
        
        {/* User Info */}
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>johndoe@example.com</Text>
        <Text style={styles.label}>Travel Style: <Text style={styles.value}>Adventure</Text></Text>
        <Text style={styles.label}>Favorite Destination: <Text style={styles.value}>Paris</Text></Text>

        {/* Buttons */}
        <Button title="Edit Profile" onPress={() => alert('Edit Profile Feature Coming Soon!')} />
        <Button title="Log Out" onPress={() => navigation.replace('Login')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 22, fontWeight: 'bold' },
  email: { fontSize: 16, color: 'gray', marginBottom: 10 },
  label: { fontSize: 16, fontWeight: 'bold' },
  value: { fontSize: 16, color: 'blue' },
});

export default ProfileScreen;