import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import API_BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/InteractiveRecommendationsStyle';
import SafeAreaWrapper from './SafeAreaWrapper';

const { width, height } = Dimensions.get('window');

const InteractiveRecommendations = () => {
    const mapRef = useRef(null);
    const navigation = useNavigation();
    const [mapPlaces, setMapPlaces] = useState([]);
    const [travelStyle, setTravelStyle] = useState("relaxation");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [region, setRegion] = useState({
        latitude: 49.2827,
        longitude: -123.1207,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [loading, setLoading] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        fetchPlaces();
    }, [travelStyle, region]);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/places/search`, {
                params: {
                    location: `${region.latitude},${region.longitude}`,
                    radius: 5000,
                    travel_style: travelStyle
                }
            });

            setMapPlaces(response.data);
        } catch (error) {
            console.error("Error fetching places:", error);
        }
        setLoading(false);
    };

    const handleRegionChange = (newRegion) => {
        setRegion({
            latitude: newRegion.latitude,
            longitude: newRegion.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
        });
    };

    const handleZoom = (zoomIn) => {
        setRegion(prevRegion => ({
            ...prevRegion,
            latitudeDelta: zoomIn ? prevRegion.latitudeDelta / 1.5 : prevRegion.latitudeDelta * 1.5,
            longitudeDelta: zoomIn ? prevRegion.longitudeDelta / 1.5 : prevRegion.longitudeDelta * 1.5,
        }));
    };

    // Extract unique categories from the places list for filtering
    const uniqueCategories = [
        ...new Set(mapPlaces.map((place) => place.category))
    ];

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
            {/* Travel Style Warning Message */}
            {!travelStyle && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        Your travel style is not determined yet. Defaulting to "Relaxation".
                        Please complete your profile.
                    </Text>
                </View>
            )}
            
            {!isFullscreen && (
                <View style={styles.filterContainer}>
                    {['relaxation', 'adventure', 'cultural', 'foodie'].map((style) => (
                        <TouchableOpacity
                            key={style}
                            style={[styles.filterButton, travelStyle === style && styles.selectedFilter]}
                            onPress={() => setTravelStyle(style)}
                        >
                            <Text style={styles.filterText}>{style}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Map Section */}
            <View style={styles.mapContainer}>
                <MapView
                    ref={mapRef}
                    style={isFullscreen ? styles.fullscreenMap : styles.map}
                    region={region}
                    onRegionChangeComplete={handleRegionChange}
                >
                    {mapPlaces.map((place, index) => (
                        <Marker key={index} coordinate={{ latitude: place.latitude, longitude: place.longitude }} title={place.name}>
                            <Callout>
                                <View>
                                    <Text style={{ fontWeight: 'bold' }}>{place.name}</Text>
                                    <Text>{place.category}</Text>
                                </View>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            </View>

            {/* Zoom & Fullscreen Buttons */}
            <View
                style={[
                    styles.zoomControlsContainer,
                    isFullscreen
                        ? { bottom: 20, right: 20, top: 'auto' }  // Fullscreen mode (bottom-right)
                        : { top: height * 0.2 - 60 },             // Non-fullscreen mode (current position)
                ]}
            >
                <TouchableOpacity style={styles.fullscreenButton} onPress={() => setIsFullscreen(!isFullscreen)}>
                    <Text style={styles.zoomText}>{isFullscreen ? "x" : "x"}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(true)}>
                    <Text style={styles.zoomText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(false)}>
                    <Text style={styles.zoomText}>-</Text>
                </TouchableOpacity>
            </View>


            {/* Scrollable Category Filter */}
            {!isFullscreen && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.filterScrollContainer}>
                    {['All', ...uniqueCategories].map((category) => (
                        <TouchableOpacity
                            key={category}
                            style={[styles.filterButton, selectedCategory === category && styles.selectedFilter]}
                            onPress={() => setSelectedCategory(category === "All" ? null : category)}
                        >
                            <Text style={styles.filterText}>{category}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {/* Recommended Places List */}
            {!isFullscreen && (
    <View style={styles.listContainer}>
        <FlatList
            data={selectedCategory ? mapPlaces.filter(place => place.category === selectedCategory) : mapPlaces}
            keyExtractor={(item) => item.place_id || `${item.name}-${item.latitude}-${item.longitude}`}
            renderItem={({ item }) => {
                let imageUrl;

                if (item.cached_data?.photos?.[0]?.photo_reference) {
                    imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.cached_data.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
                } else if (item.cached_data?.icon) {
                    imageUrl = item.cached_data.icon;  // Fallback to Google Maps icon
                } else {
                    imageUrl = 'https://via.placeholder.com/400';  // Fallback if no photo exists
                }

                return (
                    <View style={styles.card}>
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text>{item.category}</Text>
                            <Text>⭐ {item.rating || "N/A"}</Text>
                        </View>
                    </View>
                );
            }}
        />
    </View>
)}

        </View>
        </SafeAreaWrapper>
    );
};

export default InteractiveRecommendations;