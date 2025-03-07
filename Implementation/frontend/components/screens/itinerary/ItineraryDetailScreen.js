import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, ActivityIndicator, Alert, StyleSheet, TouchableOpacity, ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

const ItineraryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itineraryId } = route.params;

    const [itinerary, setItinerary] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dayHeights, setDayHeights] = useState({}); // Store heights dynamically

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

    // ✅ Fetch Itinerary Details from PostgreSQL
    useEffect(() => {
        const fetchItineraryDetails = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
                if (response.status === 200) {
                    setItinerary(response.data);
                }
            } catch (error) {
                Alert.alert("Error", "Failed to load itinerary details.");
            } finally {
                setLoading(false);
            }
        };

        fetchItineraryDetails();
    }, [itineraryId]);

    // ✅ Placeholder Alert for Delete Day
    const handleDeleteDay = () => {
        Alert.alert("Delete Feature", "This feature is coming soon!");
    };

    // ✅ Render Delete Button when Swiping Left
    const renderRightActions = (dayId) => (
        <TouchableOpacity 
            style={[styles.deleteDayButton, { height: dayHeights[dayId] || '100%' }]} 
            onPress={handleDeleteDay}
        >
            <Text style={styles.deleteDayText}>Delete</Text>
        </TouchableOpacity>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaWrapper>
                <View style={styles.container}>
                    {loading ? (
                        <ActivityIndicator size="large" color="#007bff" />
                    ) : itinerary ? (
                        <>
                            <ScrollView style={styles.scrollContainer}>
                                <Text style={styles.title}>{itinerary.name}</Text>
                                <Text style={styles.detail}>Destination: {itinerary.destination}</Text>
                                <Text style={styles.detail}>
                                    {new Date(itinerary.start_date).toLocaleDateString()} - 
                                    {new Date(itinerary.end_date).toLocaleDateString()}
                                </Text>
                                {user ? (
                                    <Text style={styles.detail}>Created by: {user.name} ({user.email})</Text>
                                ) : (
                                    <Text style={styles.errorText}>⚠ Unable to load user details.</Text>
                                )}

                                {/* ✅ Render Days & Activities with Swipe-to-Delete */}
                                <View style={styles.daysContainer}>
                                    {itinerary.days && itinerary.days.length > 0 ? (
                                        itinerary.days.map((day) => (
                                            <Swipeable 
                                                key={day.id} 
                                                renderRightActions={() => renderRightActions(day.id)}
                                            >
                                                <View 
                                                    style={styles.dayCard}
                                                    onLayout={(event) => {
                                                        const { height } = event.nativeEvent.layout;
                                                        setDayHeights((prev) => ({ ...prev, [day.id]: height }));
                                                    }}
                                                >
                                                    <Text style={styles.dayTitle}>{day.title}</Text>
                                                    <Text style={styles.dayDate}>
                                                        {new Date(day.date).toLocaleDateString()}
                                                    </Text>

                                                    {/* Render activities */}
                                                    {day.activities && day.activities.length > 0 ? (
                                                        day.activities.map((activity) => (
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
                                                </View>
                                            </Swipeable>
                                        ))
                                    ) : (
                                        <Text style={styles.noDaysText}>No days added to this itinerary.</Text>
                                    )}
                                </View>
                            </ScrollView>

                            {/* ✅ Fixed Bottom Buttons */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Edit Feature", "This feature is coming soon!")}>
                                    <Text style={styles.buttonText}>Edit Itinerary</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => Alert.alert("Delete Feature", "This feature is coming soon!")}>
                                    <Text style={styles.buttonText}>Delete Itinerary</Text>
                                </TouchableOpacity>
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
    scrollContainer: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    detail: { fontSize: 16, marginBottom: 5, color: '#333' },

    daysContainer: { marginTop: 20 },
    dayCard: { 
        backgroundColor: '#f8f9fa', 
        padding: 15, 
        borderRadius: 8, 
        marginBottom: 15,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
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
    },
    activityTime: { fontSize: 14, fontWeight: 'bold', color: '#007bff' },
    activityName: { fontSize: 16, fontWeight: '600', color: '#222' },
    activityLocation: { fontSize: 14, color: '#555' },
    noActivities: { fontSize: 14, color: '#888', fontStyle: 'italic' },
    noDaysText: { fontSize: 14, textAlign: 'center', color: '#888' },

    buttonContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff' },
    editButton: { flex: 1, padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center', marginRight: 5 },
    deleteButton: { flex: 1, padding: 15, backgroundColor: 'red', borderRadius: 8, alignItems: 'center', marginLeft: 5 },
    buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
});

export default ItineraryDetailScreen;
