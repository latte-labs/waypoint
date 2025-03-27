import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, ScrollView, Dimensions, Alert, TouchableHighlight } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import axios from 'axios';
import API_BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { useNavigation } from '@react-navigation/native';
import styles from '../../styles/InteractiveRecommendationsStyle';
import SafeAreaWrapper from './SafeAreaWrapper';
import Icon from 'react-native-vector-icons/FontAwesome';


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
    const flatListRef = useRef(null);
    const markerRefs = useRef([]);



    useEffect(() => {
        fetchPlaces();
    }, [travelStyle, region]);

    const fetchPlaces = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/places/cached`, {
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
    const filteredPlaces = selectedCategory
        ? mapPlaces.filter(place => place.category === selectedCategory)
        : mapPlaces;


    const handleMarkerPress = (index) => {
        if (flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true });
        }
    };
    const focusMapOnPlace = (place, index) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: place.latitude,
                longitude: place.longitude,
            }, 500);
        }
    
        // Show Callout
        if (markerRefs.current[index]) {
            markerRefs.current[index].showCallout();
        }
    };
    
    const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
        
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
                    {['relaxation', 'adventure', 'cultural', 'foodie'].map((style) => {
                        const label = style.charAt(0).toUpperCase() + style.slice(1);
                        return (
                            <TouchableOpacity
                                key={style}
                                style={[styles.filterButton, travelStyle === style && styles.selectedFilter]}
                                onPress={() => setTravelStyle(style)}
                            >
                                <Text style={styles.filterText}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
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
                    {filteredPlaces.map((place, index) => (
                        <Marker
                            key={index}
                            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
                            ref={(ref) => markerRefs.current[index] = ref}
                            title={place.name}
                            onPress={() => handleMarkerPress(index)}
                        >
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
                    
                    {['All', ...uniqueCategories].map((category) => {
                        const label = category
                            .split('_')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                
                        const isSelected = selectedCategory === category || (category === 'All' && selectedCategory === null);
                
                        return (
                            <TouchableOpacity
                                key={category}
                                style={[styles.filterButton, isSelected && styles.selectedFilter]}
                                onPress={() => setSelectedCategory(category === "All" ? null : category)}
                            >
                                <Text style={styles.filterText}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            

            )}
            {/* Recommended Places List */}
            {!isFullscreen && (
            <View style={styles.listContainer}>
                <FlatList
                    ref={flatListRef}
                    data={filteredPlaces}
                    keyExtractor={(item, index) =>
                        `${item.name?.replace(/\s+/g, '')}-${item.latitude.toFixed(5)}-${item.longitude.toFixed(5)}-${index}`
                      }                      
                    renderItem={({ item, index }) => {
                        const imageUrl = require('../../assets/images/placeholder_placelist.png');

                        return (
                            <TouchableOpacity onPress={() => focusMapOnPlace(item, index)} activeOpacity={0.8}>
                                <View style={styles.card}>
                                    <Image source={imageUrl} style={styles.image} />
                                    
                                    {/* Add to Itinerary Button */}
                                    <TouchableOpacity
                                        style={styles.addButton}
                                        onPress={() => Alert.alert("Coming Soon", "Adding to Itinerary Feature will be available soon")}
                                    >
                                        <Icon name="plus-circle" size={24} color="#007AFF" />
                                    </TouchableOpacity>

                                    <View style={styles.cardContent}>
                                        <Text style={styles.cardTitle}>{item.name}</Text>
                                        <Text>{capitalize(item.category)}</Text>
                                        <Text>⭐ {item.rating || "N/A"}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

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