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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PlacesModal = ({ visible, onClose }) => {
  const [place, setPlace] = useState('');
  const [placesList, setPlacesList] = useState([]);

  // Load places from AsyncStorage when modal opens
  useEffect(() => {
    if (visible) {
      const loadPlaces = async () => {
        try {
          const savedPlaces = await AsyncStorage.getItem('itinerary_places');
          if (savedPlaces) {
            setPlacesList(JSON.parse(savedPlaces));
          }
        } catch (error) {
          console.error('Error loading places:', error);
        }
      };
      loadPlaces();
    }
  }, [visible]);

  // Function to add a place
  const addPlace = () => {
    if (place.trim() === '') {
      Alert.alert("Empty Input", "Please enter a place name.");
      return;
    }
    setPlacesList([...placesList, place]);
    setPlace('');
  };

  // Function to delete a place from the list
  const deletePlace = (index) => {
    const updatedList = placesList.filter((_, i) => i !== index);
    setPlacesList(updatedList);
  };

  // Function to save places to AsyncStorage and close modal
  const savePlaces = async () => {
    try {
      await AsyncStorage.setItem('itinerary_places', JSON.stringify(placesList));
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

          {/* List of Places */}
          <FlatList
            data={placesList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.placeItem}>
                <Text style={styles.placeText}>{item}</Text>
                <TouchableOpacity onPress={() => deletePlace(index)}>
                  <Text style={styles.deleteText}>❌</Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Save & Cancel Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={savePlaces}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
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
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    marginRight: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
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
  placeText: {
    fontSize: 16,
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
});

export default PlacesModal;
