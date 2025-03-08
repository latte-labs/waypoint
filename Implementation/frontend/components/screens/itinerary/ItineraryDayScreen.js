import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryDayScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { itineraryId, dayId } = route.params;

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch Activities from PostgreSQL
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}/days/${dayId}`);
                if (response.status === 200) {
                    setActivities(response.data.activities);
                }
            } catch (error) {
                console.error("❌ Error fetching activities:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, [itineraryId, dayId]);

    // ✅ Handle Add Activity (Placeholder)
    const handleAddActivity = () => {
        Alert.alert("Add Activity", "Feature coming soon!");
    };

    // ✅ Handle Edit Activity (Placeholder)
    const handleEditActivity = (activityId) => {
        Alert.alert("Edit Activity", `Editing Activity ID: ${activityId}`);
    };

    // ✅ Handle Delete Activity (Placeholder)
    const handleDeleteActivity = (activityId) => {
        Alert.alert("Delete Activity", `Deleting Activity ID: ${activityId}`);
    };

    // ✅ Render Activity Item
    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.activityCard} 
            onPress={() => handleEditActivity(item.id)}
        >
            <Text style={styles.activityName}>{item.name}</Text>
            <Text style={styles.activityTime}>🕒 {item.time}</Text>
            <Text style={styles.activityLocation}>📍 {item.location}</Text>

            {/* Delete Button */}
            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => handleDeleteActivity(item.id)}
            >
                <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Day Activities</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#007bff" />
                ) : activities.length > 0 ? (
                    <FlatList 
                        data={activities}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                    />
                ) : (
                    <Text style={styles.noActivities}>No activities planned.</Text>
                )}

                {/* ✅ Add Activity Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
                    <Text style={styles.addButtonText}>+ Add Activity</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    
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
    activityName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    activityTime: { fontSize: 14, color: '#007bff', marginTop: 5 },
    activityLocation: { fontSize: 14, color: '#555', marginTop: 5 },
    
    deleteButton: {
        marginTop: 10,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 5,
        alignItems: 'center',
    },
    deleteButtonText: { color: '#fff', fontWeight: 'bold' },

    noActivities: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },

    addButton: { 
        position: 'absolute', 
        bottom: 20, 
        left: 20, 
        right: 20, 
        padding: 15, 
        backgroundColor: '#007bff', 
        borderRadius: 8, 
        alignItems: 'center',
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ItineraryDayScreen;
