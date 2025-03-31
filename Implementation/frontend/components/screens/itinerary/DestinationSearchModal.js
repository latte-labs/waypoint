import React, { useState, useRef } from 'react';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, View, TextInput, Text, Button, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { GOOGLE_PLACES_API_KEY } from '@env';

const DestinationSearchModal = ({ visible, onClose, onSelectPlace }) => {
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
          includedPrimaryTypes: ['(regions)'],
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
      console.error('Destination autocomplete error:', error.response?.data || error.message);
    }
  };

  const handleSelect = async (placeId) => {
    try {
      const response = await axios.get(
        `https://places.googleapis.com/v1/places/${placeId}`,
        {
          headers: {
            'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
            'X-Goog-FieldMask': 'addressComponents',
          },
        }
      );
  
      const components = response.data.addressComponents || [];
  
      const city = components.find((c) =>
        c.types.includes('locality') || c.types.includes('administrative_area_level_1')
      )?.longText;
  
      const country = components.find((c) => c.types.includes('country'))?.longText;
  
      if (!city || !country) {
        console.warn('⚠️ City or country not found');
      }
  
      onSelectPlace({ city, country });
      onClose();
    } catch (error) {
      console.error('Place details fetch error:', error.response?.data || error.message);
    }
  };
  

  if (!visible) return null;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          keyboardVerticalOffset={80} // tweak this value based on header height
        >
          <View style={styles.modalBox}>
            <Text style={styles.title}>Search Destination</Text>
  
            <TextInput
              placeholder="Type a place..."
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
                  onPress={() => handleSelect(item.placeId)}
                >
                  <Text style={styles.itemText}>{item.structuredFormat?.mainText?.text}</Text>
                  <Text style={styles.itemSubText}>{item.structuredFormat?.secondaryText?.text}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1 }}
            />
  
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default DestinationSearchModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  
  
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
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
