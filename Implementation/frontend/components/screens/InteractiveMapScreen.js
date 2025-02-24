import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@env';
import API_BASE_URL from '../../config';

const InteractiveMapScreen = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null); // Ref for controlling the map
  const [travelStyle, setTravelStyle] = useState("relaxation"); // Default filter
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState({
    latitude: 49.2827, // 📍 Vancouver, BC
    longitude: -123.1207,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    fetchPlaces();
  }, [travelStyle]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/places/search`, {
        params: {
          location: `${region.latitude},${region.longitude}`,
          radius: 5000,
          travel_style: travelStyle
        }
      });
      const fetchedPlaces = response.data.cached_places || response.data.newly_added_places;
      setPlaces(fetchedPlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
    setLoading(false);
  };

  // ✅ Zoom In Function
  const zoomIn = () => {
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta / 2,
      longitudeDelta: prevRegion.longitudeDelta / 2,
    }));
    mapRef.current.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    }, 500);
  };

  // ✅ Zoom Out Function
  const zoomOut = () => {
    setRegion(prevRegion => ({
      ...prevRegion,
      latitudeDelta: prevRegion.latitudeDelta * 2,
      longitudeDelta: prevRegion.longitudeDelta * 2,
    }));
    mapRef.current.animateToRegion({
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    }, 500);
  };

  return (
    <View style={styles.container}>
      {/* Google Maps View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
      >
        {places.map((place, index) => (
          <Marker
            key={index}
            coordinate={{ latitude: place.lat, longitude: place.lng }}
            title={place.name}
          >
            <Callout>
              <View>
                <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
                <Text>{place.category}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {["relaxation", "adventure", "cultural", "foodie"].map((style) => (
          <TouchableOpacity
            key={style}
            style={[styles.filterButton, travelStyle === style && styles.activeFilter]}
            onPress={() => setTravelStyle(style)}
          >
            <Text style={styles.filterText}>{style}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomIn}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={zoomOut}>
          <Text style={styles.zoomText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && <ActivityIndicator size="large" color="#FF6F00" style={styles.loading} />}

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  filterContainer: {
    position: 'absolute',
    top: 40,
    left: '10%',
    right: '10%',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'space-around',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  activeFilter: { backgroundColor: '#FF6F00' },
  filterText: {
    fontWeight: 'bold',
    color: '#333',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'column',
  },
  zoomButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  zoomText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loading: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  backButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    backgroundColor: '#FF6F00',
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: { color: '#fff', fontWeight: 'bold' },
});

export default InteractiveMapScreen;
