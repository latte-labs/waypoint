import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId, itineraryId } = route.params || {};

    // ✅ Initialize State
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    const [calendarVisible, setCalendarVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // ✅ Fetch Itinerary Details if Editing
    useEffect(() => {
        if (itineraryId) {
            fetchItineraryDetails();
        }
    }, [itineraryId]);

    const fetchItineraryDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
            if (response.status === 200) {
                const itinerary = response.data;
                setName(itinerary.name);
                setDestination(itinerary.destination);
                setBudget(itinerary.budget ? itinerary.budget.toString() : '');
                setStartDate(itinerary.start_date.split('T')[0]);
                setEndDate(itinerary.end_date.split('T')[0]);

                // ✅ Set date range highlighting
                const range = getMarkedDates(itinerary.start_date.split('T')[0], itinerary.end_date.split('T')[0]);
                setMarkedDates(range);
            }
        } catch (error) {
            console.error("❌ Error fetching itinerary:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to load itinerary details.");
        }
    };

    // ✅ Handle Date Selection
    const handleDateSelect = (day) => {
        const selectedDate = day.dateString;

        if (!startDate || (startDate && endDate)) {
            setStartDate(selectedDate);
            setEndDate(null);
            setMarkedDates({ [selectedDate]: { selected: true, selectedColor: '#007bff' } });
        } else {
            if (new Date(selectedDate) < new Date(startDate)) {
                Alert.alert("Invalid Date", "End date cannot be before start date.");
                return;
            }
            setEndDate(selectedDate);
            const range = getMarkedDates(startDate, selectedDate);
            setMarkedDates(range);
            setCalendarVisible(false);
        }
    };

    // ✅ Generate Date Range Markers
    const getMarkedDates = (start, end) => {
        let range = {};
        let currentDate = new Date(start);
        let endDate = new Date(end);

        while (currentDate <= endDate) {
            let dateString = currentDate.toISOString().split('T')[0];
            range[dateString] = {
                color: '#007bff',
                textColor: 'white',
                ...(dateString === start ? { startingDay: true } : {}),
                ...(dateString === end ? { endingDay: true } : {}),
            };
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return range;
    };

    // ✅ Handle Form Submission (Create or Edit)
    const handleSubmit = async () => {
        if (!name || !destination || !startDate || !endDate) {
          Alert.alert("Missing Fields", "Please fill in all required fields.");
          return;
        }
      
        setLoading(true);
        try {
          const requestData = {
            id: itineraryId, // Ensure `id` is included
            name,
            destination,
            start_date: new Date(startDate).toISOString(), // Ensure correct format
            end_date: new Date(endDate).toISOString(), // Ensure correct format
            created_by: userId, // Ensure `created_by` is included
            budget: budget ? parseFloat(budget) : 0, // Ensure budget is always present
            last_updated_by: userId, // NEW: Include the userId here
          };
      
          let response;
          const config = {
            headers: {
              "Content-Type": "application/json",
              "X-User-Id": userId, // Also sent in the header if needed by your update endpoint
            },
          };
      
          if (itineraryId) {
            // Edit Existing Itinerary (PUT request)
            response = await axios.put(`${API_BASE_URL}/itineraries/${itineraryId}`, requestData, config);
          } else {
            // Create New Itinerary (POST request)
            response = await axios.post(`${API_BASE_URL}/itineraries/`, requestData, config);
          }
      
          if (response.status === 200) {
            const newItineraryId = response.data.itinerary_id || response.data.id;
            Alert.alert(
              "Success",
              itineraryId ? "Itinerary updated successfully!" : "Itinerary created successfully!"
            );
      
            // Navigate to ItineraryDetailScreen
            navigation.replace("ItineraryDetail", { itineraryId: newItineraryId });
          }
        } catch (error) {
          console.error("❌ Error saving itinerary:", error.response?.data || error.message);
          Alert.alert("Error", "Failed to save itinerary.");
        } finally {
          setLoading(false);
        }
    };                    

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>
                    {itineraryId ? "Edit Itinerary" : "Create Itinerary"}
                </Text>

                <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    placeholder="Enter Trip Name"
                    value={name}
                    onChangeText={setName}
                />

                <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    placeholder="Enter Destination"
                    value={destination}
                    onChangeText={setDestination}
                />

                {/* ✅ Date Selection Button */}
                <Pressable
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#f0f0f0', alignItems: 'center' }}
                    onPress={() => setCalendarVisible(!calendarVisible)}
                >
                    <Text>{startDate ? startDate : "Select Start Date"} - {endDate ? endDate : "Select End Date"}</Text>
                </Pressable>

                {calendarVisible && (
                    <Calendar
                        markingType={'period'}
                        markedDates={markedDates}
                        onDayPress={handleDateSelect}
                        theme={{ selectedDayBackgroundColor: '#007bff', todayTextColor: '#F82E08', arrowColor: '#007bff' }}
                    />
                )}

                <TextInput style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    placeholder="Enter Budget (Optional)"
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <Pressable onPress={handleSubmit}
                        style={{ padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{itineraryId ? "Save Changes" : "Create Itinerary"}</Text>
                    </Pressable>
                )}
            </View>
        </SafeAreaWrapper>
    );
};

export default ItineraryFormScreen;
