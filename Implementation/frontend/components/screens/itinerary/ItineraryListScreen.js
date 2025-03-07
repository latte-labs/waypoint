import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../../firebase';
import SafeAreaWrapper from '../SafeAreaWrapper';

const ItineraryListScreen = () => {
    const [itineraries, setItineraries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    // ✅ Load User ID & Fetch Itineraries from AsyncStorage & Firebase
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

                console.log("📥 Fetching itineraries...");
                fetchItineraries(userData.id);
            } catch (error) {
                console.error("❌ Error loading user data:", error);
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // ✅ Fetch Itineraries from Firebase (For Now)
    const fetchItineraries = async (userId) => {
        try {
            const itinerariesRef = database().ref(`/users/${userId}/itineraries`);
            itinerariesRef.on('value', (snapshot) => {
                const data = snapshot.val() || {};
                const itineraryList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key],
                }));

                setItineraries(itineraryList);
                setLoading(false);
            });
        } catch (error) {
            console.error("❌ Error fetching itineraries:", error);
            setLoading(false);
        }
    };

    // ✅ Handle Itinerary Selection (For Now, Just Alert)
    const handleSelectItinerary = (itinerary) => {
        Alert.alert("Itinerary Selected", `You clicked: ${itinerary.name}`);
    };

    // ✅ Handle Adding New Itinerary (For Now, Just Alert)
    const handleAddItinerary = () => {
        Alert.alert("Create Itinerary", "Feature coming soon!");
    };

    // ✅ Render Itinerary List Item
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.itineraryCard} onPress={() => handleSelectItinerary(item)}>
            <Text style={styles.itineraryName}>{item.name}</Text>
            <Text style={styles.itineraryDate}>{item.start_date} - {item.end_date}</Text>
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
    itineraryCard: { padding: 15, marginVertical: 10, backgroundColor: '#f1f1f1', borderRadius: 8 },
    itineraryName: { fontSize: 18, fontWeight: '600' },
    itineraryDate: { fontSize: 14, color: '#666' },
    noItineraries: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 20 },
    addButton: { marginTop: 20, padding: 15, backgroundColor: '#007bff', borderRadius: 8, alignItems: 'center' },
    addButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' }
});

export default ItineraryListScreen;