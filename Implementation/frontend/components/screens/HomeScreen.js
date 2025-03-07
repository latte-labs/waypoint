import React, { useState, useEffect } from 'react';
import {
    Text,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import SafeAreaWrapper from './SafeAreaWrapper';
import HomeScreenStyles from '../../styles/HomeScreenStyle';

const { width, height } = Dimensions.get('window');

function HomeScreen() {
    const navigation = useNavigation();
    const [searchQuery, setSearchQuery] = useState('');
    const [trips, setTrips] = useState([
        { id: '1', tripName: 'Hiking Trip in Vancouver', date: 'March 20, 2025' },
        { id: '2', tripName: 'Staycation on Bowen Island', date: 'April 16, 2025' },
        { id: '3', tripName: 'Cafe Hopping', date: 'April 25, 2025' },
    ]);
    const [favorites, setFavorites] = useState([
        { id: '1', placeName: 'Banff National Park', location: 'Alberta, Canada' },
        { id: '2', placeName: 'Santorini', location: 'Greece' },
        { id: '3', placeName: 'Kyoto Temples', location: 'Japan' },
    ]);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [userId, setUserId] = useState(null);

    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                try {
                    const storedUser = await AsyncStorage.getItem('user');
                    if (!storedUser) return;

                    const user = JSON.parse(storedUser);
                    setUserId(String(user.id));

                    const userRef = database().ref(`/users/${user.id}`);
                    userRef.once('value', snapshot => {
                        const firebaseTravelStyleId = snapshot.val()?.travel_style_id ?? user.travel_style_id;
                        setShowQuizPrompt(firebaseTravelStyleId === 4);
                        user.travel_style_id = firebaseTravelStyleId;
                        AsyncStorage.setItem('user', JSON.stringify(user));
                    });

                } catch (error) {
                    console.error('❌ Error retrieving user data:', error);
                }
            };

            fetchUserData();
        }, [])
    );

    const handleQuizStart = () => {
        if (!userId) return;
        navigation.navigate('QuizScreen');
    };

    const handleTripClick = () => {
        Alert.alert("Feature is coming soon!");
    };

    const handleProfileClick = () => {
        navigation.navigate('Profile');
    };

    return (
        <SafeAreaWrapper>
            <View style={{ flex: 1, backgroundColor: 'white', padding: 15, marginBottom: 70 }}>

                {/* ✅ 1. HEADER SECTION (30% HEIGHT) */}
                <View 
                    style={HomeScreenStyles.headerContainer}>
                    {/* Left: Take Quiz or WayPoint */}
                    <View style={{ width: '50%', height: '100%', justifyContent: 'center' }}>
                        {showQuizPrompt ? (
                            <TouchableOpacity style={HomeScreenStyles.takeQuizContainer} onPress={handleQuizStart}>
                                <Text style={HomeScreenStyles.takeQuizText}>Discover your travel style!</Text>
                                <TouchableOpacity style={HomeScreenStyles.takeQuizButton} onPress={handleQuizStart}>
                                    <Text style={HomeScreenStyles.takeQuizButtonText}>Start</Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                                <Text style={HomeScreenStyles.waypointText}>WayPoint</Text>
                            </View>
                        )}
                    </View>

                    {/* Middle: 20% - Weather Placeholder */}
                    <View style={HomeScreenStyles.weatherBox}>
                        <Text style={HomeScreenStyles.weatherText}>☀️ 21°C</Text>
                        <Text style={HomeScreenStyles.weatherLocation}>Vancouver</Text>
                    </View>

                    {/* Right: 20% - Profile Clickable Circle */}
                    <TouchableOpacity style={HomeScreenStyles.profileButton} onPress={handleProfileClick}>
                        <Text style={HomeScreenStyles.profileIcon}>👤</Text>
                    </TouchableOpacity>
                </View>

                {/* ✅ 2. SEARCH BAR */}
                <View style={HomeScreenStyles.searchContainer}>
                    <TextInput
                        style={HomeScreenStyles.searchInput}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* ✅ 3. TITLE SECTION (5% HEIGHT) */}
                <View style={HomeScreenStyles.titleContainer}>
                    <Text style={HomeScreenStyles.titleText}>Trip Plans</Text>
                </View>

                {/* ✅ 4. TRIPS LIST */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                    style={HomeScreenStyles.tripScrollView}
                >
                    {trips.map((trip) => (
                        <TouchableOpacity 
                            key={trip.id} 
                            onPress={handleTripClick}
                            style={HomeScreenStyles.tripCard}
                        >
                            <Text style={HomeScreenStyles.tripTitle}>{trip.tripName}</Text>
                            <Text style={HomeScreenStyles.tripDate}>{trip.date}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>


                {/* ✅ 5. CURRENT FAVORITE DESTINATIONS (20% HEIGHT) */}
                <Text style={HomeScreenStyles.favoriteTitle}>Current Favorite Destinations</Text>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}
                    style={HomeScreenStyles.favoriteScrollView}
                >
                    {favorites.map((fav) => (
                        <TouchableOpacity 
                            key={fav.id} 
                            onPress={handleTripClick}
                            style={HomeScreenStyles.favoriteCard}
                        >
                            <Text style={HomeScreenStyles.favoritePlace}>{fav.placeName}</Text>
                            <Text style={HomeScreenStyles.favoriteLocation}>{fav.location}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </SafeAreaWrapper>
    );
}

export default HomeScreen;
