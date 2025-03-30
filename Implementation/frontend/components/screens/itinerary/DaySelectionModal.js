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
              <TouchableOpacity
                style={styles.dayItem}
                onPress={() => onSelectDay(item)}
              >
                <Text style={styles.dayText}>
                {item.title}, {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                })}
                </Text>
              </TouchableOpacity>
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
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { width: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  dayItem: { paddingVertical: 12 },
  dayText: { fontSize: 16 },
  cancelText: { marginTop: 15, color: 'gray', textAlign: 'center' }
});

export default DaySelectionModal;
