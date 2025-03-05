import React, { useState, useEffect } from 'react';
import {
    Text,
    ScrollView,
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import styles from '../../styles/HomeScreenStyle';

const { width } = Dimensions.get('window');

function HomeScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [trips, setTrips] = useState([
        { id: '1', tripName: 'Hiking Trip in Vancouver', date: 'March 20, 2025' },
        { id: '2', tripName: 'Staycation on Bowen Island', date: 'April 16, 2025' },
        { id: '3', tripName: 'Cafe Hopping', date: 'April 25, 2025' },
    ]);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [userId, setUserId] = useState(null);

    // ✅ Load `travel_style_id` from AsyncStorage & Sync with Firebase on Screen Focus
    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                try {
                    const userData = await AsyncStorage.getItem('user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        setUserId(user.id);

                        console.log("📥 Retrieved Travel Style ID from AsyncStorage:", user.travel_style_id);

                        // ✅ Fetch latest `travel_style_id` from Firebase
                        const userRef = database().ref(`/users/${user.id}`);
                        userRef.once('value', snapshot => {
                            const firebaseTravelStyleId = snapshot.val()?.travel_style_id ?? user.travel_style_id;
                            console.log("🔥 Firebase Travel Style ID:", firebaseTravelStyleId);

                            if (firebaseTravelStyleId === 4) {
                                console.log("✅ Showing Take Quiz Card");
                                setShowQuizPrompt(true);
                            } else {
                                console.log("🚫 Hiding Take Quiz Card");
                                setShowQuizPrompt(false);
                            }
                        });

                        // ✅ Log screen view in Firebase
                        logScreenView(user.id);
                    }
                } catch (error) {
                    console.error('Error retrieving user data:', error);
                }
            };

            fetchUserData();
        }, [])
    );

    // ✅ Log screen view in Firebase
    const logScreenView = async (userId) => {
        try {
            const screenViewRef = database().ref(`/screen_views/home/${userId}`);
            await screenViewRef.push({ timestamp: new Date().toISOString() });
        } catch (error) {
            console.error('Firebase Error:', error);
        }
    };

    // ✅ Log quiz attempt in Firebase and navigate to `QuizScreen`
    const handleQuizStart = async () => {
        if (!userId) return;

        try {
            const quizAttemptRef = database().ref(`/quiz_attempts/${userId}`);
            await quizAttemptRef.push({ timestamp: new Date().toISOString() });

            // ✅ Navigate to QuizScreen
            navigation.navigate('QuizScreen');
        } catch (error) {
            console.error('Firebase Error:', error);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { width: width * 0.8, marginHorizontal: 10 }]}>
            <Text style={styles.tripName}>{item.tripName}</Text>
            {item.date ? <Text style={styles.date}>{item.date}</Text> : null}
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                
                {/* ✅ "Take Quiz" Card (Only Shows If travel_style_id === 4) */}
                {showQuizPrompt && (
                    <View style={styles.quizCard}>
                        <Text style={styles.quizText}>Discover your travel style!</Text>
                        <TouchableOpacity
                            style={styles.quizButton}
                            onPress={handleQuizStart} // ✅ Logs in Firebase before navigation
                        >
                            <Text style={styles.quizButtonText}>Take Quiz</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TextInput
                    style={styles.searchbar}
                    placeholder='Search...'
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />

                <View style={styles.myTrips}>
                    <Text style={styles.myTripsTitle}>My Trips</Text>
                    {trips.length > 0 ? (
                        <FlatList
                            data={trips}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
                        />
                    ) : (
                        <View style={[styles.card, { width: width * 0.8, marginHorizontal: 10 }]}>
                            <Text style={styles.tripName}>No upcoming trips</Text>
                        </View>
                    )}
                </View>

                {/* Buttons */}
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => navigation.navigate('InteractiveMap')}
                >
                    <Text style={styles.mapButtonText}>Open Interactive Map</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => navigation.navigate('InteractiveRecommendations')}
                >
                    <Text style={styles.mapButtonText}>Open Interactive Recommendations</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.mapButton}
                    onPress={() => navigation.navigate('ChatBot')}
                >
                    <Text style={styles.mapButtonText}>Open Chatbot</Text>
                </TouchableOpacity>

            </View>
        </ScrollView>
    );
}

export default HomeScreen;
