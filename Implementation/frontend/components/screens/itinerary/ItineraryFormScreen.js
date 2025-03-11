import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import DatePicker from 'react-native-ui-datepicker';
import { enUS } from 'date-fns/locale';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params;
    const today = new Date();

    // ✅ Set default start and end dates
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ Handle form submission
    const handleSubmit = async () => {
        if (!name || !destination) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }

        if (endDate < startDate) {
            Alert.alert("Invalid Dates", "End date cannot be earlier than the start date.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/itineraries/`, {
                name,
                destination,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
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
                <TouchableOpacity
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Trip Name", "Enter trip name", (text) => setName(text))}
                >
                    <Text>{name || "Enter Trip Name"}</Text>
                </TouchableOpacity>

                {/* ✅ Destination Input */}
                <TouchableOpacity
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Destination", "Enter destination", (text) => setDestination(text))}
                >
                    <Text>{destination || "Enter Destination"}</Text>
                </TouchableOpacity>

                {/* ✅ Date Picker for Start & End Dates */}
                <TouchableOpacity
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => setOpenDatePicker(true)}
                >
                    <Text>
                        {startDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} -  {endDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </Text>
                </TouchableOpacity>

                {/* ✅ `react-native-ui-datepicker` Picker (Now Correctly Highlights Range) */}
                {openDatePicker && (
                    <DatePicker
                        locale={enUS}
                        mode="range"
                        startDate={startDate}  // ✅ Ensure both start and end dates are tracked
                        endDate={endDate}
                        onChange={({ startDate: start, endDate: end }) => {
                            console.log("📅 Selected Range:", { start, end });

                            if (start && end) {
                                setStartDate(start);
                                setEndDate(end);
                                setOpenDatePicker(false); // ✅ Close picker only after selecting both dates
                            }
                        }}
                        style={{ backgroundColor: '#fff', padding: 10, borderRadius: 8 }}
                    />
                )}

                {/* ✅ Budget Input */}
                <TouchableOpacity
                    style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                    onPress={() => Alert.prompt("Budget", "Enter budget amount", (text) => setBudget(text))}
                >
                    <Text>{budget ? `$${budget}` : "Enter Budget (Optional)"}</Text>
                </TouchableOpacity>

                {/* ✅ Submit Button */}
                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : (
                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={{ padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Create Itinerary</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaWrapper>
    );
};

export default ItineraryFormScreen;
