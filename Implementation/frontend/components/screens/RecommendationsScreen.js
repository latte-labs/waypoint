import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/RecommendationsScreenStyles';
import { GOOGLE_PLACES_API_KEY } from '@env';  // ✅ Import API key from .env

//console.log("🔑 API Key from .env:", GOOGLE_PLACES_API_KEY);

const categoryMapping = {
    "museum": "spa",
    "castle": "hiking",
    "university" : "restaurant",
    "landmark": "park"
};

const normalizeCategory = (backendCategory) => {
    return categoryMapping[backendCategory] || backendCategory;
};

const RecommendationsScreen = () => {
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        fetchRecommendations();
    }, []);

    useEffect(() => {
        if (places.length > 0) {
            console.log("📍 Raw API Response Data:", places);
            console.log("🏷️ Selected Category:", selectedCategory);
            console.log("🗂️ Normalized Categories:", places.map(p => normalizeCategory(p.category)));
        } else {
            console.warn("⚠️ No places received from API. Check API response.");
        }
    }, [places]);

    const fetchRecommendations = async () => {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            console.log("📥 Retrieved user_id from storage:", userId);

            if (!userId) {
                console.error("No user ID found in storage");
                return;
            }
            const numericUserId = parseInt(userId, 10);
            console.log("📥 Converted user_id to integer:", numericUserId);

            const location = "49.2827,-123.1207";  // Vancouver Example
            const requestUrl = `${API_BASE_URL}/places/recommendations?user_id=${numericUserId}&location=${location}&radius=5000`;
            console.log("🚀 Sending GET request to:", requestUrl);

            const response = await axios.get(requestUrl);

            setPlaces(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching recommendations:", error.response?.data || error.message);
            setLoading(false);
        }
    };

    const renderPlaceItem = ({ item }) => {
        let imageUrl;

        if (item.cached_data.photos?.[0]?.photo_reference) {
            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.cached_data.photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`;
        } else if (item.cached_data.icon) {
            imageUrl = item.cached_data.icon;  // Fallback to Google Maps icon
        } else {
            imageUrl = 'https://via.placeholder.com/400';  //  Fallback if no photo exists
        }

        //console.log("🖼️ Image URL:", imageUrl);  // Debugging

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

    const filterPlaces = places.filter(place => {
        const rawCategory = place.category;  // Get the original category from API
        const normalized = normalizeCategory(rawCategory);  // Apply mapping
        console.log(` Mapping: ${rawCategory} -> ${normalized}`);  // Debugging
        return selectedCategory ? normalized === selectedCategory : true;
    });
    console.log("🔍 Filtered Places:", filterPlaces);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Recommended Places</Text>

            {/* Category Filters */}
            <View style={styles.filterContainer}>
                {["All", "spa", "park", "restaurant", "hiking"].map((category, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.filterButton,
                            selectedCategory === category && styles.selectedFilter
                        ]}
                        onPress={() => setSelectedCategory(category === "All" ? null : category)}
                    >
                        <Text style={styles.filterText}>{category}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FF6F00" />
            ) : (
                <FlatList
                    data={filterPlaces}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderPlaceItem}  // Use the function reference
                />
            )}
        </View>
    );
};

export default RecommendationsScreen;
