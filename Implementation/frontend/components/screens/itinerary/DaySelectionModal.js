// components/DaySelectionModal.js

import React from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const DaySelectionModal = ({ visible, onClose, days, onSelectDay }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select a Day</Text>
          <FlatList
            data={days}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 4 }}>
                <TouchableOpacity
                  style={styles.dayItem}
                  onPress={() => onSelectDay(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dayText}>
                    {item.title},{" "}
                    {new Date(item.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '90%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  dayItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 8,
  },
    dayText: {
    fontSize: 16,
    color: '#333',
  },
  cancelText: {
    marginTop: 20,
    color: '#888',
    textAlign: 'center',
    fontSize: 16,
  },
});


export default DaySelectionModal;
