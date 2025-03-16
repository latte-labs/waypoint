import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Pressable
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome'; // ✅ Import FontAwesome icons
import { database } from '../../../firebase'; // ✅ Ensure correct import


const ItineraryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itineraryId } = route.params;

    const [itinerary, setItinerary] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState([]); // Store ordered days
    const [dayHeights, setDayHeights] = useState({}); // Store heights dynamically
    
    const [modalVisible, setModalVisible] = useState(false);
    const [dayTitle, setDayTitle] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isCollaborator, setIsCollaborator] = useState(false); // ✅ New state to check collaboration
    const [owner, setOwner] = useState({ name: "", email: "" });
    const [editingDayId, setEditingDayId] = useState(null);


    // ✅ Load user data from AsyncStorage
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("❌ Error retrieving user:", error);
            }
        };
        fetchUserData();
    }, []);

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
    // ✅ Fetch Itinerary Details Function
    const fetchItineraryDetails = async () => {
        try {
            console.log("🔄 Fetching itinerary details...");
            const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
    
            if (response.status === 200) {
                const sortedDays = response.data.days.map(day => ({
                    ...day,
                    activities: sortActivitiesByTime(day.activities),
                }));
    
                setItinerary(response.data);
                setDays(sortedDays); // ✅ Update `days`
                console.log("✅ Days updated:", sortedDays);
    
                // ✅ Fetch Owner Details
                const ownerResponse = await axios.get(`${API_BASE_URL}/users/${response.data.created_by}`);
                if (ownerResponse.status === 200) {
                    setOwner({
                        name: ownerResponse.data.name,
                        email: ownerResponse.data.email
                    });
                }
    
                // ✅ Check if logged-in user is a collaborator
                // if (user?.id) {
                //     console.log(`🔄 Checking if user ${user.id} is a collaborator...`);
                //     const snapshot = await database().ref(`/live_itineraries/${itineraryId}/collaborators/${user.id}`).once('value');
                //     if (snapshot.exists()) {
                //         setIsCollaborator(true);
                //     } else {
                //         setIsCollaborator(false);
                //     }
                //     console.log(`✅ User is collaborator: ${snapshot.exists()}`);
                // }
            }
        } catch (error) {
            console.error("❌ Error in fetchItineraryDetails:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to load itinerary details.");
        } finally {
            setLoading(false);
            console.log("✅ Finished loading itinerary details");
        }
    };
        
    // ✅ Use `useFocusEffect` to Refresh Data When Screen Comes Back into Focus
    useFocusEffect(
        useCallback(() => {
            fetchItineraryDetails();
        }, [itineraryId])
    );

    // ✅ New Effect: Check Collaborator Status When User and Itinerary Are Loaded
    useEffect(() => {
        if (user?.id && itinerary) {
            const ref = database().ref(`/live_itineraries/${itineraryId}/collaborators/${user.id}`);
            ref.once('value')
            .then(snapshot => {
                setIsCollaborator(snapshot.exists());
            })
            .catch(error => console.error("Error checking collaborator:", error));
        }
        }, [user, itinerary, itineraryId]);
      

    // ✅ Handle Drag & Drop Reordering
    const handleDragEnd = async ({ data }) => {
        setDays(data); // ✅ Update frontend order

        // ✅ Prepare request to update backend order
        const updatedOrder = data.map((day, index) => ({
            id: day.id,
            order_index: index
        }));

        try {
            await axios.patch(`${API_BASE_URL}/itineraries/${itineraryId}/days/reorder`, { days: updatedOrder });
            console.log("✅ Days reordered successfully!");
        } catch (error) {
            console.error("❌ Error updating order:", error);
            Alert.alert("Error", "Failed to save new order.");
        }
    };
    const renderRightActions = (dayId) => (
        <TouchableOpacity 
            style={[styles.deleteDayButton, { height: dayHeights[dayId] || 0 }]} 
            onPress={() => handleDeleteDay(dayId)}
        >
            <Text style={styles.deleteDayText}>Delete</Text>
        </TouchableOpacity>
    );

    const renderLeftActions = (dayId) => (
        <TouchableOpacity 
          style={[styles.editDayButton, { height: dayHeights[dayId] || 0 }]} 
          onPress={() => handleEditDay(dayId)}
        >
          <Text style={styles.editDayText}>Edit</Text>
        </TouchableOpacity>
    );
    const handleEditDay = (dayId) => {
        // Find the day to edit from your days array
        const dayToEdit = days.find((day) => day.id === dayId);
        if (dayToEdit) {
          setEditingDayId(dayId); // Mark this day as being edited
          setDayTitle(dayToEdit.title);
          // Convert the date into "YYYY-MM-DD" format if it isn’t already
          setSelectedDate(new Date(dayToEdit.date).toISOString().split('T')[0]);
          setModalVisible(true);
        }
    };
      
      
    // ✅ Handle Delete Itinerary
    const handleDelete = async () => {
        Alert.alert(
            "Delete Itinerary",
            "Are you sure you want to delete this itinerary? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/itineraries/${itineraryId}`);
                            Alert.alert("Success", "Itinerary deleted successfully!");
                            navigation.navigate('Itinerary'); // ✅ Navigate back
                        } catch (error) {
                            console.error("❌ Error deleting itinerary:", error.response?.data || error.message);
                            Alert.alert("Error", "Failed to delete itinerary.");
                        }
                    }
                }
            ]
        );
    };

    // ✅ Handle Delete Itinerary Day
    const handleDeleteDay = async (dayId) => {
        Alert.alert(
            "Delete Day",
            "Are you sure you want to delete this day? All activities will be removed.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axios.delete(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`);
                            Alert.alert("Success", "Day deleted successfully!");

                            // ✅ Refresh the itinerary days list
                            fetchItineraryDetails();
                        } catch (error) {
                            console.error("❌ Error deleting day:", error.response?.data || error.message);
                            Alert.alert("Error", "Failed to delete itinerary day.");
                        }
                    }
                }
            ]
        );
    };
    const parseLocalDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number);
        // The month is 0-indexed in the Date constructor
        return new Date(year, month - 1, day);
    };
      
    
    // ✅ Handle Adding a New Day
    const handleAddDay = async () => {
        if (!dayTitle.trim()) {
          Alert.alert("Missing Field", "Please enter a title for the day.");
          return;
        }
        if (!selectedDate) {
          Alert.alert("Missing Field", "Please select a date.");
          return;
        }
      
        try {
          // Convert the selected date to a local Date object
          const localDate = parseLocalDate(selectedDate);
          const response = await axios.post(`${API_BASE_URL}/itineraries/${itineraryId}/days/`, {
            date: localDate.toISOString(), // Converts the local date to ISO string
            title: dayTitle,
            itinerary_id: itineraryId,
          });
      
          if (response.status === 200) {
            const newDayId = response.data.id;
            Alert.alert("Success", "Day added successfully!");
      
            setModalVisible(false);
            fetchItineraryDetails();
            navigation.navigate('ItineraryDay', { itineraryId, dayId: newDayId });
          }
        } catch (error) {
          console.error("❌ Error adding day:", error.response?.data || error.message);
          Alert.alert("Error", "Failed to add itinerary day.");
        }
      };
          
    const handleRemoveMyself = async () => {
        Alert.alert(
            "Leave Itinerary",
            "Are you sure you want to remove yourself from this itinerary? You will lose access.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            // ✅ Remove collaborator from Firebase
                            await database().ref(`/live_itineraries/${itineraryId}/collaborators/${user.id}`).remove();
                            console.log(`✅ User ${user.id} removed from itinerary ${itineraryId}`);
    
                            Alert.alert("Success", "You have been removed from this itinerary.");
                            
                            // ✅ Navigate back to ItineraryListScreen
                            navigation.navigate('Itinerary');
                        } catch (error) {
                            console.error("❌ Error removing user:", error);
                            Alert.alert("Error", "Failed to remove yourself from the itinerary.");
                        }
                    }
                }
            ]
        );
    };

    const handleUpdateDay = async () => {
        if (!dayTitle.trim()) {
          Alert.alert("Missing Field", "Please enter a title for the day.");
          return;
        }
        if (!selectedDate) {
          Alert.alert("Missing Field", "Please select a date.");
          return;
        }
        try {
          // Convert selectedDate into a local Date using a helper
          const parseLocalDate = (dateString) => {
            const [year, month, day] = dateString.split('-').map(Number);
            return new Date(year, month - 1, day);
          };
          const localDate = parseLocalDate(selectedDate);
          const response = await axios.put(`${API_BASE_URL}/itineraries/${itineraryId}/days/${editingDayId}`, {
            date: localDate.toISOString(),
            title: dayTitle,
            itinerary_id: itineraryId,
          });
          if (response.status === 200) {
            Alert.alert("Success", "Day updated successfully!");
            setModalVisible(false);
            setEditingDayId(null); // Clear the editing state
            fetchItineraryDetails();
          }
        } catch (error) {
          console.error("❌ Error updating day:", error.response?.data || error.message);
          Alert.alert("Error", "Failed to update itinerary day.");
        }
    };
      
    
    // ✅ Render Each Day with Swipe-to-Delete & Drag Support
    const renderItem = ({ item, drag }) => (
        <Swipeable
            key={item.id}
            renderLeftActions={() => renderLeftActions(item.id)}
            renderRightActions={() => renderRightActions(item.id)}
        >
            <TouchableOpacity 
                onPress={() => navigation.navigate('ItineraryDay', { itineraryId, dayId: item.id })} // ✅ Navigate to ItineraryDayScreen
                onLongPress={drag} 
                style={styles.dayCard}
                onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                    setDayHeights((prev) => ({ ...prev, [item.id]: height }));
                }}
            >
                <Text style={styles.dayTitle}>{item.title}</Text>
                <Text style={styles.dayDate}>
                    {new Date(item.date).toLocaleDateString()}
                </Text>
    
                {/* Render activities */}
                {item.activities && item.activities.length > 0 ? (
                    item.activities.map((activity) => (
                        <View key={activity.id} style={styles.activityCard}>
                            <Text style={styles.activityTime}>{activity.time}</Text>
                            <Text style={styles.activityName}>{activity.name}</Text>
                            <Text style={styles.activityLocation}>
                                📍 {activity.location}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.noActivities}>No activities planned.</Text>
                )}
            </TouchableOpacity>
        </Swipeable>
    );
    

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaWrapper>
                <View style={styles.container}>
                    {/* ✅ Modal for Adding a New Day */}
                    <Modal visible={modalVisible} transparent animationType="slide">
                        <View style={styles.modalContainer}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Add a New Day</Text>

                                {/* ✅ Input for Day Title */}
                                <TextInput
                                    placeholder="Enter day title"
                                    style={styles.input}
                                    value={dayTitle}
                                    onChangeText={setDayTitle}
                                />

                                {/* ✅ Date Selection Button */}
                                <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.dateText}>
                                        {selectedDate ? parseLocalDate(selectedDate).toDateString() : "Select Date"}
                                    </Text>
                                </TouchableOpacity>

                                {/* ✅ Calendar for Single Date Selection */}
                                {showDatePicker && (
                                    <View style={styles.calendarContainer}>
                                        <Calendar
                                            onDayPress={(day) => {
                                                setSelectedDate(day.dateString); // ✅ Save as YYYY-MM-DD
                                                setShowDatePicker(false); // ✅ Close after selection
                                            }}
                                            markedDates={{
                                                [selectedDate]: { selected: true, selectedColor: '#007bff' },
                                            }}
                                            theme={{
                                                selectedDayBackgroundColor: '#007bff',
                                                todayTextColor: '#F82E08',
                                                arrowColor: '#007bff',
                                            }}
                                        />
                                    </View>
                                )}

                                {/* ✅ Confirm Button */}
                                <Pressable
                                    style={styles.modalButton}
                                    onPress={editingDayId ? handleUpdateDay : handleAddDay}
                                    >
                                    <Text style={styles.modalButtonText}>
                                        {editingDayId ? "Update Day" : "Add Day"}
                                    </Text>
                                </Pressable>

                                {/* ✅ Cancel Button */}
                                <Pressable style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>


                    {loading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : itinerary ? (
                        <>
                            
                            {/* ✅ FIXED HEADER (Itinerary Details) */}
                            <View style={styles.headerContainer}>
                                <Text style={styles.title}>{itinerary.name}</Text>
                                <Text style={styles.detail}>Destination: {itinerary.destination}</Text>
                                <Text style={styles.detail}>
                                    {new Date(itinerary.start_date).toLocaleDateString()} - {new Date(itinerary.end_date).toLocaleDateString()}
                                </Text>
                                {user ? (
                                    <Text style={styles.detail}>
                                        Created by: {user?.id === itinerary.created_by ? "You" : `${owner.name} (${owner.email})`}
                                    </Text>
                                ) : (
                                    <Text style={styles.errorText}>⚠ Unable to load user details.</Text>
                                )}
                            </View>
                            {/* ✅ Collaborators Section */}
                            <View style={styles.sharedContainer}>
                                <Text style={styles.sharedTitle}>Collaborators</Text>
                                <Text style={styles.sharedPlaceholder}>(Fetching collaborators...)</Text>
                            </View> 
    
                            {/* ✅ FLEXIBLE SCROLLABLE LIST */}
                            <View style={styles.listContainer}>
                                {days.length === 0 ? (
                                    <>
                                        <Text style={styles.noDaysText}>Nothing is planned yet.</Text>
                                        <TouchableOpacity 
                                            style={styles.addDayButton} 
                                            onPress={() => setModalVisible(true)}
                                        >
                                            <Text style={styles.addDayButtonText}>+ Add Day</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <DraggableFlatList
                                        data={days}
                                        keyExtractor={(item) => item.id}
                                        renderItem={renderItem}
                                        onDragEnd={handleDragEnd}
                                        contentContainerStyle={{ paddingBottom: 80 }} // ✅ Ensures space for Add Day button
                                        ListFooterComponent={
                                            <TouchableOpacity 
                                                style={styles.addDayButton} 
                                                onPress={() => setModalVisible(true)}
                                            >
                                                <Text style={styles.addDayButtonText}>+ Add Day</Text>
                                            </TouchableOpacity>
                                        }
                                    />
                                )}
                            </View>

                            {/* ✅ FIXED BOTTOM BUTTONS */}
                            <View style={styles.buttonContainer}>
                                {/* ✅ Show Invite Button Only If User is the Owner */}
                                {user?.id === itinerary?.created_by && (
                                    <TouchableOpacity 
                                        style={styles.inviteButton} 
                                        onPress={() => navigation.navigate('InviteCollaborators', { itinerary })}
                                    >
                                        <Text style={styles.buttonText}>Invite</Text>
                                    </TouchableOpacity>
                                )}


                                {/* ✅ Edit Itinerary Button */}
                                <TouchableOpacity 
                                    style={styles.editButton}
                                    onPress={() => navigation.navigate('ItineraryForm', { itineraryId: itinerary.id, userId: itinerary.created_by })}
                                >
                                    <Text style={styles.buttonText}>Edit</Text>
                                </TouchableOpacity>

                                {/* ✅ Ensure "Remove" is shown correctly for collaborators */}
                                {isCollaborator && user?.id !== itinerary?.created_by ? (
                                    <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMyself}>
                                        <Text style={styles.buttonText}>Remove</Text>
                                    </TouchableOpacity>
                                ) : (
                                    user?.id === itinerary?.created_by && (
                                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                                            <Text style={styles.buttonText}>
                                                <Icon name="trash" size={20} color="white" /> 
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                )}
                            </View>
                        </>
                    ) : (
                        <Text style={styles.errorText}>Itinerary not found.</Text>
                    )}
                </View>
            </SafeAreaWrapper>
        </GestureHandlerRootView>
    );
    
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    // ✅ HEADER (Fixed at the top)
    headerContainer: {
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginHorizontal: 10
    },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    detail: { fontSize: 14, marginBottom: 5, color: '#333' },
    // ✅ FLEXIBLE LIST CONTAINER
    listContainer: {
        flex: 1, // Allows itinerary list to take remaining space
        paddingHorizontal: 8,
    },
    // ✅ SCROLLABLE DAYS
    daysContainer: {
        flexGrow: 1, // Allows the list to be scrollable
        paddingBottom: 80, // Prevents list from being covered by buttons
    },
    dayCard: { 
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',  // ✅ Ensure it matches the full available width
        alignSelf: 'center',  // ✅ Prevents shrinking based on text
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    dayTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    dayDate: { fontSize: 14, color: '#555', marginBottom: 10 },

    deleteDayButton: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 8,
        marginLeft: 10, 
    },
    deleteDayText: { 
        color: '#fff', 
        fontSize: 14, 
        fontWeight: 'bold',
        textAlign: 'center'
    },

    activityCard: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
        borderLeftWidth: 5,
        borderLeftColor: '#007bff',
        width: '100%',  // ✅ Ensures same width as day card
        alignSelf: 'center',
    },
    activityTime: { fontSize: 14, fontWeight: 'bold', color: '#007bff' },
    activityName: { fontSize: 16, fontWeight: '600', color: '#222' },
    activityLocation: { fontSize: 14, color: '#555' },
    noActivities: { fontSize: 14, color: '#888', fontStyle: 'italic' },
    noDaysText: { fontSize: 14, textAlign: 'center', color: '#888' },

    // ✅ FIXED BOTTOM BUTTONS
    buttonContainer: { 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        flexDirection: 'row', 
        padding: 10, 
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    editButton: { 
        flex: 0.8, 
        padding: 15, 
        backgroundColor: '#007bff', 
        borderRadius: 8, 
        alignItems: 'center', 
        marginRight: 5 
    },
    deleteButton: {
        flex: 0.2,
        padding: 15,
        backgroundColor: 'red',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center', // ✅ Centers the trash icon
        marginLeft: 5
    },
    buttonText: { 
        color: '#fff', 
        fontSize: 14, 
    },

    addDayButton: {
        backgroundColor: '#007bff',
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    addDayButtonText: {
        color: '#fff',
        fontSize: 14,
    },
    noDaysText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ Semi-transparent background
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5, // ✅ Adds shadow for better UI
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        textAlign: 'center',
    },
    datePicker: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    dateText: {
        fontSize: 16,
        color: '#333',
    },
    modalButton: {
        width: '100%',
        padding: 12,
        backgroundColor: '#007bff',
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inviteButton: {
        flex: 0.6, // Same width proportion as other buttons
        padding: 15,
        backgroundColor: '#28a745', // ✅ Green color for invite action
        borderRadius: 8,
        alignItems: 'center',
        marginRight: 5,
    },
    removeButton: {
        flex: 0.8, // Same width as other buttons
        padding: 15,
        backgroundColor: 'gray', // ✅ Gray color for "Remove" button
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5
    },
    editDayButton: {
        backgroundColor: 'green', // Customize as needed for the edit action
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        borderRadius: 8,
        marginRight: 10, // Adjust spacing as needed
    },
    editDayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
      
});

export default ItineraryDetailScreen;
