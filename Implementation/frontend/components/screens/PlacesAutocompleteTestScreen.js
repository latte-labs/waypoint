// implementation/frontend/screens/PlacesAutocompleteTestScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';
import SafeAreaWrapper from './SafeAreaWrapper';

const PlacesAutocompleteTestScreen = () => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const debounceRef = useRef(null);

  const fetchPlaces = async (text) => {
    setSelectedCity(null);
  
    if (text.length < 3) return;

  
    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          input: text,
          includedPrimaryTypes: ['(cities)'], // ✅ restrict to cities
          locationBias: {
            circle: {
              center: { latitude: 49.2827, longitude: -123.1207 }, // Vancouver
              radius: 50000.0 // 50km
            }
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat'
          }
        }
      );
  
      const suggestions = response.data.suggestions || [];
      const placeSuggestions = suggestions
        .filter(s => s.placePrediction)
        .map(s => s.placePrediction);
  
      setResults(placeSuggestions);
    } catch (error) {
      console.error('Autocomplete (v3) error:', error.response?.data || error.message);
    }
  };
  
  

  const fetchPlaceDetails = async (placeId) => {
    try {
        const response = await axios.get(
            `https://places.googleapis.com/v1/places/${placeId}`,
          
        {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'location,displayName,types,addressComponents'
          }
        }
      );
  
      const place = response.data;
      const types = place.types || [];
      const isCity = types.includes('locality');
      const isCountry = types.includes('country');
  
      if (!isCity && !isCountry) {
        setSelectedCity({ name: 'Not a city or country', lat: null, lng: null });
        return;
      }
  
      const cityName = place.displayName?.text || 'Unknown';
      const { latitude, longitude } = place.location;
  
      setSelectedCity({
        name: cityName,
        lat: latitude,
        lng: longitude
      });
      setInput(cityName);
      setResults([]);
    } catch (error) {
      console.error('Place Details (v3) error:', error.response?.data || error.message);
    }
  };
  
  

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.autocompleteContainer}>
          <TextInput
            placeholder="Type a city..."
            value={input}
            onChangeText={(text) => {
                setInput(text); // ✅ Update the actual text input value
                clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                  fetchPlaces(text);
                }, 700);
              }}
            style={styles.input}
          />

          {results.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={results}
                keyExtractor={(item) => item.placeId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => fetchPlaceDetails(item.placeId)}
                    >
                        <Text style={styles.itemText}>{item.structuredFormat?.mainText?.text}</Text>
                        <Text style={styles.itemSubText}>{item.structuredFormat?.secondaryText?.text}</Text>
                    </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {selectedCity && (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>{selectedCity.name}</Text>
            {selectedCity.lat && (
              <Text style={styles.resultSub}>
                Lat: {selectedCity.lat}, Lng: {selectedCity.lng}
              </Text>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
};

export default PlacesAutocompleteTestScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  autocompleteContainer: { zIndex: 1000 }, // needed to float dropdown
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff'
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 200,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  itemText: { fontSize: 16 },
  resultBox: { marginTop: 32 },
  resultTitle: { fontSize: 18, fontWeight: 'bold' },
  resultSub: { fontSize: 14, color: '#666', marginTop: 4 },
  itemSubText: {
    fontSize: 13,
    color: '#888',
    marginTop: 2
  }
  
});
