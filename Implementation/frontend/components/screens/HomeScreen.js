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
                    style={{
                        height: height * 0.1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',  // ✅ Spaces out elements
                        paddingHorizontal: 15,  // ✅ Adds balanced padding on the sides
                    }}
                >
                    {/* Left Side: 60% - Take Quiz OR WayPoint */}
                    <View style={{ width: '50%', height: '100%', justifyContent: 'center' }}>
                        {showQuizPrompt ? (
                            <TouchableOpacity 
                                style={{
                                    backgroundColor: '#FFDD57',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 12,
                                    height: '80%',
                                    width: '100%', // ✅ Ensures proper spacing inside parent container
                                }} 
                                onPress={handleQuizStart}
                            >
                                <Text style={{ fontSize: 12, marginBottom: 4 }}>
                                    Discover your travel style!
                                </Text>

                                <TouchableOpacity 
                                    style={{
                                        backgroundColor: '#FFAA00',
                                        paddingVertical: 8,
                                        paddingHorizontal: 15,
                                        borderRadius: 12,
                                        marginTop: 5, // ✅ Adds spacing between text and button
                                    }} 
                                    onPress={handleQuizStart}
                                >
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
                                        Start
                                    </Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ) : (
                            <View style={{ justifyContent: 'center', alignItems: 'center', height: '80%' }}>
                                <Text style={{ fontSize: 22, fontWeight: 'bold' }}>WayPoint</Text>
                            </View>
                        )}
                    </View>


                    {/* Middle: 20% - Weather Placeholder */}
                    <View style={{
                        width: '25%',
                        height: '80%',
                        backgroundColor: '#D3D3D3',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 12,
                        padding: 5,  // ✅ Ensures content is centered with space
                    }}>
                        <Text style={{ fontSize: 16}}>☀️ 21°C</Text>
                        <Text style={{ fontSize: 9}}>Vancouver</Text>
                    </View>

                    {/* Right: 20% - Profile Clickable Circle */}
                    <TouchableOpacity 
                        style={{
                            width: height * 0.08, 
                            height: height * 0.08, 
                            borderRadius: 50, 
                            backgroundColor: '#FF6F00',
                            justifyContent: 'center', 
                            alignItems: 'center',
                            marginLeft: 10,  // ✅ Creates some space from the weather box
                        }} 
                        onPress={handleProfileClick}
                    >
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>👤</Text>
                    </TouchableOpacity>
                </View>


                {/* ✅ 2. SEARCH BAR (10% HEIGHT) */}
                <View style={{height: height * 0.05, justifyContent: 'center' }}>
                    <TextInput
                        style={{
                            width: '100%',
                            height: 40,
                            backgroundColor: '#f2f2f2',
                            borderRadius: 20,
                            borderWidth: 0.25,
                            paddingHorizontal: 20,
                        }}
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* ✅ 3. TITLE SECTION (5% HEIGHT) */}
                <View style={{ height: height * 0.05, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Trip Plans</Text>
                </View>

                {/* ✅ 4. TRIPS LIST (30% HEIGHT) */}
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                    style={{ height: height * 0.3 }}
                >
                    {trips.map((trip) => (
                        <TouchableOpacity 
                            key={trip.id} 
                            onPress={handleTripClick}
                            style={{
                                backgroundColor: "#f2f2f2",
                                borderRadius: 15,
                                borderWidth: 0.25,
                                padding: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 250,
                                height: '80%',
                                marginRight: 15,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{trip.tripName}</Text>
                            <Text style={{ fontSize: 12, marginTop: 5 }}>{trip.date}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* ✅ 5. CURRENT FAVORITE DESTINATIONS (20% HEIGHT) */}
                <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Current Favorite Destinations</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    contentContainerStyle={{ paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}
                    style={{ height: height * 0.2 }}
                >
                    {favorites.map((fav) => (
                        <TouchableOpacity 
                            key={fav.id} 
                            onPress={handleTripClick}
                            style={{
                                backgroundColor: "#D3E3FC",
                                borderRadius: 15,
                                borderWidth: 0.25,
                                padding: 15,
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 220,
                                height: '80%',
                                marginRight: 15,
                            }}
                        >
                            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{fav.placeName}</Text>
                            <Text style={{ fontSize: 12, marginTop: 5 }}>{fav.location}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

            </View>
        </SafeAreaWrapper>
    );
}

export default HomeScreen;
