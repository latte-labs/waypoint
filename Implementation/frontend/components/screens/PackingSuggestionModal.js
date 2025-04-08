import React from 'react';
import { Modal, View, Text, ActivityIndicator, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const PackingSuggestionModal = ({ visible, onClose, suggestion, loading }) => {
  const formatSuggestions = (text) => {
    return text.split('\n').filter(Boolean); // if your suggestion is multi-line
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 20,
          width: '90%',
          maxHeight: '75%',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 5,
        }}>

          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#1E3A8A',
            marginBottom: 10,
            textAlign: 'center',
          }}>
            Your Packing List
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#1E3A8A" />
          ) : (
            <ScrollView style={{ maxHeight: 200, marginTop: 5 }}>
              {formatSuggestions(suggestion).map((item, idx) => (
                <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <Icon name="check-circle" size={18} color="#1E3A8A" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 15, lineHeight: 22, flex: 1 }}>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 15,
              alignSelf: 'center',
              backgroundColor: '#1E3A8A',
              paddingVertical: 10,
              paddingHorizontal: 24,
              borderRadius: 25,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PackingSuggestionModal;
