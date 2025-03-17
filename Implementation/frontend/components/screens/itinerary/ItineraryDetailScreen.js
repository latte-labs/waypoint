import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, Modal, TextInput, Pressable 
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { database } from '../../../firebase';

const DayCard = memo(({ item, onPress, onLongPress, onEdit, renderRightActions, onLayout }) => {
  return (
    <Swipeable
      overshootLeft={false}
      overshootRight={false}
      // We'll keep only the right swipe (delete) action now.
      renderRightActions={() => renderRightActions(item.id)}
    >
      <TouchableOpacity 
        onPress={() => onPress(item.id)} 
        onLongPress={onLongPress} 
        style={styles.dayCard}
        onLayout={onLayout}
      >
        <Text style={styles.dayTitle}>{item.title}</Text>
        <Text style={styles.dayDate}>
          {new Date(item.date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
        {item.activities && item.activities.length > 0 ? (
          item.activities.map(activity => (
            <View key={activity.id} style={styles.activityCard}>
              <Text style={styles.activityTime}>{activity.time}</Text>
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityLocation}>📍 {activity.location}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noActivities}>No activities planned.</Text>
        )}
        {/* Dedicated edit icon overlay */}
        <TouchableOpacity 
          style={styles.editIconContainer}
          onPress={() => onEdit(item.id)}
        >
          <Icon name="pencil" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );
});


const ItineraryDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itineraryId } = route.params;

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Overview' },
    { key: 'days', title: 'Days' }
  ]);

  const [itinerary, setItinerary] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);
  // Use a ref for dynamic day heights to avoid re-renders
  const dayHeightsRef = useRef({});

  // Modal and Calendar state for Add/Edit day
  const [modalVisible, setModalVisible] = useState(false);
  const [dayTitle, setDayTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [owner, setOwner] = useState({ name: "", email: "" });
  const [editingDayId, setEditingDayId] = useState(null);

  // To View Collaborators
  const [collaborators, setCollaborators] = useState([]);


  // Load user data from AsyncStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error retrieving user:", error);
      }
    };
    fetchUserData();
  }, []);

  // Helper: Parse date string (YYYY-MM-DD) to Date
  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  // Sort activities by time
  const sortActivitiesByTime = (activities) => {
    return activities.sort((a, b) => {
      const parseTime = (time) => {
        const match = time.match(/^(\d+):?(\d*)\s*(AM|PM)$/i);
        if (!match) return 0;
        let hours = parseInt(match[1], 10);
        let minutes = match[2] ? parseInt(match[2], 10) : 0;
        const period = match[3].toUpperCase();
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      return parseTime(a.time) - parseTime(b.time);
    });
  };

  // Fetch itinerary details and owner info
  const fetchItineraryDetails = async () => {
    try {
      console.log("Fetching itinerary details...");
      const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
      if (response.status === 200) {
        const sortedDays = response.data.days.map(day => ({
          ...day,
          activities: sortActivitiesByTime(day.activities),
        }));
        setItinerary(response.data);
        setDays(sortedDays);
        console.log("Days updated:", sortedDays);

        const ownerResponse = await axios.get(`${API_BASE_URL}/users/${response.data.created_by}`);
        if (ownerResponse.status === 200) {
          setOwner({
            name: ownerResponse.data.name,
            email: ownerResponse.data.email
          });
        }
      }
    } catch (error) {
      console.error("Error in fetchItineraryDetails:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to load itinerary details.");
    } finally {
      setLoading(false);
      console.log("Finished loading itinerary details");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItineraryDetails();
    }, [itineraryId])
  );

  // Check collaborator status in Firebase
  useEffect(() => {
    if (itinerary) {
      const collaboratorRef = database().ref(`/live_itineraries/${itineraryId}/collaborators`);
      const handleCollaboratorChange = async (snapshot) => {
        if (snapshot.exists()) {
          const collabData = snapshot.val();
          const userIds = Object.keys(collabData);
          // Fetch user details from /users node
          const userSnapshot = await database().ref('/users').once('value');
          const usersData = userSnapshot.val();
          const collaboratorsList = userIds.map(userId => ({
            userId,
            name: usersData[userId]?.name || "Unknown",
            email: usersData[userId]?.email || "No Email",
          }));
          setCollaborators(collaboratorsList);
        } else {
          setCollaborators([]);
        }
      };
      collaboratorRef.on('value', handleCollaboratorChange);
      return () => {
        collaboratorRef.off('value', handleCollaboratorChange);
      };
    }
  }, [itineraryId, itinerary]);
  
  const handleDayPress = useCallback((dayId) => {
    navigation.navigate('ItineraryDay', { itineraryId, dayId });
  }, [itineraryId, navigation]);

  const handleDragEnd = useCallback(async ({ data }) => {
    setDays(data);
    const updatedOrder = data.map((day, index) => ({
      id: day.id,
      order_index: index
    }));
    try {
      await axios.patch(`${API_BASE_URL}/itineraries/${itineraryId}/days/reorder`, { days: updatedOrder });
      console.log("Days reordered successfully!");
    } catch (error) {
      console.error("Error updating order:", error);
      Alert.alert("Error", "Failed to save new order.");
    }
  }, [itineraryId]);

  // Use a default height (80) if no measured height exists
  const renderRightActions = useCallback((dayId) => (
    <TouchableOpacity 
      style={[styles.deleteDayButton, { height: dayHeightsRef.current[dayId] || 80 }]} 
      onPress={() => handleDeleteDay(dayId)}
    >
      <Text style={styles.deleteDayText}>Delete</Text>
    </TouchableOpacity>
  ), [handleDeleteDay]);

  const renderLeftActions = useCallback((dayId) => (
    <TouchableOpacity 
      style={[styles.editDayButton, { height: dayHeightsRef.current[dayId] || 80 }]}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      onPress={() => {
        console.log("Edit pressed for day", dayId);
        handleEditDay(dayId);
      }}
    >
      <Text style={styles.editDayText}>Edit</Text>
    </TouchableOpacity>
  ), [handleEditDay]);

  // When editing, load the day info and open modal with a slight delay
  const handleEditDay = useCallback((dayId) => {
    const dayToEdit = days.find(day => day.id === dayId);
    if (dayToEdit) {
      console.log("Editing day:", dayToEdit);
      setEditingDayId(dayId);
      setDayTitle(dayToEdit.title);
      setSelectedDate(new Date(dayToEdit.date).toISOString().split('T')[0]);
      setTimeout(() => {
        setModalVisible(true);
      }, 100);
    }
  }, [days]);

  // Delete a day
  const handleDeleteDay = useCallback(async (dayId) => {
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
              const config = { headers: { "X-User-Id": user.id } };
              await axios.delete(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`, config);
              Alert.alert("Success", "Day deleted successfully!");
              fetchItineraryDetails();
            } catch (error) {
              console.error("Error deleting day:", error.response?.data || error.message);
              Alert.alert("Error", "Failed to delete itinerary day.");
            }
          }
        }
      ]
    );
  }, [user, itineraryId]);

  // Handle adding a new day
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
      const localDate = parseLocalDate(selectedDate);
      const response = await axios.post(
        `${API_BASE_URL}/itineraries/${itineraryId}/days/`,
        {
          date: localDate.toISOString(),
          title: dayTitle,
          itinerary_id: itineraryId,
        },
        {
          headers: {
            "X-User-Id": user.id,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        const newDayId = response.data.id;
        Alert.alert("Success", "Day added successfully!");
        setModalVisible(false);
        fetchItineraryDetails();
        navigation.navigate('ItineraryDay', { itineraryId, dayId: newDayId, user });
      }
    } catch (error) {
      console.error("Error adding day:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to add itinerary day.");
    }
  };

  // Handle updating an existing day
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
      const localDate = parseLocalDate(selectedDate);
      const requestData = {
        date: localDate.toISOString(),
        title: dayTitle,
        itinerary_id: itineraryId,
      };
      const config = {
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user.id,
        },
      };
      const response = await axios.put(
        `${API_BASE_URL}/itineraries/${itineraryId}/days/${editingDayId}`,
        requestData,
        config
      );
      if (response.status === 200) {
        Alert.alert("Success", "Day updated successfully!");
        setModalVisible(false);
        setEditingDayId(null);
        fetchItineraryDetails();
      }
    } catch (error) {
      console.error("Error updating day:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update itinerary day.");
    }
  };

  // Overview route with itinerary and collaborator info
  const OverviewRoute = () => (
    <View style={styles.overviewContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>{itinerary?.name}</Text>
            <TouchableOpacity 
              style={styles.uploadIconContainer}
              onPress={() => Alert.alert("Picture Upload", "Picture Upload feature coming soon")}
            >
              <Icon name="camera" size={20} color="#007bff" />
            </TouchableOpacity>
            <Text style={styles.overviewSubtitle}>{itinerary?.destination}</Text>
            <Text style={styles.overviewDates}>
            {new Date(itinerary.start_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })} - {new Date(itinerary.end_date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            })}
            </Text>
          </View>
          <View style={styles.overviewCollaborators}>
            <Text style={styles.overviewSectionTitle}>Collaborators</Text>
            {collaborators.length > 0 ? (
              <View style={styles.collaboratorsList}>
                {collaborators.map((collab) => (
                  <View key={collab.userId} style={styles.collaboratorCard}>
                    <Icon name="user" size={16} color="#007bff" style={styles.collaboratorIcon} />
                    <Text style={styles.collaboratorName}>{collab.name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noCollaboratorsText}>No collaborators yet.</Text>
            )}
          </View>
        </>
      )}
    </View>
  );
        
  // Days route using DraggableFlatList and the memoized DayCard component
  const DaysRoute = () => (
    <View style={{ flex: 1, padding: 10 }}>
      {days.length === 0 ? (
        <>
          <Text style={styles.noDaysText}>No days planned yet.</Text>
          <TouchableOpacity
            style={styles.addDayButton}
            onPress={() => {
              setEditingDayId(null);
              setDayTitle('');
              setSelectedDate(new Date().toISOString().split('T')[0]);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addDayButtonText}>+ Add Day</Text>
          </TouchableOpacity>
        </>
      ) : (
        <DraggableFlatList
          data={days}
          keyExtractor={(item) => item.id}
          renderItem={({ item, drag }) => (
            <DayCard
              item={item}
              onPress={handleDayPress}
              onLongPress={drag}
              onEdit={handleEditDay}
              renderRightActions={renderRightActions}
              onLayout={(event) => {
                const { height } = event.nativeEvent.layout;
                dayHeightsRef.current[item.id] = height;
              }}
            />
          )}
          onDragEnd={handleDragEnd}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addDayButton}
              onPress={() => {
                setEditingDayId(null);
                setDayTitle('');
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setModalVisible(true);
              }}
            >
              <Text style={styles.addDayButtonText}>+ Add Day</Text>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
  
  const renderScene = SceneMap({
    overview: OverviewRoute,
    days: DaysRoute,
  });

  // Handle deleting the entire itinerary
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
              const config = { headers: { "X-User-Id": user.id } };
              await axios.delete(`${API_BASE_URL}/itineraries/${itineraryId}`, config);
              Alert.alert("Success", "Itinerary deleted successfully!");
              navigation.navigate("Itinerary");
            } catch (error) {
              console.error("Error deleting itinerary:", error.response?.data || error.message);
              Alert.alert("Error", "Failed to delete itinerary.");
            }
          }
        }
      ]
    );
  };

  // Handle removing yourself as a collaborator
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
              await database().ref(`/live_itineraries/${itineraryId}/collaborators/${user.id}`).remove();
              console.log(`User ${user.id} removed from itinerary ${itineraryId}`);
              Alert.alert("Success", "You have been removed from this itinerary.");
              navigation.navigate('Itinerary');
            } catch (error) {
              console.error("Error removing user:", error);
              Alert.alert("Error", "Failed to remove yourself from the itinerary.");
            }
          }
        }
      ]
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaWrapper>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: 360 }}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={{
                height: 4,
                backgroundColor: 'blue',
                borderRadius: 2,
              }}
              style={{ backgroundColor: 'white', elevation: 0 }}
              labelStyle={{
                fontSize: 16,
                fontWeight: 'bold',
                textTransform: 'capitalize',
              }}
              activeColor="black"
              inactiveColor="gray"
            />
          )}
        />

        {/* Modal for Adding/Editing a Day */}
        <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => {
          setModalVisible(false);
          setEditingDayId(null);
        }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingDayId ? 'Edit Day' : 'Add a New Day'}</Text>
              <TextInput
                placeholder="Enter day title"
                style={styles.input}
                value={dayTitle}
                onChangeText={setDayTitle}
              />
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateText}>
                  {selectedDate ? parseLocalDate(selectedDate).toDateString() : "Select Date"}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <View style={styles.calendarContainer}>
                  <Calendar
                    onDayPress={(day) => {
                      setSelectedDate(day.dateString);
                      setShowDatePicker(false);
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
              <Pressable style={styles.modalButton} onPress={editingDayId ? handleUpdateDay : handleAddDay}>
                <Text style={styles.modalButtonText}>{editingDayId ? "Update Day" : "Add Day"}</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: 'gray' }]} onPress={() => {
                setModalVisible(false);
                setEditingDayId(null);
              }}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Fixed Bottom Buttons */}
        <View style={styles.buttonContainer}>
          {user?.id === itinerary?.created_by && (
            <TouchableOpacity 
              style={styles.inviteButton} 
              onPress={() => navigation.navigate('InviteCollaborators', { itinerary })}
            >
              <Text style={styles.buttonText}>Invite</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigation.navigate('ItineraryForm', { itineraryId: itinerary.id, userId: itinerary.created_by })}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          {isCollaborator && user?.id !== itinerary?.created_by ? (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveMyself}>
              <Text style={styles.buttonText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            user?.id === itinerary?.created_by && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.buttonText}><Icon name="trash" size={20} color="white" /></Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </SafeAreaWrapper>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginHorizontal: 10
  },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  detail: { fontSize: 14, marginBottom: 5, color: '#333' },
  listContainer: { flex: 1, paddingHorizontal: 8 },
  daysContainer: { flexGrow: 1, paddingBottom: 80 },
  dayCard: { 
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: '100%',
    alignSelf: 'center',
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
  deleteDayText: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center' },
  activityCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#007bff',
    width: '100%',
    alignSelf: 'center',
  },
  activityTime: { fontSize: 14, fontWeight: 'bold', color: '#007bff' },
  activityName: { fontSize: 16, fontWeight: '600', color: '#222' },
  activityLocation: { fontSize: 14, color: '#555' },
  noActivities: { fontSize: 14, color: '#888', fontStyle: 'italic' },
  noDaysText: { fontSize: 14, textAlign: 'center', color: '#888' },
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
    marginRight: 5,
  },
  deleteButton: {
    flex: 0.2,
    padding: 15,
    backgroundColor: 'red',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  buttonText: { color: '#fff', fontSize: 14 },
  addDayButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addDayButtonText: { color: '#fff', fontSize: 14 },
  editDayButton: {
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  editDayText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  inviteButton: {
    flex: 0.6,
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 5,
  },
  removeButton: {
    flex: 0.8,
    padding: 15,
    backgroundColor: 'gray',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
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
  dateText: { fontSize: 16, color: '#333' },
  calendarContainer: { marginBottom: 10 },
  modalButton: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  editIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'green',
    borderRadius: 12,
    padding: 4,
    zIndex: 1, // make sure it sits above other content
  },
  overviewContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  overviewHeader: {
    position: 'relative',
    marginBottom: 20,
    backgroundColor: 'yellow',
    borderRadius: 12,
    padding: 12
  },
  uploadIconContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  overviewSubtitle: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  overviewDates: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  overviewCollaborators: {
    marginTop: 10,
  },
  overviewSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
  },
  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  collaboratorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef7ff',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  collaboratorIcon: {
    marginRight: 5,
  },
  collaboratorName: {
    fontSize: 14,
    color: '#007bff',
  },
  noCollaboratorsText: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default ItineraryDetailScreen;
