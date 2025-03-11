import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;

    // ✅ Initialize State
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [markedDates, setMarkedDates] = useState({});
    const [calendarVisible, setCalendarVisible] = useState(false); // ✅ Toggle calendar visibility
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ Handle Date Selection
    const handleDateSelect = (day) => {
        const selectedDate = day.dateString;

        if (!startDate || (startDate && endDate)) {
            // ✅ Reset selection if selecting a new start date
            setStartDate(selectedDate);
            setEndDate(null);
            setMarkedDates({
                [selectedDate]: { startingDay: true, color: '#007bff', textColor: 'white' }
            });
        } else {
            // ✅ Ensure end date is AFTER start date
            if (new Date(selectedDate) < new Date(startDate)) {
                Alert.alert("Invalid Date", "End date cannot be before start date.");
                return;
            }

            setEndDate(selectedDate);
            const range = getMarkedDates(startDate, selectedDate);
            setMarkedDates(range);
            setCalendarVisible(false); // ✅ Close calendar after selection

            // ✅ Show alert when both dates are selected
            Alert.alert("Date Range Selected", `Start: ${startDate}\nEnd: ${selectedDate}`);
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

    // ✅ Handle Form Submission
    const handleSubmit = async () => {
        if (!name || !destination || !startDate || !endDate) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/itineraries/`, {
                name,
                destination,
                start_date: startDate,
                end_date: endDate,
                created_by: userId,
                budget: budget ? parseFloat(budget) : null
            });

            if (response.status === 200) {
                Alert.alert("Success", "Itinerary created successfully!");
                navigation.goBack();
            }
        } catch (error) {
            console.error("❌ Error creating itinerary:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to create itinerary.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Create Itinerary</Text>

                {/* ✅ Trip Name Input */}
                <Pressable
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Trip Name", "Enter trip name", (text) => setName(text))}
                >
                    <Text>{name || "Enter Trip Name"}</Text>
                </Pressable>

                {/* ✅ Destination Input */}
                <Pressable
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Destination", "Enter destination", (text) => setDestination(text))}
                >
                    <Text>{destination || "Enter Destination"}</Text>
                </Pressable>

                {/* ✅ Date Selection Button */}
                <Pressable
                    style={{
                        borderWidth: 1,
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 5,
                        backgroundColor: '#f0f0f0',
                        alignItems: 'center'
                    }}
                    onPress={() => setCalendarVisible(!calendarVisible)} // ✅ Toggle calendar
                >
                    <Text>
                        {startDate ? startDate : "Select Start Date"} - {endDate ? endDate : "Select End Date"}
                    </Text>
                </Pressable>

                {/* ✅ Show Calendar When Toggled */}
                {calendarVisible && (
                    <Calendar
                        markingType={'period'}
                        markedDates={markedDates}
                        onDayPress={handleDateSelect}
                        theme={{
                            selectedDayBackgroundColor: '#007bff',
                            todayTextColor: '#F82E08',
                            arrowColor: '#007bff',
                        }}
                    />
                )}

                {/* ✅ Budget Input */}
                <Pressable
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Budget", "Enter budget amount", (text) => setBudget(text))}
                >
                    <Text>{budget ? `$${budget}` : "Enter Budget (Optional)"}</Text>
                </Pressable>

                {/* ✅ Submit Button */}
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <Pressable
                        onPress={handleSubmit}
                        style={{ padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center', marginBottom: 15 }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Create Itinerary</Text>
                    </Pressable>
                )}

                {/* ✅ Navigation Button to Test Date Picker */}
                <Pressable
                    style={{ padding: 15, backgroundColor: '#28a745', borderRadius: 8, alignItems: 'center' }}
                    onPress={() => navigation.navigate('DatePickerTest')}
                >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Date Picker Test</Text>
                </Pressable>

            </View>
        </SafeAreaWrapper>
    );
};

export default ItineraryFormScreen;
