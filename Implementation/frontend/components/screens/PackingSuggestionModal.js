import React from 'react';
import { Modal, View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';

const PackingSuggestionModal = ({ visible, onClose, suggestion, loading }) => {
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
          borderRadius: 15,
          width: '85%',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 5
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 10,
            color: '#1E3A8A'
          }}>
            What to Pack
          </Text>

          {loading ? (
            <ActivityIndicator size="small" color="#1E3A8A" />
          ) : (
            <Text style={{ fontSize: 16, lineHeight: 24 }}>{suggestion}</Text>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 20,
              alignSelf: 'flex-end',
              backgroundColor: '#1E3A8A',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PackingSuggestionModal;
