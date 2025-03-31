import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import OnboardingChecklist from './OnboardingChecklist';


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
    const [recentTrips, setRecentTrips] = useState([]);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
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
                if (userId) {
                    database()
                        .ref(`/users/${userId}/onboarding/packing_tip_viewed`)
                        .set(true);
                }
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
            const fetchData = async () => {
                try {
                    const storedUser = await AsyncStorage.getItem('user');
                    if (!storedUser) return;

                    const user = JSON.parse(storedUser);
                    setUserId(String(user.id));

                    // ✅ Fetch onboarding status
                    const onboardingSnap = await database()
                        .ref(`/users/${user.id}/onboarding/onboarding_complete`)
                        .once('value');
                    setOnboardingComplete(onboardingSnap.val() === true);

                    // ✅ Fetch travel style
                    const userRef = database().ref(`/users/${user.id}`);
                    const snapshot = await userRef.once('value');
                    const firebaseTravelStyleId =
                        snapshot.val()?.travel_style_id ?? user.travel_style_id;
                    setShowQuizPrompt(firebaseTravelStyleId === 4);
                    user.travel_style_id = firebaseTravelStyleId;
                    await AsyncStorage.setItem('user', JSON.stringify(user));

                    // ✅ Fetch saved weather
                    const savedWeather = await AsyncStorage.getItem('last_searched_weather');
                    if (savedWeather) {
                        const { lat, lng } = JSON.parse(savedWeather);
                        fetchWeather(lat, lng);
                    }
                    // ✅ Load owned itineraries from AsyncStorage + shared itineraries from backend API
                    let owned = [];
                    const storedOwnedTrips = await AsyncStorage.getItem('recent_itineraries');
                    if (storedOwnedTrips) {
                        owned = JSON.parse(storedOwnedTrips);
                    } else {
                        // Fallback: Fetch from backend if not in AsyncStorage
                        const response = await axios.get(`${API_BASE_URL}/itineraries/users/${user.id}/itineraries`);
                        if (response.status === 200) {
                            owned = response.data;
                            await AsyncStorage.setItem('recent_itineraries', JSON.stringify(owned));
                        }
                    }
                    // Add type "personal" to owned itineraries
                    owned = owned.map(item => ({ ...item, type: 'personal' }));

                    //Fetch shared itineraries from backend API via Firebase
                    let shared = [];
                    const snapshotShared = await database().ref('/live_itineraries').once('value');
                    if (snapshotShared.exists()) {
                        const data = snapshotShared.val();
                        const itineraryIds = Object.keys(data).filter(itineraryId =>
                            data[itineraryId].collaborators && data[itineraryId].collaborators[user.id]
                        );
                        if (itineraryIds.length > 0) {
                            const itineraryPromises = itineraryIds.map(async (itineraryId) => {
                                try {
                                    const res = await axios.get(`${API_BASE_URL}/itineraries/${itineraryId}`);
                                    return res.status === 200 ? res.data : null;
                                } catch (error) {
                                    console.error(`Error fetching shared itinerary ${itineraryId}:`, error);
                                    return null;
                                }
                            });
                            shared = (await Promise.all(itineraryPromises)).filter(Boolean);
                        }
                    }
                    // Add type "shared" to shared itineraries
                    shared = shared.map(item => ({ ...item, type: 'shared' }));

                    // CHANGED: Merge owned and shared itineraries into recentTrips
                    setRecentTrips([...owned, ...shared]);

                } catch (error) {
                    console.error('❌ Error during home screen data load:', error);
                } finally {
                    setLoadingItineraries(false);
                }
            };

            setLoadingItineraries(true);
            fetchData();
        }, [])
    );




    const [itineraries, setItineraries] = useState([]);
    const [loadingItineraries, setLoadingItineraries] = useState(false);
    const [checklistRefreshTrigger, setChecklistRefreshTrigger] = useState(0);

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
        setLocation(coords);
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

    const renderEmptyItineraryCard = () => (
        <View style={HomeScreenStyles.tripCard}>
            <Image
                source={require('../../assets/images/travelling_placeholder.jpg')}
                style={HomeScreenStyles.tripImage}
            />
            <View style={HomeScreenStyles.tripOverlay} />
            <View style={{ justifyContent: 'center', alignItems: 'center', zIndex: 1 }}>
                <Text style={HomeScreenStyles.tripTitle}>You have no itineraries yet.</Text>
            </View>
        </View>
    );

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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={HomeScreenStyles.tripTitle}>{itinerary.name}</Text>
                        <Icon
                            name={itinerary.type === 'shared' ? 'users' : 'user'}
                            size={16}
                            color={itinerary.type === 'shared' ? '#28a745' : '#007bff'}
                            style={{ marginLeft: 6 }}
                        />
                    </View>
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
                    paddingBottom: 10,
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

                {/* Onboarding Checklist */}
                {!onboardingComplete && (
                    <View style={HomeScreenStyles.checklistCard}>
                        <OnboardingChecklist
                            userId={userId}
                            onComplete={() => setOnboardingComplete(true)}
                            refreshTrigger={checklistRefreshTrigger}
                        />
                    </View>

                )}

                {/* ✅ Feature Highlights Carousel */}
                <View style={{ marginLeft: 0 }}>
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

                {/* ✅ 3. TITLE SECTION*/}
                <View
                    style={[
                        HomeScreenStyles.titleContainer,
                        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 7 }
                    ]}
                >
                    <Text style={HomeScreenStyles.titleText}>Trip Plans</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate("Main", { screen: "Itinerary" })}
                    >
                        <Text style={{ fontSize: 14, color: '#1E3A8A', fontWeight: 'bold' }}>View All</Text>
                    </TouchableOpacity>
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
                    ) : (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={true}
                            contentContainerStyle={{ flexDirection: 'row', alignItems: 'center' }}
                            style={HomeScreenStyles.tripScrollView}
                        >
                            {recentTrips.length > 0
                                ? recentTrips.slice(0, 3).map(renderItineraryCard)
                                : renderEmptyItineraryCard()}
                        </ScrollView>
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

                        if (userId) {
                            database()
                                .ref(`/users/${userId}/onboarding/weather_changed`)
                                .set(true);
                            setChecklistRefreshTrigger((prev) => prev + 1);
                        }
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