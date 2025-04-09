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
import AddActivityModal from './AddActivityModal';
import LottieView from 'lottie-react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { BlurView } from '@react-native-community/blur';

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

  const parseToSortableTime = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
    if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  };

  const sortActivitiesByTime = (activities) => {
    return [...activities].sort((a, b) => {
      const aSortable = parseToSortableTime(a.time || "");
      const bSortable = parseToSortableTime(b.time || "");
      return aSortable.localeCompare(bSortable);
    });
  };
  const [infoModalVisible, setInfoModalVisible] = useState(false);



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
        if (!dayId) {
          console.warn("❌ Missing dayId:", dayId);
          return;
        }

        const config = user ? { headers: { "X-User-Id": user.id } } : {};
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


  useEffect(() => {
    if (modalVisible && !isEditing) {
      const now = new Date();
      const formattedTime = formatTime(now);
      setSelectedTime(now);
      setNewActivity((prev) => ({ ...prev, time: formattedTime }));
    }
  }, [modalVisible, isEditing]);


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
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    return `${strHours}:${strMinutes} ${ampm}`;
  };


  // ✅ Function to Close Time Picker Only When "Done" is Pressed
  const handleDone = () => {
    const hours = selectedTime.getHours(); // 0-23
    const minutes = selectedTime.getMinutes(); // 0-59

    const sortableTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`; // 24-hour
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const formattedTime = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`; // 12-hour

    setNewActivity((prev) => ({
      ...prev,
      time: formattedTime,          // for UI
    }));

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
    setEditingActivity(activity);

    setNewActivity({
      time: activity.time,
      name: activity.name,
      location: activity.location,
      notes: activity.notes || '',
      estimated_cost: activity.estimated_cost ? activity.estimated_cost.toString() : '',
    });

    if (activity.time) {
      const [time, modifier] = activity.time.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
      if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

      const restoredDate = new Date();
      restoredDate.setHours(hours);
      restoredDate.setMinutes(minutes);
      setSelectedTime(restoredDate);
    }

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
        onPress={() => handleEditActivity(item)}
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
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginRight: 6 }}>Day Activities</Text>
        <TouchableOpacity onPress={() => setInfoModalVisible(true)}>
          <Icon name="information-circle-outline" size={22} color="#007bff" />
        </TouchableOpacity>
      </View>


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
            backgroundColor: '#D6E4FF',
            borderRadius: 30,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
          }}
          onPress={handleOpenModal}
        >
          <Text style={{ color: '#1E3A8A', fontSize: 16, fontWeight: 'bold' }}>+ Add Activity</Text>
        </TouchableOpacity>

        {/* ✅ Modal for Adding Activity */}
        <AddActivityModal
          visible={modalVisible}
          onClose={handleCloseModal}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
          displayTime={displayTime}
          handleSaveActivity={handleSaveActivity}
          handleDone={handleDone}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
          DateTimePicker={DateTimePicker}
        />

        <Modal
          visible={infoModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <BlurView style={styles.blurBackground} blurType="dark" blurAmount={10} reducedTransparencyFallbackColor="black" />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>How to Edit Activities</Text>
              <View style={styles.lottieWrapper}>
                <LottieView
                  source={require('../../../assets/animations/swipe_instructions_left.json')}
                  autoPlay
                  loop
                  resizeMode="contain"
                  style={styles.lottie}
                />
              </View>

              <Text style={styles.modalText}>Swipe left to edit</Text>

              <View style={styles.lottieWrapper}>
                <LottieView
                  source={require('../../../assets/animations/swipe_instructions_right.json')}
                  autoPlay
                  loop
                  resizeMode="contain"
                  style={styles.lottie}
                />
              </View>
              <Text style={styles.modalText}>Swipe right to delete</Text>

              <Text style={styles.subText}>You can also tap any card to edit it.</Text>

              <TouchableOpacity style={styles.doneButton} onPress={() => setInfoModalVisible(false)}>
                <Text style={styles.doneText}>Got it</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  
  modalContent: {
    backgroundColor: 'transparent',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20, // smoother corners
    alignItems: 'center',
    width: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
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
  blurBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  
  modalText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#fff',
  },
  
  subText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#ddd',
    marginBottom: 10,
    paddingTop: 36
  },
  
  lottieWrapper: {
    height: 120,        
    overflow: 'hidden', 
    marginBottom: 4,
  },
  lottie: {
    width: 180,
    height: 180,        
    alignSelf: 'center',
  },
  
  

});


export default ItineraryDayScreen;
