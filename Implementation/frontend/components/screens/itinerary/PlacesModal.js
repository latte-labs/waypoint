import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../../firebase';

const { height } = Dimensions.get('window');

const PlacesModal = ({ visible, onClose, itineraryId, onPlaceTap }) => {
  const [place, setPlace] = useState('');
  const [placesList, setPlacesList] = useState([]);

  // Load places from AsyncStorage when modal opens
  useEffect(() => {
    if (!visible) return;
  
    const placesRef = database().ref(`/live_itineraries/${itineraryId}/places`);
    
    placesRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        setPlacesList(snapshot.val());
      } else {
        setPlacesList([]); // Default empty list if none exists
      }
    });
  
    return () => placesRef.off();
  }, [visible, itineraryId]);
  
  // Function to add a place
  const addPlace = async () => {
    if (place.trim() === '') {
      Alert.alert("Empty Input", "Please enter a place name.");
      return;
    }
  
    const updatedPlaces = [...placesList, place];
    setPlacesList(updatedPlaces);
    setPlace('');
  
    try {
      await database().ref(`/live_itineraries/${itineraryId}/places`).set(updatedPlaces);
    } catch (error) {
      console.error('Error saving new place:', error);
    }
  };

  // Function to delete a place from the list
  const deletePlace = (index) => {
    const updatedList = placesList.filter((_, i) => i !== index);
    setPlacesList(updatedList);
  };

  // Function to save places to AsyncStorage and close modal
  const savePlaces = async () => {
    try {
      await database().ref(`/live_itineraries/${itineraryId}/places`).set(placesList);
      onClose();
    } catch (error) {
      console.error('Error saving places:', error);
    }
  };
  
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Places to Visit</Text>

          {/* Input Field for Adding Places */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a place..."
              value={place}
              onChangeText={setPlace}
            />
            <TouchableOpacity style={styles.addButton} onPress={addPlace}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Instructional Subtext (shown once) */}
          <Text style={styles.instructionText}>💡 Tip: Tap a place below to quickly add it to your itinerary day.</Text>

          <FlatList
            data={placesList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity 
                style={styles.placeItemWrapper}
                onPress={() => onPlaceTap(item)}
                activeOpacity={0.7}
              >
                <View style={styles.placeItem}>
                  <View style={styles.placeTextWrapper}>
                    <Text style={styles.placeText}>
                      {index + 1}. {item}
                    </Text>
                  </View>

                  <TouchableOpacity onPress={() => deletePlace(index)}>
                    <Text style={styles.deleteText}>❌</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />



          {/* Save & Cancel Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    maxHeight: height * 0.6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10, 
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    height: 42,
  },
    addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  placeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  placeTextWrapper: {
    flex: 1,
    paddingRight: 10, // spacing before ❌ icon
  },
  
  placeText: {
    fontSize: 16,
    color: '#333',
    flexWrap: 'wrap',
  },
  deleteText: {
    fontSize: 16,
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    marginRight: 10,
    padding: 6,
    borderRadius: 4,
    backgroundColor: '#eef7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#007bff',
  },
  placeItemWrapper: {
    width: '100%',
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
    alignSelf: 'flex-start',
    paddingVertical: 10
  },
  
  
  
});

export default PlacesModal;
