import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, StyleSheet 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';
import DateTimePicker from '@react-native-community/datetimepicker';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';



const ItineraryDayScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itineraryId, dayId } = route.params;
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [selectedTime, setSelectedTime] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newActivity, setNewActivity] = useState({
        time: '',
        name: '',
        location: '',
        notes: '',
        estimated_cost: '',
    });
    const [cardHeight, setCardHeight] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingActivity, setEditingActivity] = useState(null);    
    const [user, setUser] = useState(route.params?.user || null);

    
    const sortActivitiesByTime = (activities) => {
        return activities.sort((a, b) => {
            const parseTime = (time) => {
                const match = time.match(/^(\d+):?(\d*)\s*(AM|PM)$/i);
                if (!match) return 0; // If time is invalid, push it to the end
                let hours = parseInt(match[1], 10);
                let minutes = match[2] ? parseInt(match[2], 10) : 0;
                const period = match[3].toUpperCase();
    
                if (period === "PM" && hours !== 12) hours += 12;
                if (period === "AM" && hours === 12) hours = 0;
    
                return hours * 60 + minutes; // Convert to minutes for easy comparison
            };
    
            return parseTime(a.time) - parseTime(b.time);
        });
    };
    useEffect(() => {
        if (!user) {
          const loadUser = async () => {
            try {
              const storedUser = await AsyncStorage.getItem('user');
              if (storedUser) {
                setUser(JSON.parse(storedUser));
              }
            } catch (error) {
              console.error("❌ Error retrieving user:", error);
            }
          };
          loadUser();
        }
      }, [user]);
            

    // ✅ Fetch Activities from PostgreSQL
    useEffect(() => {
        const fetchActivities = async () => {
          try {
            // Only add header if user is defined
            const config = user
              ? { headers: { "X-User-Id": user.id } }
              : {};
            const response = await axios.get(
              `${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`,
              config
            );
            if (response.status === 200) {
              setActivities(sortActivitiesByTime(response.data.activities));
            }
          } catch (error) {
            console.error("❌ Error fetching activities:", error.response?.data || error.message);
          } finally {
            setLoading(false);
          }
        };
      
        fetchActivities();
    }, [itineraryId, dayId, user]);
          
    // ✅ Function to Handle Time Selection
    const handleTimeChange = (event, selected) => {
        if (selected) {
            setSelectedTime(selected);
        }
    };
    // ✅ Function to Show Placeholder Alert Instead of Deleting
    const handleDeleteActivity = async (activityId) => {
        Alert.alert(
          "Confirm Delete",
          "Are you sure you want to delete this activity?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Delete", 
              style: "destructive",
              onPress: async () => {
                try {
                  const config = {
                    headers: {
                      "X-User-Id": user.id,  // Pass the user ID from AsyncStorage
                    },
                  };
                  const response = await axios.delete(
                    `${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}/activities/${activityId}`,
                    config
                  );
                  if (response.status === 200) {
                    // Remove the deleted activity from state
                    setActivities((prev) => prev.filter((act) => act.id !== activityId));
                  }
                } catch (error) {
                  console.error("❌ Error deleting activity:", error.response?.data || error.message);
                  Alert.alert("Error", "Failed to delete activity.");
                }
              }
            }
          ]
        );
    };
            
    // ✅ Function to Render Swipeable Actions
    const renderRightActions = (activity) => (
        <TouchableOpacity 
          style={[styles.deleteActivityButton, { height: cardHeight }]} 
          onPress={() => handleDeleteActivity(activity.id)}
        >
          <Text style={styles.deleteActivityText}>Delete</Text>
        </TouchableOpacity>
    );
            
    


    // ✅ Function to Format Time in HH:MM AM/PM Format
    const formatTime = (date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // ✅ Function to Close Time Picker Only When "Done" is Pressed
    const handleDone = () => {
        // ✅ Format the selected time before closing
        const formattedTime = formatTime(selectedTime);
        setNewActivity({ ...newActivity, time: formattedTime });
        setShowTimePicker(false);
    };


    // ✅ Placeholder Time (Default: 00:00 AM)
    const displayTime = newActivity.time ? newActivity.time : "00:00 AM";

    // ✅ Handle Add Activity Modal
    const handleOpenModal = () => setModalVisible(true);
    const handleCloseModal = () => setModalVisible(false);

    const validateTimeFormat = (time) => {
        // ✅ Regex to ensure format is `HH:MM AM/PM` or `H AM/PM`
        const timeRegex = /^(0?[1-9]|1[0-2]):?([0-5][0-9])? (AM|PM)$/i;
        return timeRegex.test(time);
    };
    
    const handleSaveActivity = async () => {
        if (!newActivity.name || !newActivity.time) {
          Alert.alert("Missing Fields", "Please enter both time and activity name.");
          return;
        }
      
        if (!validateTimeFormat(newActivity.time)) {
          Alert.alert("Invalid Time Format", "Please enter time in the format HH:MM AM/PM (e.g., 8:30 AM).");
          return;
        }
      
        // Convert estimated_cost to a number
        const cost = newActivity.estimated_cost !== "" ? parseFloat(newActivity.estimated_cost) : 0.0;
        
        const basePayload = {
          time: newActivity.time,
          name: newActivity.name,
          location: newActivity.location || "",
          notes: newActivity.notes || "",
          estimated_cost: cost,
        };
      
        console.log("📤 Sending activity data:", JSON.stringify(basePayload, null, 2));
      
        const config = {
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user ? user.id : "",  // ✅ Ensure user ID is always sent
          },
        };
      
        if (isEditing && editingActivity) {
          // ✅ UPDATE ACTIVITY REQUEST
          try {
            const response = await axios.put(
              `${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}/activities/${editingActivity.id}`,
              basePayload,
              config
            );
            console.log("✅ Update response:", response.data);
            if (response.status === 200) {
              setActivities((prev) =>
                prev.map((act) => (act.id === editingActivity.id ? response.data : act))
              );
              Alert.alert("Success", "Activity updated successfully.");
            }
          } catch (error) {
            console.error("❌ Error updating activity:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to update activity.");
          } finally {
            setIsEditing(false);
            setEditingActivity(null);
            setModalVisible(false);
            setNewActivity({ time: '', name: '', location: '', notes: '', estimated_cost: '' });
          }
        } else {
          // ✅ CREATE NEW ACTIVITY
          try {
            const createPayload = {
              ...basePayload,
              itinerary_day_id: dayId,
            };
            const response = await axios.post(
              `${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}/activities/`,
              createPayload,
              config
            );
            console.log("✅ Create response:", response.data);
            if (response.status === 200) {
              const updatedActivities = sortActivitiesByTime([...activities, response.data]);
              setActivities(updatedActivities);
              setModalVisible(false);
              setNewActivity({ time: '', name: '', location: '', notes: '', estimated_cost: '' });
            }
          } catch (error) {
            console.error("❌ Error adding activity:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to add activity.");
          }
        }
    };
                      
                
    const handleEditActivity = (activity) => {
        setEditingActivity(activity); // ✅ Ensure activity ID is set
        setNewActivity({
          time: activity.time,
          name: activity.name,
          location: activity.location,
          notes: activity.notes || '',
          estimated_cost: activity.estimated_cost ? activity.estimated_cost.toString() : '',
        });
        setIsEditing(true);
        setModalVisible(true);
    };
                    
    const renderLeftActions = (activity) => (
        <TouchableOpacity 
          style={[styles.editActivityButton, { height: cardHeight }]} 
          onPress={() => handleEditActivity(activity)}
        >
          <Text style={styles.editActivityText}>Edit</Text>
        </TouchableOpacity>
    );
                  
    

    // ✅ Render Activity Item
    const renderItem = ({ item }) => (
        <Swipeable 
          renderLeftActions={() => renderLeftActions(item)}
          renderRightActions={() => renderRightActions(item)}
        >
          <TouchableOpacity 
            style={styles.activityCard}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setCardHeight(height);
            }}
          >
            <Text style={styles.activityTime}>🕒 {item.time}</Text>
            <Text style={styles.activityName}>{item.name}</Text>
            <Text style={styles.activityLocation}>📍 {item.location}</Text>
          </TouchableOpacity>
        </Swipeable>
    );
                        
    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>
                    Day Activities
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : activities.length > 0 ? (
                    <FlatList 
                        data={activities}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />
                ) : (
                    <Text style={{ textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 }}>
                        No activities planned.
                    </Text>
                )}

                {/* ✅ Add Activity Button */}
                <TouchableOpacity 
                    style={{
                        position: 'absolute', 
                        bottom: 20, 
                        left: 20, 
                        right: 20, 
                        padding: 15, 
                        backgroundColor: '#007bff', 
                        borderRadius: 8, 
                        alignItems: 'center',
                    }} 
                    onPress={handleOpenModal}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>+ Add Activity</Text>
                </TouchableOpacity>

                {/* ✅ Modal for Adding Activity */}
                <Modal visible={modalVisible} animationType="slide" transparent={true}>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    }}>
                        <View style={{
                            width: '80%',
                            backgroundColor: '#fff',
                            padding: 20,
                            borderRadius: 10,
                        }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
                                Add New Activity
                            </Text>

                            {/* ✅ Clickable Placeholder for Time Selection */}
                            <TouchableOpacity 
                                onPress={() => setShowTimePicker(true)} 
                                style={styles.timeBox}
                            >
                                <Text style={styles.timeText}>{displayTime}</Text>
                            </TouchableOpacity>

                            {/* ✅ Modal with Time Picker & "Done" Button */}
                            <Modal visible={showTimePicker} transparent={true} animationType="slide">
                                <View style={styles.modalContainer}>
                                    <View style={styles.modalContent}>
                                        <DateTimePicker
                                            value={selectedTime}
                                            mode="time"
                                            display="spinner" // ✅ Allows scrolling hours, minutes, AM/PM
                                            onChange={handleTimeChange} // ✅ No longer closes automatically
                                        />

                                        {/* ✅ DONE Button to Close Time Picker */}
                                        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
                                            <Text style={styles.doneText}>DONE</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </Modal>

                            <TextInput 
                                placeholder="Activity Name"
                                style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
                                value={newActivity.name}
                                onChangeText={(text) => setNewActivity({ ...newActivity, name: text })}
                            />
                            <TextInput 
                                placeholder="Location (optional)"
                                style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
                                value={newActivity.location}
                                onChangeText={(text) => setNewActivity({ ...newActivity, location: text })}
                            />
                            <TextInput 
                                placeholder="Estimated Cost (optional)"
                                style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
                                keyboardType="numeric"
                                value={newActivity.estimated_cost}
                                onChangeText={(text) => setNewActivity({ 
                                    ...newActivity, 
                                    estimated_cost: text !== "" ? parseFloat(text) : 0.0 
                                })}                                
                            />

                            <TouchableOpacity 
                                style={{ backgroundColor: '#007bff', padding: 10, borderRadius: 5, alignItems: 'center' }}
                                onPress={handleSaveActivity}
                            >
                                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCloseModal}>
                                <Text style={{ textAlign: 'center', color: '#007bff', marginTop: 10 }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    timeBox: {
        borderBottomWidth: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        width: 300,
    },
    doneButton: {
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007bff',
        borderRadius: 5,
    },
    doneText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    deleteActivityButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 8,
        marginLeft: 10, 
    },
    deleteActivityText: { 
        color: '#fff', 
        fontSize: 14, 
        fontWeight: 'bold',
        textAlign: 'center'
    },
    activityCard: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    activityTime: { fontSize: 14, fontWeight: 'bold', color: '#007bff' },
    activityName: { fontSize: 16, fontWeight: '600', color: '#222' },
    activityLocation: { fontSize: 14, color: '#555' },
    editActivityButton: {
        backgroundColor: 'green', // or a color of your choice
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    editActivityText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center'
    },
      
});


export default ItineraryDayScreen;
