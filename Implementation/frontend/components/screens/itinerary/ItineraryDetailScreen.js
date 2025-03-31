import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { 
  View, Text, Alert, TouchableOpacity, Modal, TextInput, Pressable, Platform, Image, ImageBackground, ScrollView 
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/FontAwesome';
import { database } from '../../../firebase';
import ImagePicker from 'react-native-image-crop-picker';
import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
import NotesModal from './NotesModal';
import PlacesModal from './PlacesModal';
import OtherCostsModal from './OtherCostsModal';
import AddActivityModal from './AddActivityModal';
import DaySelectionModal from './DaySelectionModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import DayCard from './DayCard';
import OverviewTab from './OverviewTab';
import styles from '../../../styles/ItineraryDetailScreenStyle';

const parseToSortableTime = (timeStr) => {
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toLowerCase() === "pm" && hours !== 12) hours += 12;
  if (modifier.toLowerCase() === "am" && hours === 12) hours = 0;

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
};

const ItineraryDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { itineraryId } = route.params;
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'overview', title: 'Overview' },
    { key: 'days', title: 'Days' }
  ]);

  const [itinerary, setItinerary] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState([]);
  const dayHeightsRef = useRef({});

  // Modal and Calendar state for Add/Edit day
  const [modalVisible, setModalVisible] = useState(false);
  const [dayTitle, setDayTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isCollaborator, setIsCollaborator] = useState(false);
  const [owner, setOwner] = useState({ name: "", email: "" });
  const [editingDayId, setEditingDayId] = useState(null);

  // To view collaborators
  const [collaborators, setCollaborators] = useState([]);

  const [isNotesModalVisible, setIsNotesModalVisible] = useState(false);
  const [notesPreview, setNotesPreview] = useState('');
  const [isPlacesModalVisible, setIsPlacesModalVisible] = useState(false);
  const [placesList, setPlacesList] = useState([]);
  const [totalItineraryCost, setTotalItineraryCost] = useState(0);
  const [isOtherCostsModalVisible, setIsOtherCostsModalVisible] = useState(false);
  const [otherCosts, setOtherCosts] = useState([]);
  const getNextAvailableDate = () => {
    if (!itinerary?.start_date) return new Date().toISOString().split('T')[0];
    const start = new Date(itinerary.start_date);
    return start.toISOString().split('T')[0];
  };
  
  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; 
    
    const strHours = hours < 10 ? `0${hours}` : `${hours}`;
    const strMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    
    return `${strHours}:${strMinutes} ${ampm}`;
  };
  
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

  useEffect(() => {
    if (!isNotesModalVisible) {
      const notesRef = database().ref(`/live_itineraries/${itineraryId}/notes`);
  
      notesRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          setNotesPreview(snapshot.val().length > 300 
            ? snapshot.val().substring(0, 300) + '... Click to view more' 
            : snapshot.val());
        } else {
          setNotesPreview("Tap to add notes");
        }
      });
    }
  }, [isNotesModalVisible, itineraryId]);
  
  useEffect(() => {
    if (!isPlacesModalVisible) {
      const placesRef = database().ref(`/live_itineraries/${itineraryId}/places`);
  
      placesRef.once('value', (snapshot) => {
        if (snapshot.exists()) {
          setPlacesList(snapshot.val());
        } else {
          setPlacesList([]);
        }
      });
    }
  }, [isPlacesModalVisible, itineraryId]);    
    
  const updateRecentTripsInStorage = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/itineraries/users/${user?.id}/itineraries/recent`);
      if (response.status === 200 && response.data.length > 0) {
        await AsyncStorage.setItem('recent_itineraries', JSON.stringify(response.data));
        console.log("✅ Recent itineraries updated in AsyncStorage");
      }
    } catch (err) {
      console.error("❌ Failed to update recent itineraries:", err);
    }
  };
  
  const requestPhotoLibraryPermission = async () => {
    if (Platform.OS === "ios") {
      const result = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      if (result === RESULTS.DENIED) {
        const newResult = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        if (newResult !== RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Please allow access to photos in settings.");
          return false;
        }
      }
    }
    return true;
  };

  // Crop to 1024x768 (4:3 ratio)
  const selectImage = async () => {
    const hasPermission = await requestPhotoLibraryPermission();
    if (!hasPermission) return;
    
    try {
      const image = await ImagePicker.openPicker({
        width: 1024,
        height: 768,
        cropping: true,
        compressImageQuality: 0.8,
      });
      if (image && image.path) {
        setSelectedImage(image.path);
        uploadImage(image.path);
      }
    } catch (error) {
      if (error.code === 'E_PICKER_CANCELLED') {
      } else {
        Alert.alert("Error", error.message || "Image picker error");
      }
    }
  };

  // Upload image using presigned URL (with itineraryId)
  const uploadImage = async (imageUri) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/generate-presigned-url/?itinerary_id=${itineraryId}`);
      const { presigned_url, image_url } = response.data;
      const imageResponse = await fetch(imageUri);
      const blob = await imageResponse.blob();
      await fetch(presigned_url, {
        method: "PUT",
        body: blob,
        headers: { "Content-Type": "image/jpeg" },
      });
      setImageUrl(image_url);
      await updateRecentTripsInStorage();

    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Error", "Image upload failed.");
    }
  };
  const handleOtherCosts = () => {
    Alert.alert("Other Costs", "This section will track additional expenses.");
  };


  const parseLocalDate = (dateString) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const sortActivitiesByTime = (activities) => {
    return [...activities].sort((a, b) => {
      const aSortable = parseToSortableTime(a.time || "");
      const bSortable = parseToSortableTime(b.time || "");
      return aSortable.localeCompare(bSortable);
    });
  };
  
  

  const fetchItineraryDetails = async () => {
    try {
      console.log("Fetching itinerary details...");
      const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
      if (response.status === 200) {
        console.log("✅ API Response:", response.data);

        // ✅ Ensure `estimated_cost` is included and not null
        const sortedDays = response.data.days.map(day => ({
            ...day,
            activities: day.activities
                ? sortActivitiesByTime(
                    day.activities.map(act => ({
                        ...act,
                        estimated_cost: act.estimated_cost ?? 0, 
                    }))
                )
                : []
        }));
        setItinerary(response.data);
        setDays(response.data.days);

        const totalCost = sortedDays.reduce((sum, day) => {
          const dayCost = day.activities.reduce((daySum, activity) => 
              daySum + (activity.estimated_cost ? parseFloat(activity.estimated_cost) : 0)
          , 0);
          return sum + dayCost;
        }, 0);

        setTotalItineraryCost(totalCost);
      
        if (response.data.extra_data && response.data.extra_data.image_url) {
          setImageUrl(response.data.extra_data.image_url);
        }
        const ownerResponse = await axios.get(`${API_BASE_URL}/users/${response.data.created_by}`);
        if (ownerResponse.status === 200) {
          setOwner({
            name: ownerResponse.data.name,
            email: ownerResponse.data.email
          });
        }
      }
      
    } catch (error) {
      Alert.alert("Error", "Failed to load itinerary details.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItineraryDetails();
    }, [itineraryId])
  );

  useEffect(() => {
    if (itinerary) {
      const collaboratorRef = database().ref(`/live_itineraries/${itineraryId}/collaborators`);
      const handleCollaboratorChange = async (snapshot) => {
        if (snapshot.exists()) {
          const collabData = snapshot.val();
          const userIds = Object.keys(collabData);
          const userSnapshot = await database().ref('/users').once('value');
          const usersData = userSnapshot.val();
          const collaboratorsList = userIds.map(userId => ({
            userId,
            name: usersData[userId]?.name || "Unknown",
            email: usersData[userId]?.email || "No Email",
          }));
  
          setCollaborators(collaboratorsList);
  
          // ✅ Check if the current user is in the collaborators list
          setIsCollaborator(userIds.includes(user?.id));
        } else {
          setCollaborators([]);
          setIsCollaborator(false); // ✅ Ensure it resets correctly
        }
      };
  
      collaboratorRef.on('value', handleCollaboratorChange);
      return () => {
        collaboratorRef.off('value', handleCollaboratorChange);
      };
    }
  }, [itineraryId, itinerary, user]);

  useEffect(() => {
    const fetchOtherCosts = async () => {
      const ref = database().ref(`/live_itineraries/${itineraryId}/other_costs`);
      ref.once('value', (snapshot) => {
        if (snapshot.exists()) {
          setOtherCosts(snapshot.val());
        } else {
          setOtherCosts([]);
        }
      });
    };
  
    fetchOtherCosts();
  }, [itineraryId, isOtherCostsModalVisible]);
  useEffect(() => {
    if (index === 1 && isPlacesModalVisible) {
      setIsPlacesModalVisible(false);
    }
  }, [index, isPlacesModalVisible]);
  
  
    
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

  const handleDeleteDay = useCallback((dayId) => {
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
              // ✅ Make sure we get the user right before making the request
              let currentUser = user;
              if (!currentUser) {
                const stored = await AsyncStorage.getItem('user');
                if (stored) {
                  currentUser = JSON.parse(stored);
                  setUser(currentUser); // optional update
                }
              }
  
              if (!currentUser || !currentUser.id) {
                Alert.alert("Error", "User not found. Please log in again.");
                return;
              }
  
              const config = {
                headers: {
                  "X-User-Id": currentUser.id,
                  "Content-Type": "application/json",
                },
              };
              await axios.delete(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`, config);
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
        setModalVisible(false);
        fetchItineraryDetails();
        navigation.navigate('ItineraryDay', { itineraryId, dayId: newDayId, user });
      }
    } catch (error) {
      console.error("Error adding day:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to add itinerary day.");
    }
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
        setModalVisible(false);
        setEditingDayId(null);
        fetchItineraryDetails();
      }
    } catch (error) {
      console.error("Error updating day:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to update itinerary day.");
    }
  };

  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isDayModalVisible, setIsDayModalVisible] = useState(false);
  const [isAddActivityModalVisible, setIsAddActivityModalVisible] = useState(false);

  const [newActivity, setNewActivity] = useState({
    name: '',
    location: '',
    estimated_cost: '',
    time: '',
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const handlePlaceTap = (placeName) => {
    if (days.length === 0) {
      Alert.alert(
        "No Days Planned",
        "Please add at least one day to your itinerary before assigning a place.",
        [
          {
            text: "Go Add Day",
            onPress: () => {
              setIndex(1);
              setEditingDayId(null);
              setDayTitle('');
              setSelectedDate(getNextAvailableDate());

              setTimeout(() => {
                setModalVisible(true);
              }, 400); 

            },
          },
          { text: "Cancel", style: "cancel" }
        ]
      );
      return;
    }
  
    setSelectedPlace(placeName);
    setIsPlacesModalVisible(false);
    setTimeout(() => setIsDayModalVisible(true), 300);
  };
      
  
  const handleSelectDay = (day) => {
    const now = new Date();
    const formattedTime = formatTime(now);
  
    setSelectedDay(day);
    setSelectedTime(now);
    setNewActivity({
      name: 'Visit ' + selectedPlace,  
      location: selectedPlace,
      estimated_cost: '',
      notes: '',
      time: formattedTime,
    });
    setIsDayModalVisible(false);
    setTimeout(() => setIsAddActivityModalVisible(true), 300);
  };
  
  
  const handleDoneTimePicker = () => {
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
  
  
  
  const handleSaveActivity = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": user?.id,
        },
      };
  
      const payload = {
        name: newActivity.name,
        location: newActivity.location || '',
        estimated_cost: newActivity.estimated_cost ? parseFloat(newActivity.estimated_cost) : 0,
        time: newActivity.time,
        notes: newActivity.notes || '',
        itinerary_day_id: selectedDay.id,
      };
  
      const response = await axios.post(
        `${API_BASE_URL}/itineraries/${itineraryId}/days/${selectedDay.id}/activities/`,
        payload,
        config
      );
  
      if (response.status === 200) {
        setIsAddActivityModalVisible(false);
        fetchItineraryDetails();
      }
    } catch (error) {
      console.error("❌ Failed to save activity:", error.response?.data || error.message);
      Alert.alert("Error", "Failed to save activity.");
    }
  };
          
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
              setSelectedDate(getNextAvailableDate());
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
                setSelectedDate(getNextAvailableDate());
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
    overview: () => (
      <OverviewTab 
        itinerary={itinerary}
        user={user}
        imageUrl={imageUrl}
        selectedImage={selectedImage}
        selectImage={selectImage}
        navigation={navigation}
        collaborators={collaborators}
        
        // Panels
        totalItineraryCost={totalItineraryCost}
        otherCosts={otherCosts}
        isOtherCostsModalVisible={isOtherCostsModalVisible}
        setIsOtherCostsModalVisible={setIsOtherCostsModalVisible}
        
        notesPreview={notesPreview}
        isNotesModalVisible={isNotesModalVisible}
        setIsNotesModalVisible={setIsNotesModalVisible}
        
        placesList={placesList}
        isPlacesModalVisible={isPlacesModalVisible}
        setIsPlacesModalVisible={setIsPlacesModalVisible}
      />
    ),    
    days: DaysRoute,
  });
  

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
        <OtherCostsModal
            visible={isOtherCostsModalVisible}
            onClose={() => setIsOtherCostsModalVisible(false)}
            otherCosts={otherCosts} 
            setOtherCosts={setOtherCosts} 
            itineraryId={itineraryId} 
        />
        <NotesModal
          visible={isNotesModalVisible}
          onClose={() => setIsNotesModalVisible(false)}
          itineraryId={itineraryId}
        />
        <PlacesModal
          visible={isPlacesModalVisible}
          onClose={() => setIsPlacesModalVisible(false)}
          itineraryId={itineraryId}
          onPlaceTap={handlePlaceTap} 
        />
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
                backgroundColor: '#1d3a8a',
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

        {modalVisible && (
          <Modal
            transparent
            animationType="slide"
            onRequestClose={() => {
              setModalVisible(false);
              setEditingDayId(null);
            }}
          >
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
                      current={selectedDate}
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
        )}

        <View style={styles.buttonContainer}>
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
        <DaySelectionModal
          visible={isDayModalVisible}
          onClose={() => setIsDayModalVisible(false)}
          days={days}
          onSelectDay={handleSelectDay}
        />

        <AddActivityModal
          visible={isAddActivityModalVisible}
          onClose={() => setIsAddActivityModalVisible(false)}
          newActivity={newActivity}
          setNewActivity={setNewActivity}
          showTimePicker={showTimePicker}
          setShowTimePicker={setShowTimePicker}
          displayTime={newActivity.time || 'Tap to choose time'}
          handleDone={handleDoneTimePicker}
          handleSaveActivity={handleSaveActivity}
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}  
          DateTimePicker={DateTimePicker}
        />

        
      </SafeAreaWrapper>
    </GestureHandlerRootView>
  );
};

export default ItineraryDetailScreen;
