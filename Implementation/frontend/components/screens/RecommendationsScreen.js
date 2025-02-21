import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import axios from 'axios';
import API_BASE_URL from '../../config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/RecommendationsScreenStyles';

const RecommendationsScreen = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  useEffect(() => {
    fetchRecommendations();
  }, []);

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

  const filterPlaces = selectedCategory
    ? places.filter(place => place.category === selectedCategory)
    : places;

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
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.cached_data.photos?.[0]?.photo_reference }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardCategory}>{item.category}</Text>
                <Text style={styles.cardRating}>⭐ {item.rating || "N/A"}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default RecommendationsScreen;
