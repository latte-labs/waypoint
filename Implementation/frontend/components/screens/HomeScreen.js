import React, { useState, useEffect } from 'react';
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
import Geolocation from 'react-native-geolocation-service';
import SafeAreaWrapper from './SafeAreaWrapper';
import HomeScreenStyles from '../../styles/HomeScreenStyle';
import LocationPermissions from './permissions/LocationPermissions';
import axios from 'axios';
import API_BASE_URL from '../../config';
import FeatureCarousel from './FeatureCarousel';
import StartJourneyBanner from './StartJourneyBanner';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '@env';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PackingSuggestionModal from './PackingSuggestionModal';

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
                        <FontAwesome name="search" size={18} color="#1E3A8A" />
                        </TouchableOpacity>
                    </View>
                </View>

                



                {/* ✅ Feature Highlights Carousel */}
                <FeatureCarousel />

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
            </ScrollView>
            <Modal
                visible={showWeatherSearchModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowWeatherSearchModal(false)}
            >
                <View style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.4)',
                justifyContent: 'flex-end',
                }}>
                <View style={{
                    backgroundColor: '#fff',
                    padding: 20,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    height: '60%',
                }}>
                    <Text style={{
                    fontSize: 18,
                    fontWeight: '600',
                    marginBottom: 12,
                    textAlign: 'center',
                    }}>Search for a City</Text>

                    <GooglePlacesAutocomplete
                    placeholder="Type a city"
                    onPress={async (data, details = null) => {
                        const location = details?.geometry?.location;
                        const cityName = details?.address_components?.find(c => c.types.includes('locality'))?.long_name || data.description;
                      
                        if (location) {
                          fetchWeather(location.lat, location.lng);
                          
                          // ✅ Save to AsyncStorage
                          await AsyncStorage.setItem(
                            'last_searched_weather',
                            JSON.stringify({
                              city: cityName,
                              lat: location.lat,
                              lng: location.lng,
                            })
                          );
                      
                          setShowWeatherSearchModal(false);
                        }
                    }}
                      
                    query={{
                        key: GOOGLE_PLACES_API_KEY,
                        language: 'en',
                        types: '(cities)',
                    }}
                    fetchDetails={true}
                    styles={{
                        textInputContainer: {
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        },
                        textInput: {
                        height: 50,
                        fontSize: 16,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        },
                        listView: {
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        borderColor: '#ddd',
                        borderWidth: 1,
                        marginTop: 5,
                        elevation: 3,
                        zIndex: 9999,
                        },
                    }}
                    />

                    <TouchableOpacity
                    onPress={() => setShowWeatherSearchModal(false)}
                    style={{
                        backgroundColor: '#1E3A8A',
                        padding: 12,
                        marginTop: 15,
                        borderRadius: 10,
                        alignItems: 'center'
                    }}
                    >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Close</Text>
                    </TouchableOpacity>
                </View>
                </View>
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