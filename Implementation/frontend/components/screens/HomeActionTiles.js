import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const HomeActionTiles = ({ onNavigate }) => {
  const tiles = [
    { id: 'itinerary', label: 'Itineraries', icon: 'map-marked-alt' },
    { id: 'checkin', label: 'Log Visit', icon: 'location-arrow' },
    { id: 'friends', label: 'Friends', icon: 'user-friends' },
  ];

  return (
    <View style={styles.container}>
      {tiles.map((tile) => (
        <TouchableOpacity
          key={tile.id}
          style={styles.tile}
          onPress={() => onNavigate(tile.id)}
          activeOpacity={0.8}
        >
          <Icon name={tile.icon} size={24} color="#1E3A8A" />
          <Text style={styles.label}>{tile.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default HomeActionTiles;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    gap: 24
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#E0E7FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },  
  label: {
    marginTop: 8,
    color: '#1E3A8A',
    fontWeight: '600',
    textAlign: 'center',
  },
});
