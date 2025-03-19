import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Future: Enable Firebase when switching from AsyncStorage
import { database } from '../../../firebase';


const NotesModal = ({ visible, onClose, itineraryId }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!visible) return;
  
    const notesRef = database().ref(`/live_itineraries/${itineraryId}/notes`);
    
    notesRef.on('value', (snapshot) => {
      if (snapshot.exists()) {
        setNotes(snapshot.val());
      } else {
        setNotes(''); // Default empty note if none exists
      }
    });
  
    return () => notesRef.off(); // Cleanup listener when modal closes
  }, [visible, itineraryId]);
    
  const saveNotes = async () => {
    try {
      await database().ref(`/live_itineraries/${itineraryId}/notes`).set(notes);
      onClose(); // Close modal after saving
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };
    
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Notes</Text>
  
          {/* Expandable Writing Area */}
          <TextInput
            style={styles.textInput}
            placeholder="Write your notes here..."
            multiline
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
            scrollEnabled={true} // Allows scrolling inside input if needed
          />
  
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveNotes}>
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
    width: '90%', 
    height: '60%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    width: '100%',
    height: '70%', 
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 15,
    fontSize: 16, 
    textAlignVertical: 'top', 
    backgroundColor: '#f9f9f9',
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

export default NotesModal;
