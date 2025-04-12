import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList, Image, Alert,
  Dimensions, StyleSheet, ActivityIndicator, ScrollView
} from 'react-native';
import MapView, { Marker, Callout, CalloutSubview } from 'react-native-maps';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddToItineraryModal from './itinerary/AddToItineraryModal';
import { database } from '../../firebase';
import API_BASE_URL from '../../config';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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


  const snapPoints = useMemo(() => [Platform.OS === 'ios' ? '11%' : '11%', '40%', '100%'], []);
  const scrollViewRef = useRef(null);
  const cardRefs = useRef([]);
  const [focusedPlace, setFocusedPlace] = useState(null); 
  const insets = useSafeAreaInsets();
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [toggleVisible, setToggleVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Vancouver');
  const [cityToggleVisible, setCityToggleVisible] = useState(false);
  const [savedPlacesByItinerary, setSavedPlacesByItinerary] = useState({});



  useEffect(() => {
    fetchPlaces();
  }, [travelStyle, region]);
  const fetchSavedPlaces = async () => {
    try {
      const snapshot = await database().ref('/live_itineraries').once('value');
      if (snapshot.exists()) {
        const data = snapshot.val();
        const saved = {};
        Object.entries(data).forEach(([itineraryId, details]) => {
          if (details?.places) {
            saved[itineraryId] = details.places;
          }
        });
        setSavedPlacesByItinerary(saved);
      }
    } catch (err) {
      console.error("❌ Error fetching saved places:", err);
    }
  };
  

  useEffect(() => {
    fetchSavedPlaces();
  }, []);
  
  

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
  const isPlaceAlreadySaved = (placeName) => {
    return Object.values(savedPlacesByItinerary).some(placeList =>
      Array.isArray(placeList) && placeList.includes(placeName)
    );
  };
  
  const focusMapOnPlace = (place, index) => {
    setActiveIndex(index);
  
    // Do NOT animate or change region — just show callout and scroll
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
      <View style={{ flex: 1 }}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          region={region}
          showsPointsOfInterest={false}
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
                onPress={() => focusMapOnPlace(place, index)}
                pinColor={isPlaceAlreadySaved(place.name) ? '#32CD32' : '#007AFF'} // green if already saved
              >

                <Callout
                  tooltip={true}
                  onPress={() => {
                    setSelectedPlace(place);
                    setModalVisible(true);
                  }}
                >
                  <View style={styles.calloutContainer}>
                    <View style={styles.calloutHeader}>
                      <Text style={styles.calloutTitle}>{place.name}</Text>
                      <CalloutSubview
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        onPress={() => {
                          setSelectedPlace(place);
                          setModalVisible(true);
                        }}
                        style={styles.calloutIconWrapper}
                      >
                        <Icon name="plus-circle" size={28} color="#007AFF" />
                      </CalloutSubview>
                    </View>
                    <Text style={styles.calloutSubtitle}>{capitalize(place.category)}</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>

        {/* Travel Style Filter - Only show when BottomSheet is NOT fully expanded */}
        {!isSheetExpanded && (
          <View style={[styles.togglesContainer, { top: insets.top + 10 }]}>
            {/* City Toggle */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                onPress={() => setCityToggleVisible(prev => !prev)}
                style={styles.dropdownHeader}
              >
            <View style={styles.dropdownHeaderContent}>
              <Text style={styles.dropdownHeaderText}>City: {selectedCity}</Text>
              <Icon name="chevron-down" size={12} color="#fff" style={styles.dropdownIcon} />
            </View>
              </TouchableOpacity>

              {cityToggleVisible && (
                <View style={styles.dropdownOptions}>
                  {[
                    { label: 'Vancouver', coords: { latitude: 49.2827, longitude: -123.1207 } },
                    { label: 'Bali', coords: { latitude: -8.7031 , longitude: 115.1707 } },
                    { label: 'San Francisco', coords: { latitude: 37.8018 , longitude: -122.4122 } },
                    { label: 'Tokyo', coords: { latitude: 35.6796 , longitude: 139.7537 } },
                  ].map((city) => (
                    <TouchableOpacity
                      key={city.label}
                      style={[
                        styles.dropdownOption,
                        selectedCity === city.label && styles.selectedDropdownOption
                      ]}
                      onPress={() => {
                        setSelectedCity(city.label);
                        setRegion({
                          ...city.coords,
                          latitudeDelta: 0.05,
                          longitudeDelta: 0.05
                        });
                        setCityToggleVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{city.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Style Toggle */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                onPress={() => setToggleVisible(prev => !prev)}
                style={styles.dropdownHeader}
              >
                <View style={styles.dropdownHeaderContent}>
                  <Text style={styles.dropdownHeaderText}>Style: {capitalize(travelStyle)}</Text>
                  <Icon name="chevron-down" size={12} color="#fff" style={styles.dropdownIcon} />
                </View>
              </TouchableOpacity>

              {toggleVisible && (
                <View style={styles.dropdownOptions}>
                  {['relaxation', 'adventure', 'cultural', 'foodie'].map((style) => (
                    <TouchableOpacity
                      key={style}
                      style={[
                        styles.dropdownOption,
                        travelStyle === style && styles.selectedDropdownOption
                      ]}
                      onPress={() => {
                        setTravelStyle(style);
                        setToggleVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>{capitalize(style)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
        </View>
      )}




        {/* Bottom Sheet */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={{ backgroundColor: '#fff' }}
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
          onChange={(index) => setIsSheetExpanded(index >= 2)} 
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
                  {isPlaceAlreadySaved(item.name) && (
                    <View style={styles.checkIconWrapper}>
                      <Icon name="check-circle" size={20} color="#32CD32" />
                    </View>
                  )}

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
                await fetchSavedPlaces(); 
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
  );
};

const styles = StyleSheet.create({
  filterBar: {
    position: 'absolute',
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
  calloutContainer: {
    width: 180,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 4,
  },
  
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    flexWrap: 'wrap',
  },
  
  calloutSubtitle: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  
  calloutIconWrapper: {
    marginLeft: 8,
    padding: 4,
    borderRadius: 20,
  },
  
  togglesContainer: {
    position: 'absolute',
    top: 0, // remove `alignSelf: 'center'` to use flex centering instead
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 10,
    zIndex: 100,
  },
  
  dropdownWrapper: {
    width: 160
  },
  dropdownHeader: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  dropdownHeaderText: {
    color: '#fff',
    textAlign: 'center',
  },
  
  dropdownOptions: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selectedDropdownOption: {
    backgroundColor: '#eaf0ff',
  },
  dropdownOptionText: {
    textAlign: 'center',
    color: '#333',
  },
  dropdownHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  
  dropdownIcon: {
    marginLeft: 4,
    marginTop: 1,
  },
  checkIconWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 2,
    zIndex: 10,
  }
  
  
  
  
});

export default InteractiveRecommendations;