import React, { useState, useEffect, useRef } from 'react';
import {
    Image,
    Text,
    ScrollView,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions,
    Modal,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import SafeAreaWrapper from './SafeAreaWrapper';
import HomeScreenStyles from '../../styles/HomeScreenStyle';
import LocationPermissions from './permissions/LocationPermissions';
import axios from 'axios';
import API_BASE_URL from '../../config';
import FeatureCarousel from './FeatureCarousel';
import StartJourneyBanner from './StartJourneyBanner';
import Icon from 'react-native-vector-icons/FontAwesome5';
import PackingSuggestionModal from './PackingSuggestionModal';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withDecay,
    runOnJS
} from 'react-native-reanimated';
import WeatherSearchModal from './WeatherSearchModal';
import { navigationStyles } from '../../styles/NavigationStyles';

const { width, height } = Dimensions.get('window');
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}


function HomeScreen() {
    const navigation = useNavigation();
    const goToChatbot = () => {
        navigation.navigate('Chatbot');
    };

    const FAB_SIZE = 60; // width/height of your floating button
    const PADDING = 20;
    const translationX = useSharedValue(width - FAB_SIZE - PADDING);
    const translationY = useSharedValue(height - FAB_SIZE * 3);
    const prevTranslationX = useSharedValue(300);
    const prevTranslationY = useSharedValue(500);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translationX.value },
            { translateY: translationY.value },
        ],
    }));

    const panGesture = Gesture.Pan()
        .minDistance(1)
        .onStart(() => {
            prevTranslationX.value = translationX.value;
            prevTranslationY.value = translationY.value;
        })
        .onUpdate((event) => {
            const maxTranslateX = width - FAB_SIZE - PADDING;
            const maxTranslateY = height - FAB_SIZE - PADDING;

            translationX.value = clamp(
                prevTranslationX.value + event.translationX,
                0,
                maxTranslateX
            );
            translationY.value = clamp(
                prevTranslationY.value + event.translationY,
                0,
                maxTranslateY
            );
        })

        .runOnJS(true);

    const tapGesture = Gesture.Tap().onEnd((_event, success) => {
        if (success) {
            runOnJS(goToChatbot)();
        }
    });

    const combinedGesture = Gesture.Simultaneous(panGesture, tapGesture);


    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState([
        { id: '1', placeName: 'Banff National Park', location: 'Alberta, Canada' },
        { id: '2', placeName: 'Santorini', location: 'Greece' },
        { id: '3', placeName: 'Kyoto Temples', location: 'Japan' },
    ]);
    const [showQuizPrompt, setShowQuizPrompt] = useState(false);
    const [userId, setUserId] = useState(null);

    const [autocompleteInput, setAutocompleteInput] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState([]);


    // WEATHER
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [showWeatherSearchModal, setShowWeatherSearchModal] = useState(false);


    const [showPackingModal, setShowPackingModal] = useState(false);
    const [packingTip, setPackingTip] = useState('');
    const [loadingPackingTip, setLoadingPackingTip] = useState(false);

    const handlePackingTip = async () => {
        if (!weather?.temperature || !weather?.weather_name) return;

        const city = weather?.weather_location_name || weather?.city_name || "your location";

        try {
            setShowPackingModal(true);
            setLoadingPackingTip(true);
            const response = await axios.post(`${API_BASE_URL}/chatbot/packing`, {
                city,
                temperature: weather.temperature,
                condition: weather.weather_name,
            });

            if (response.data.status === 'success') {
                setPackingTip(response.data.packing_tip);
            } else {
                setPackingTip("Oops! Couldn't generate a tip.");
            }
        } catch (err) {
            console.error("Packing tip error:", err);
            setPackingTip("Something went wrong. Please try again.");
        } finally {
            setLoadingPackingTip(false);
        }
    };


    useFocusEffect(
        React.useCallback(() => {
            const fetchUserData = async () => {
                try {
                    const storedUser = await AsyncStorage.getItem('user');
                    if (!storedUser) return;

                    const user = JSON.parse(storedUser);
                    setUserId(String(user.id));

                    const userRef = database().ref(`/users/${user.id}`);
                    const snapshot = await userRef.once('value');

                    const firebaseTravelStyleId =
                        snapshot.val()?.travel_style_id ?? user.travel_style_id;

                    setShowQuizPrompt(firebaseTravelStyleId === 4);
                    user.travel_style_id = firebaseTravelStyleId;
                    await AsyncStorage.setItem('user', JSON.stringify(user));

                    // ✅ Load saved weather
                    const savedWeather = await AsyncStorage.getItem('last_searched_weather');
                    if (savedWeather) {
                        const { lat, lng } = JSON.parse(savedWeather);
                        fetchWeather(lat, lng);
                    }

                } catch (error) {
                    console.error('❌ Error retrieving user data or weather:', error);
                }
            };

            fetchUserData();
        }, [])
    );

    const [itineraries, setItineraries] = useState([]);
    const [loadingItineraries, setLoadingItineraries] = useState(false);
    // Fetch user info and itineraries on mount
    useEffect(() => {
        const fetchUserAndItineraries = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    setUserId(userData.id);
                    // endpoint for fetching itineraries
                    const response = await axios.get(`${API_BASE_URL}/itineraries/users/${userData.id}/itineraries`);
                    if (response.status === 200) {
                        setItineraries(response.data);
                    }
                }
            } catch (error) {
                console.error("Error fetching itineraries:", error);
            } finally {
                setLoadingItineraries(false);
            }
        };

        setLoadingItineraries(true);
        fetchUserAndItineraries();
    }, []);

    // WEATHER
    const fetchWeather = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/weather`, {
                params: {
                    latitude,
                    longitude,
                },
            });

            if (response.data.status === 'success') {
                const roundedTemperature = Math.round(response.data.data.temperature);
                setWeather({
                    ...response.data.data,
                    temperature: roundedTemperature,
                });
            } else {
                console.log('Error fetching weather: ', response.data.detail);
            }
        } catch (err) {
            console.log('Error fetching weather data: ', err);
        }
    };

    const handleLocationGranted = (coords) => {
        // console.log('Location received in HomeScreen:', coords);
        setLocation(coords); // This will trigger useEffect, which will fetch weather
        setHasLocationPermission(true);
    };

    // ✅ Fetch weather when HomeScreen mounts & location exists
    useEffect(() => {
        if (location) {
            fetchWeather(location.latitude, location.longitude);
        }
    }, [location]);

    const handleQuizStart = () => {
        if (!userId) return;
        navigation.navigate('QuizScreen');
    };

    const handleTripClick = () => {
        Alert.alert('Feature is coming soon!');
    };

    // Shows the LocationPermissions screen if not granted, once granted, proceed to homescreen.
    if (!hasLocationPermission) {
        return <LocationPermissions onLocationGranted={handleLocationGranted} />;
    }

    // ITINERARIES
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short', day: '2-digit', year: 'numeric'
        });
    };

    // Render a card for each itinerary
    const renderItineraryCard = (itinerary) => {
        // Use itinerary.extra_data.image_url if available, otherwise the placeholder image
        const imageSource = itinerary.extra_data?.image_url
            ? { uri: itinerary.extra_data.image_url }
            : require('../../assets/images/travelling_placeholder.jpg');

        return (
            <TouchableOpacity
                key={itinerary.id}
                style={HomeScreenStyles.tripCard}
                onPress={() => {
                    // Navigate to itinerary detail screen
                    navigation.navigate('ItineraryDetail', { itineraryId: itinerary.id });
                }}
            >
                <Image
                    source={imageSource}
                    style={HomeScreenStyles.tripImage}
                />
                <View style={HomeScreenStyles.tripOverlay} />
                {/* Overlay container for text */}
                <View style={{ justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                    <Text style={HomeScreenStyles.tripTitle}>{itinerary.name}</Text>
                    <Text style={HomeScreenStyles.tripDate}>{formatDate(itinerary.start_date)}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (

        <SafeAreaWrapper>
            {/* ✅ 1. HEADER SECTION (30% HEIGHT) */}
            <View style={HomeScreenStyles.headerContainer}>
                <View style={HomeScreenStyles.brandContainer}>
                    <Image
                        source={require('../../assets/images/logo.png')}
                        style={HomeScreenStyles.logo}
                    />
                    <Text style={HomeScreenStyles.waypointText}>WayPoint</Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1, backgroundColor: 'white' }}
                contentContainerStyle={{
                    paddingBottom: 70,
                    paddingHorizontal: 16, // ✅ Add space on left and right
                }}
                keyboardShouldPersistTaps="handled"
            >

                {/* Weather */}
                <View style={HomeScreenStyles.weatherContainer}>
                    <View style={HomeScreenStyles.weatherRow}>
                        {/* Left side: icon, temperature, city */}
                        <TouchableOpacity
                            onPress={handlePackingTip}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                            activeOpacity={0.8}
                        >
                            <Image
                                source={{
                                    uri: `https://openweathermap.org/img/wn/${weather?.weather_icon || '01d'}@2x.png`,
                                }}
                                style={HomeScreenStyles.weatherIcon}
                            />
                            <Text style={HomeScreenStyles.temperatureText}>
                                {weather?.temperature ? `${weather.temperature}°C` : '--°C'}
                            </Text>
                            <Text style={HomeScreenStyles.cityText}>
                                {weather?.weather_name || 'City Name'}
                            </Text>
                        </TouchableOpacity>

                        {/* Right side: search icon */}
                        <TouchableOpacity onPress={() => setShowWeatherSearchModal(true)}>
                            <Icon name="search" size={18} color="#1E3A8A" />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* ✅ Feature Highlights Carousel */}
                <View style={{ marginLeft: 7 }}>
                    <FeatureCarousel />
                </View>

                {showQuizPrompt ? (
                    <StartJourneyBanner
                        title="Not sure where to go?"
                        subtitle="Take our travel style quiz to unlock personalized destinations."
                        buttonText="Start Quiz"
                        // image={require('../../assets/images/start-banner.jpg')} 
                        onPress={handleQuizStart}
                    />
                ) : null}

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
                    {loadingItineraries ? (
                        <Text>Loading itineraries...</Text>
                    ) : itineraries.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                            style={HomeScreenStyles.tripScrollView}
                        >
                            {itineraries.map(renderItineraryCard)}
                        </ScrollView>
                    ) : (
                        <Text style={{ textAlign: 'center', marginVertical: 20 }}>You have no itineraries yet.</Text>
                    )}
                </ScrollView>

            </ScrollView>
            <GestureDetector gesture={combinedGesture}>
                <Animated.View style={[HomeScreenStyles.floatingButton, animatedStyle]}>
                    <View style={HomeScreenStyles.innerButton}>
                        {/* <FontAwesomeIcon icon="fa-solid fa-robot" /> */}
                        <Icon name="robot" size={24} color="#fff" />
                    </View>
                </Animated.View>
            </GestureDetector>

            <Modal
                visible={showWeatherSearchModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowWeatherSearchModal(false)}
            >
                <WeatherSearchModal
                    visible={showWeatherSearchModal}
                    onClose={() => setShowWeatherSearchModal(false)}
                    onSelectCity={async ({ city, lat, lng }) => {
                        await AsyncStorage.setItem(
                            'last_searched_weather',
                            JSON.stringify({ city, lat, lng })
                        );
                        fetchWeather(lat, lng);
                    }}
                />
            </Modal>



            <PackingSuggestionModal
                visible={showPackingModal}
                suggestion={packingTip}
                loading={loadingPackingTip}
                onClose={() => setShowPackingModal(false)}
            />






        </SafeAreaWrapper>
    );
}

export default HomeScreen;