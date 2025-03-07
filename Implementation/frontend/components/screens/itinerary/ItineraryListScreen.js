import React, { useState, useEffect } from 'react';
import { 
    View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import API_BASE_URL from '../../../config';
import SafeAreaWrapper from '../SafeAreaWrapper';


const ItineraryListScreen = () => {
    const navigation = useNavigation();
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // ✅ Load User ID & Fetch Itineraries from PostgreSQL
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                console.log("🔄 Loading user data from AsyncStorage...");
                const storedUser = await AsyncStorage.getItem('user');
                if (!storedUser) {
                    console.error("❌ No user found in AsyncStorage!");
                    setLoading(false);
                    return;
                }

                const userData = JSON.parse(storedUser);
                setUserId(String(userData.id));

                console.log("📥 Fetching itineraries from PostgreSQL...");
                fetchItineraries(userData.id);
            } catch (error) {
                console.error("❌ Error loading user data:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // ✅ Fetch Itineraries from PostgreSQL API
    const fetchItineraries = async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/itineraries/users/${userId}/itineraries`);
            if (response.status === 200) {
                setItineraries(response.data);
            }
        } catch (error) {
            console.error("❌ Error fetching itineraries from PostgreSQL:", error.response?.data || error.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle Itinerary Selection (Navigates to Detail Screen)
    const handleSelectItinerary = (itinerary) => {
        console.log(`🔄 Navigating to itinerary: ${itinerary.id}`);
        Alert.alert("Itinerary Selected", `UUID: ${itinerary.id}`);
        // navigation.navigate('ItineraryDetailScreen', { itineraryId: itinerary.id });
    };

    // ✅ Handle Adding New Itinerary (For Now, Just Alert)
    const handleAddItinerary = () => {
        Alert.alert("Create Itinerary", "Feature coming soon!");
    };

    // ✅ Render Itinerary List Item
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itineraryCard} onPress={() => handleSelectItinerary(item)}>
            <Text style={styles.itineraryName}>Trip Name: {item.name}</Text>
            <Text style={styles.itineraryDestination}>Destination: {item.destination}</Text>
            <Text style={styles.itineraryDate}>
            {new Date(item.start_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} 
            - 
            {new Date(item.end_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
        </Text>

        </TouchableOpacity>
    );

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
            <Text style={styles.title}>My Itineraries</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#007bff" />
            ) : itineraries.length > 0 ? (
                <FlatList 
                    data={itineraries}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <Text style={styles.noItineraries}>You have no itineraries yet.</Text>
            )}

            {/* ✅ Add Itinerary Button (Currently Alerts) */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddItinerary}>
                <Text style={styles.addButtonText}>+ Create New Itinerary</Text>
            </TouchableOpacity>
        </View>
        </SafeAreaWrapper>
        
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    itineraryCard: {
        padding: 15,
        marginVertical: 10,
        backgroundColor: '#ffffff',  // White background for a clean look
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,  // Adds a subtle shadow for depth
    },
    itineraryName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },  
    itineraryDestination: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    itineraryDate: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007bff',
    },
    noItineraries: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
    addButton: { marginTop: 20, padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 14 }
});

export default ItineraryListScreen;
