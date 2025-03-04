import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import API_BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_MAPS_API_KEY, GOOGLE_PLACES_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/InteractiveRecommendationsStyle';

const METRO_VANCOUVER_BOUNDARIES = {
    northEast: { latitude: 49.50, longitude: -122.50 },
    southWest: { latitude: 49.00, longitude: -123.30 },
};

const InteractiveRecommendations = () => {
    const mapRef = useRef(null);
    const navigation = useNavigation();
    const [mapPlaces, setMapPlaces] = useState([]); // Places for map markers
    const [recommendations, setRecommendations] = useState([]); // Places for recommendations list
    const [loading, setLoading] = useState(true);
    const [travelStyle, setTravelStyle] = useState("relaxation"); // Filter for the map
    const [selectedCategory, setSelectedCategory] = useState(null); // Filter for recommendations list
    const [region, setRegion] = useState({
        latitude: 49.2827,
        longitude: -123.1207,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    useEffect(() => {
        fetchPlaces();
    }, [travelStyle, region]);

    useEffect(() => {
        fetchRecommendations();
    }, [selectedCategory]);

    const fetchPlaces = async () => {
        if (
            region.latitude < METRO_VANCOUVER_BOUNDARIES.southWest.latitude ||
            region.latitude > METRO_VANCOUVER_BOUNDARIES.northEast.latitude ||
            region.longitude < METRO_VANCOUVER_BOUNDARIES.southWest.longitude ||
            region.longitude > METRO_VANCOUVER_BOUNDARIES.northEast.longitude
        ) {
            console.log("Outside Metro Vancouver - No data fetched");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/places/search`, {
                params: {
                    location: `${region.latitude},${region.longitude}`,
                    radius: 5000,
                    travel_style: travelStyle
                }
            });

            const fetchedPlaces = response.data.cached_places || response.data.newly_added_places;
            setMapPlaces(fetchedPlaces); // ✅ Store places for the map
        } catch (error) {
            console.error("Error fetching places:", error);
        }
        setLoading(false);
    };

    const fetchRecommendations = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            if (!userId) {
                console.error("No user ID found in storage");
                return;
            }

            const requestUrl = `${API_BASE_URL}/places/recommendations?user_id=${userId}&location=${region.latitude},${region.longitude}&radius=5000&travel_style=${travelStyle}`;
            const response = await axios.get(requestUrl);
            setRecommendations(response.data); // ✅ Store recommendations separately
            setLoading(false);
        } catch (error) {
            console.error("Error fetching recommendations:", error.response?.data || error.message);
            setLoading(false);
        }
    };

    const handleRegionChange = (newRegion) => {
        setRegion((prevRegion) => ({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            latitudeDelta: prevRegion.latitudeDelta,
            longitudeDelta: prevRegion.longitudeDelta,
        }));
    };

    const handleTravelStyleChange = (style) => {
        setTravelStyle(style);
        fetchPlaces(); // ✅ Immediately fetch new places for the updated travel style
    };

    const renderPlaceItem = ({ item }) => {
        let imageUrl = item.cached_data.photos?.[0]?.photo_reference
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.cached_data.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
            : item.cached_data.icon || 'https://via.placeholder.com/400';

        return (
            <View style={styles.card}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardCategory}>{item.category}</Text>
                    <Text style={styles.cardRating}>⭐ {item.rating || "N/A"}</Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Travel Style Filters for Map */}
            <View style={styles.filterContainer}>
                {["relaxation", "adventure", "cultural", "foodie"].map((style) => (
                    <TouchableOpacity
                        key={style}
                        style={[styles.filterButton, travelStyle === style && styles.selectedFilter]}
                        onPress={() => handleTravelStyleChange(style)}
                    >
                        <Text style={styles.filterText}>{style}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Interactive Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                region={region}
                onRegionChangeComplete={handleRegionChange}
            >
                {mapPlaces.map((place, index) => (
                    <Marker key={index} coordinate={{ latitude: place.lat, longitude: place.lng }} title={place.name}>
                        <Callout>
                            <View>
                                <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
                                <Text>{place.category}</Text>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            {/* Category Filters for Recommendations */}
            <View style={styles.filterContainer}>
                {["All", "spa", "park", "restaurant", "hiking"].map((category, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.filterButton, selectedCategory === category && styles.selectedFilter]}
                        onPress={() => setSelectedCategory(category === "All" ? null : category)}
                    >
                        <Text style={styles.filterText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Recommended Places List */}
            {loading ? (
                <ActivityIndicator size="large" color="#FF6F00" />
            ) : (
                <FlatList
                    data={selectedCategory ? recommendations.filter(p => p.category === selectedCategory) : recommendations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlaceItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
        </View>
    );
};

export default InteractiveRecommendations;
