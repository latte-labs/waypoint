import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image, Alert,
  Dimensions, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddToItineraryModal from './itinerary/AddToItineraryModal';
import SafeAreaWrapper from './SafeAreaWrapper';
import { database } from '../../firebase';
import API_BASE_URL from '../../config';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

const { width, height } = Dimensions.get('window');

const InteractiveRecommendations = () => {
  const navigation = useNavigation();
  const mapRef = useRef(null);
  const flatListRef = useRef(null);
  const markerRefs = useRef([]);
  const bottomSheetRef = useRef(null);

  const [mapPlaces, setMapPlaces] = useState([]);
  const [travelStyle, setTravelStyle] = useState("relaxation");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [region, setRegion] = useState({
    latitude: 49.2827,
    longitude: -123.1207,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);


  const snapPoints = useMemo(() => ['20%', '50%', '85%'], []);
  const scrollViewRef = useRef(null);
  const cardRefs = useRef([]);


  useEffect(() => {
    fetchPlaces();
  }, [travelStyle, region]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/places/cached`, {
        params: {
          location: `${region.latitude},${region.longitude}`,
          radius: 5000,
          travel_style: travelStyle
        }
      });
      setMapPlaces(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
    setLoading(false);
  };

  const filteredPlaces = selectedCategory
    ? mapPlaces.filter(place => place.category === selectedCategory)
    : mapPlaces;

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const focusMapOnPlace = (place, index) => {
    setActiveIndex(index);
  
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500);
    }
  
    if (markerRefs.current[index]?.current) {
      markerRefs.current[index].current.showCallout();
    }
      
    if (cardRefs.current[index] && scrollViewRef.current) {
      cardRefs.current[index].measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({ y, animated: true });
        },
        (error) => console.error("❌ Scroll error:", error)
      );
    }
  };
    
  return (
    <SafeAreaWrapper>
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          region={region}
          onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        >
          {filteredPlaces.map((place, index) => {
            if (!markerRefs.current[index]) {
              markerRefs.current[index] = React.createRef();
            }
            return (
              <Marker
                key={index}
                coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                ref={markerRefs.current[index]}
                title={place.name}
                onPress={() => focusMapOnPlace(place, index)}
                >
                <Callout>
                  <View>
                    <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
                    <Text>{capitalize(place.category)}</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* Travel Style Filter */}
        <View style={styles.filterBar}>
          {['relaxation', 'adventure', 'cultural', 'foodie'].map((style) => (
            <TouchableOpacity
              key={style}
              style={[styles.filterButton, travelStyle === style && styles.selectedFilter]}
              onPress={() => setTravelStyle(style)}
            >
              <Text style={styles.filterText}>{capitalize(style)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: '#fff' }}
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >

          <BottomSheetScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ paddingBottom: 30, paddingTop: 10 }}
          >
            {/* Category Filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 10 }}>
              {['All', ...new Set(mapPlaces.map(p => p.category))].map((category) => {
                const label = category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                const isSelected = selectedCategory === category || (category === 'All' && selectedCategory === null);
                return (
                  <TouchableOpacity
                    key={category}
                    style={{
                      marginRight: 8, paddingHorizontal: 12, paddingVertical: 6,
                      borderRadius: 16, backgroundColor: isSelected ? '#1E3A8A' : '#ddd',
                    }}
                    onPress={() => setSelectedCategory(category === 'All' ? null : category)}
                  >
                    <Text style={{ color: isSelected ? '#fff' : '#333' }}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Places List */}
            {filteredPlaces.map((item, index) => (
              <TouchableOpacity
                key={`${item.name}-${index}`}
                onPress={() => focusMapOnPlace(item, index)}
                activeOpacity={0.8}
                ref={el => cardRefs.current[index] = el}
              >
                <View style={[styles.card, activeIndex === index && styles.activeCard]}>
                  <Image
                    source={require('../../assets/images/placeholder_placelist.png')}
                    style={styles.image}
                  />
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedPlace(item);
                      setModalVisible(true);
                    }}
                  >
                    <Icon name="plus-circle" size={24} color="#007AFF" />
                  </TouchableOpacity>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text>{capitalize(item.category)}</Text>
                    <Text>⭐ {item.rating || 'N/A'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>

        </BottomSheet>

        {/* Modal */}
        <AddToItineraryModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          place={selectedPlace}
          onSelectItinerary={async (itineraryId) => {
            if (!selectedPlace?.name) return;
            try {
              const ref = database().ref(`/live_itineraries/${itineraryId}/places`);
              const snapshot = await ref.once('value');
              const existingPlaces = snapshot.exists() ? snapshot.val() : [];

              if (existingPlaces.includes(selectedPlace.name)) {
                Alert.alert("Already Exists", "This place is already in the itinerary.");
              } else {
                await ref.set([...existingPlaces, selectedPlace.name]);
                Alert.alert("Success", `${selectedPlace.name} added to itinerary.`);
              }
            } catch (error) {
              console.error("❌ Error adding place:", error);
              Alert.alert("Error", "Failed to add place. Please try again.");
            }
            setModalVisible(false);
            setSelectedPlace(null);
          }}
        />
      </View>
    </SafeAreaWrapper>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    zIndex: 100,
  },  
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
    backgroundColor: '#ddd',
    borderRadius: 20,
  },
  selectedFilter: {
    backgroundColor: '#1E3A8A',
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  activeCard: {
    borderColor: '#1E3A8A',
    borderWidth: 2,
    backgroundColor: '#eaf0ff',
  },
  
});

export default InteractiveRecommendations;