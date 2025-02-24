import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import MapView from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { GOOGLE_MAPS_API_KEY } from '@env';


const InteractiveMapScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Google Maps View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 49.2827,  // 📍 Vancouver, BC
          longitude: -123.1207,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',  // Keeps button over the map
    top: 40,  // Adjust for safe area
    left: 20,
    backgroundColor: '#FF6F00',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default InteractiveMapScreen;
