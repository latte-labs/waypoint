import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet 
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import API_BASE_URL from '../../config';

const ItineraryDetailScreen = () => {
    const route = useRoute();
    const { itineraryId } = route.params; // ✅ Get itinerary ID from navigation params
    const [itinerary, setItinerary] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch Itinerary Details from API
    useEffect(() => {
        const fetchItineraryDetails = async () => {
            try {
                console.log(`🔄 Fetching itinerary details for ID: ${itineraryId}`);
                const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);

                if (response.status === 200) {
                    setItinerary(response.data);
                }
            } catch (error) {
                console.error("❌ Error fetching itinerary details:", error.response?.data || error.message);
                Alert.alert("Error", "Failed to fetch itinerary details.");
            } finally {
                setLoading(false);
            }
        };

        fetchItineraryDetails();
    }, [itineraryId]);

    // ✅ Handle Adding a New Day (For now, shows an alert)
    const handleAddDay = () => {
        Alert.alert("Coming Soon!", "Feature to add a new itinerary day is under development.");
    };

    // ✅ Handle Adding a New Activity (For now, shows an alert)
    const handleAddActivity = (dayId) => {
        Alert.alert("Coming Soon!", `Feature to add an activity to Day ID: ${dayId}`);
    };

    // ✅ Render Individual Itinerary Day
    const renderDayItem = ({ item }) => (
        <View style={styles.dayCard}>
            <Text style={styles.dayTitle}>{item.title} ({item.date})</Text>

            {/* Activities List */}
            {item.activities.length > 0 ? (
                item.activities.map(activity => (
                    <View key={activity.id} style={styles.activityItem}>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                        <Text style={styles.activityName}>{activity.name} - {activity.location}</Text>
                    </View>
                ))
            ) : (
                <Text style={styles.noActivities}>No activities added.</Text>
            )}

            {/* Add Activity Button */}
            <TouchableOpacity 
                style={styles.addActivityButton} 
                onPress={() => handleAddActivity(item.id)}
            >
                <Text style={styles.addActivityButtonText}>+ Add Activity</Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#007bff" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            {itinerary ? (
                <>
                    {/* Itinerary Details */}
                    <Text style={styles.itineraryName}>{itinerary.name}</Text>
                    <Text style={styles.itineraryDetails}>
                        {itinerary.destination} | {itinerary.start_date} - {itinerary.end_date}
                    </Text>
                    <Text style={styles.itineraryBudget}>Budget: ${itinerary.budget}</Text>

                    {/* Itinerary Days List */}
                    <FlatList 
                        data={itinerary.days}
                        renderItem={renderDayItem}
                        keyExtractor={(item) => item.id}
                        ListEmptyComponent={<Text style={styles.noDays}>No days added yet.</Text>}
                    />

                    {/* Add Day Button */}
                    <TouchableOpacity style={styles.addButton} onPress={handleAddDay}>
                        <Text style={styles.addButtonText}>+ Add Itinerary Day</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.errorText}>Itinerary not found.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    itineraryName: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    itineraryDetails: { fontSize: 16, textAlign: 'center', marginBottom: 5, color: '#555' },
    itineraryBudget: { fontSize: 16, textAlign: 'center', fontWeight: 'bold', marginBottom: 10 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    dayCard: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, marginVertical: 10 },
    dayTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
    activityItem: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    activityTime: { fontWeight: 'bold', color: '#007bff' },
    activityName: { fontSize: 16, color: '#333' },
    noActivities: { fontStyle: 'italic', color: '#888', marginTop: 5 },
    addActivityButton: { marginTop: 10, padding: 10, backgroundColor: '#007bff', borderRadius: 5, alignItems: 'center' },
    addActivityButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    addButton: { marginTop: 20, padding: 15, backgroundColor: '#28a745', borderRadius: 8, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    noDays: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
    errorText: { textAlign: 'center', fontSize: 16, color: 'red', marginTop: 20 },
});

export default ItineraryDetailScreen;
