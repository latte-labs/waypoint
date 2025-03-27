import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

const CustomDropdown = ({ label, value, options, onChange, disabled }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        onPress={() => !disabled && setVisible(true)}
        style={styles.dropdown}
      >
        <Text style={{ color: value ? '#000' : '#999' }}>{value || 'Select...'}</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.optionBox}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                  style={styles.option}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 40,
  },
  optionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    maxHeight: 300,
  },
  option: {
    paddingVertical: 12,
  },
});

export default CustomDropdown;
