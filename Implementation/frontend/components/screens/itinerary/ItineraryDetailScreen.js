import React, { useState, useEffect } from 'react';
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
import DraggableFlatList from 'react-native-draggable-flatlist';

const ItineraryDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itineraryId } = route.params;

    const [itinerary, setItinerary] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState([]); // Store ordered days
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
                    setDays(response.data.days); // ✅ Store sorted days
                }
            } catch (error) {
                Alert.alert("Error", "Failed to load itinerary details.");
            } finally {
                setLoading(false);
            }
        };

        fetchItineraryDetails();
    }, [itineraryId]);

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
            onPress={() => Alert.alert("Delete Feature", "This feature is coming soon!")}
        >
            <Text style={styles.deleteDayText}>Delete</Text>
        </TouchableOpacity>
    );
    

    // ✅ Render Each Day with Swipe-to-Delete & Drag Support
    const renderItem = ({ item, drag }) => (
        <Swipeable
            key={item.id}
            renderRightActions={() => renderRightActions(item.id)}
        >
            <TouchableOpacity 
                // onPress={() => Alert.alert("Day Selected", `Day ID: ${item.id}`)} // ✅ Show Day ID
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
                                    <Text style={styles.detail}>Created by: {user.name} ({user.email})</Text>
                                ) : (
                                    <Text style={styles.errorText}>⚠ Unable to load user details.</Text>
                                )}
                            </View>
    
                            {/* ✅ FLEXIBLE SCROLLABLE LIST */}
                            <View style={styles.listContainer}>
                                {days.length === 0 ? (
                                    <>
                                        <Text style={styles.noDaysText}>Nothing is planned yet.</Text>
                                        <TouchableOpacity 
                                            style={styles.addDayButton} 
                                            onPress={() => Alert.alert("Add Day", "Feature coming soon!")}
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
                                                onPress={() => Alert.alert("Add Day", "Feature coming soon!")}
                                            >
                                                <Text style={styles.addDayButtonText}>+ Add Day</Text>
                                            </TouchableOpacity>
                                        }
                                    />
                                )}
                            </View>



    
                            {/* ✅ FIXED BOTTOM BUTTONS */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.editButton} onPress={() => Alert.alert("Edit Feature", "This feature is coming soon!")}>
                                    <Text style={styles.buttonText}>Edit Itinerary</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.deleteButton} onPress={() => Alert.alert("Delete Feature", "This feature is coming soon!")}>
                                    <Text style={styles.buttonText}>Delete</Text>
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
    
    
});

export default ItineraryDetailScreen;
