import React, { useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryFormScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params; // ✅ Get userId from navigation params

    // ✅ Form state
    const [name, setName] = useState('');
    const [destination, setDestination] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState('');
    const [loading, setLoading] = useState(false);

    // ✅ Handle form submission
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
                navigation.goBack(); // ✅ Navigate back to ItineraryListScreen
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

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="Trip Name"
                value={name}
                onChangeText={setName}
            />

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="Destination"
                value={destination}
                onChangeText={setDestination}
            />

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="Start Date (YYYY-MM-DD)"
                value={startDate}
                onChangeText={setStartDate}
            />

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="End Date (YYYY-MM-DD)"
                value={endDate}
                onChangeText={setEndDate}
            />

            <TextInput
                style={{ borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 }}
                placeholder="Budget (Optional)"
                value={budget}
                keyboardType="numeric"
                onChangeText={setBudget}
            />

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
