import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { database } from '../../../firebase'; // adjust this path based on your folder structure
import API_BASE_URL from '../../../config';
import Icon from 'react-native-vector-icons/FontAwesome'

const AddToItineraryModal = ({ visible, onClose, place, onSelectItinerary }) => {
  const [userId, setUserId] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchUserAndItineraries();
    }
  }, [visible]);

  const fetchUserAndItineraries = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      setUserId(user.id);
  
      const [personal, shared] = await Promise.all([
        axios.get(`${API_BASE_URL}/itineraries/users/${user.id}/itineraries`),
        fetchSharedItineraries(user.id)
      ]);
  
      // ✅ Add type to each item
      const combined = [
        ...personal.data.map(item => ({ ...item, type: 'personal' })),
        ...shared.map(item => ({ ...item, type: 'shared' }))
      ];
  
      combined.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setItineraries(combined);
    } catch (err) {
      console.error('Error loading itineraries:', err);
    }
    setLoading(false);
  };
  

  const fetchSharedItineraries = async (uid) => {
    const snapshot = await database().ref('/live_itineraries').once('value');
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const sharedIds = Object.keys(data).filter(
      (id) => data[id].collaborators && data[id].collaborators[uid]
    );

    const shared = await Promise.all(sharedIds.map(async (id) => {
      try {
        const res = await axios.get(`${API_BASE_URL}/itineraries/${id}`);
        return res.data;
      } catch {
        return null;
      }
    }));

    return shared.filter(Boolean);
  };

  const handleSelect = (itineraryId) => {
    onSelectItinerary(itineraryId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add to Itinerary</Text>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : (
            <FlatList
              data={itineraries}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.itineraryItem} 
                  onPress={() => handleSelect(item.id)}
                >
                    <View style={styles.rowBetween}>
                    <View>
                        <Text style={styles.itineraryName}>{item.name}</Text>
                        <Text style={styles.itineraryDestination}>{item.destination}</Text>
                    </View>
                    <Icon
                        name={item.type === 'shared' ? 'users' : 'user'}
                        size={16}
                        color={item.type === 'shared' ? '#28a745' : '#007bff'}
                        style={styles.icon}
                    />
                    </View>
                </TouchableOpacity>
              )}
            />
          )}

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AddToItineraryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  itineraryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itineraryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  itineraryDestination: {
    fontSize: 14,
    color: '#555',
  },
  cancelButton: {
    marginTop: 15,
    paddingVertical: 12,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: 'bold',
    color: '#333',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  icon: {
    marginRight: 10,
  },
  
});
