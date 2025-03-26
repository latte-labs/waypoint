// ✅ Step 1: Extract your custom modal into its own component file
// 📄 File: implementation/frontend/components/WeatherSearchModal.js

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';

const WeatherSearchModal = ({ visible, onClose, onSelectCity }) => {
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const debounceRef = useRef(null);

  const fetchPlaces = async (text) => {
    if (text.length < 3) return;

    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          input: text,
          includedPrimaryTypes: ['(cities)'],
          locationBias: {
            circle: {
              center: { latitude: 49.2827, longitude: -123.1207 },
              radius: 50000.0,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask':
              'suggestions.placePrediction.placeId,suggestions.placePrediction.structuredFormat',
          },
        }
      );

      const suggestions = response.data.suggestions || [];
      const placeSuggestions = suggestions
        .filter((s) => s.placePrediction)
        .map((s) => s.placePrediction);

      setResults(placeSuggestions);
    } catch (error) {
      console.error('Autocomplete error:', error.response?.data || error.message);
    }
  };

  const handleSelect = async (placeId, cityName) => {
    try {
      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'location,displayName,types,addressComponents',
          },
        }
      );

      const place = response.data;
      const { latitude, longitude } = place.location;

      onSelectCity({ city: cityName, lat: latitude, lng: longitude });
      onClose();
    } catch (error) {
      console.error('Select error:', error.response?.data || error.message);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.modalBox}>
        <Text style={styles.title}>Search for a City</Text>
        <TextInput
          placeholder="Type a city..."
          value={input}
          onChangeText={(text) => {
            setInput(text);
            clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => fetchPlaces(text), 600);
          }}
          style={styles.input}
        />
        <FlatList
          data={results}
          keyExtractor={(item) => item.placeId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                handleSelect(item.placeId, item.structuredFormat?.mainText?.text)
              }
            >
              <Text style={styles.itemText}>{item.structuredFormat?.mainText?.text}</Text>
              <Text style={styles.itemSubText}>{item.structuredFormat?.secondaryText?.text}</Text>
            </TouchableOpacity>
          )}
          keyboardShouldPersistTaps="handled"
        />
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WeatherSearchModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  item: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' },
  itemText: { fontSize: 16 },
  itemSubText: { fontSize: 13, color: '#888' },
  closeBtn: {
    backgroundColor: '#1E3A8A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeText: { color: 'white', fontWeight: 'bold' },
});