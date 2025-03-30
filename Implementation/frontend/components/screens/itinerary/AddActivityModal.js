// components/AddActivityModal.js

import React from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet 
} from 'react-native';

const AddActivityModal = ({
  visible,
  onClose,
  newActivity,
  setNewActivity,
  showTimePicker,
  setShowTimePicker,
  handleSaveActivity,
  handleDone,
  selectedTime,
  setSelectedTime,
  DateTimePicker
}) => {
    const displayTime = newActivity.time || 'Tap to choose time';
  
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New Activity</Text>

          {/* Time Selector */}
          <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timeBox}>
            <Text style={styles.timeText}>{displayTime}</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <Modal visible={true} transparent animationType="slide">
              <View style={styles.modalOverlay}>
                <View style={styles.innerTimePicker}>
                  <DateTimePicker
                    value={selectedTime}
                    mode="time"
                    display="spinner"
                    onChange={(e, selected) => {
                        if (selected) {
                            setSelectedTime(selected); 
                        }
                      }}                      
                  />
                  <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                    <Text style={styles.doneText}>DONE</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}

          <TextInput
            placeholder="Activity Name"
            style={styles.input}
            value={newActivity.name}
            onChangeText={(text) => setNewActivity({ ...newActivity, name: text })}
          />
          <TextInput
            placeholder="Location (optional)"
            style={styles.input}
            value={newActivity.location}
            onChangeText={(text) => setNewActivity({ ...newActivity, location: text })}
          />
          <TextInput
            placeholder="Estimated Cost (optional)"
            style={styles.input}
            keyboardType="numeric"
            value={newActivity.estimated_cost.toString()}
            onChangeText={(text) =>
              setNewActivity({ ...newActivity, estimated_cost: text })
            }
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveActivity}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%', backgroundColor: '#fff',
    padding: 20, borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18, fontWeight: 'bold', marginBottom: 10,
  },
  timeBox: {
    borderBottomWidth: 1, padding: 10, backgroundColor: '#f0f0f0',
    borderRadius: 5, alignItems: 'center', marginBottom: 10
  },
  timeText: { fontSize: 16, color: '#333' },
  input: {
    borderBottomWidth: 1, marginBottom: 10, padding: 5
  },
  saveBtn: {
    backgroundColor: '#007bff', padding: 10,
    borderRadius: 5, alignItems: 'center'
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelText: { textAlign: 'center', color: '#007bff', marginTop: 10 },
  doneButton: {
    marginTop: 10, padding: 10,
    backgroundColor: '#007bff', borderRadius: 5,
  },
  doneText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  innerTimePicker: {
    backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center'
  },
});

export default AddActivityModal;
