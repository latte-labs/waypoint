import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, FlatList } from 'react-native';
import { database } from '../../firebase';        // Make sure this matches your Firebase import
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/AchievementScreenStyles'
import SafeAreaWrapper from './SafeAreaWrapper';
import * as Progress from 'react-native-progress';

const trophyImages = {
    park: {
        Bronze: require('../../assets/achievements/park/bronze_park.jpeg'),
        Silver: require('../../assets/achievements/park/silver_park.jpeg'),
        Gold: require('../../assets/achievements/park/gold_park.jpeg'),
    },
    bar: {
        Bronze: require('../../assets/achievements/bar/bronze_bar.jpeg'),
        Silver: require('../../assets/achievements/bar/silver_bar.jpeg'),
        Gold: require('../../assets/achievements/bar/gold_bar.jpeg'),
    },
    museum: {
        Bronze: require('../../assets/achievements/museum/bronze_museum.jpeg'),
        Silver: require('../../assets/achievements/museum/silver_museum.jpeg'),
        Gold: require('../../assets/achievements/museum/gold_museum.jpeg'),
    },
};

const ALL_CATEGORIES = ['park', 'bar', 'museum'];

// Helper to determine badge based on check-in count
function getBadge(count) {
    if (count >= 20) return 'Gold';
    if (count >= 10) return 'Silver';
    return 'Bronze';
}

// To return trophy image based on category and badge
function getBadgeImage(category, badge) {
    return trophyImages[category] && trophyImages[category][badge]
        ? trophyImages[category][badge]
        : null;
}

// Calculate progress to next achievement
function getProgress(count) {
    if (count < 5) return count / 5;
    else if (count < 10) return (count - 5) / 5;
    else if (count < 20) return (count - 10) / 10;
    else return 1;
}

function getProgressText(count) {
    if (count < 5) return `${count}/5`;
    else if (count < 10) return `${count - 5}/5`;
    else if (count < 20) return `${count - 10}/10`;
    else return `Achieved`;
}

const AchievementsScreen = () => {
    const [loading, setLoading] = useState(true);
    const [achievements, setAchievements] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        setLoading(true);
        setError(null);

        try {
            // Get the current user from AsyncStorage
            const storedUser = await AsyncStorage.getItem('user');
            if (!storedUser) {
                setError("User not logged in.");
                setLoading(false);
                return;
            }
            const userData = JSON.parse(storedUser);
            const userId = userData.id;

            // Read from Firebase: /game/userId
            const snapshot = await database().ref(`/game/${userId}`).once('value');
            const data = snapshot.val() || {};

            // data will look like:
            // {
            //   park: { checkinId1: {...}, checkinId2: {...} },
            //   bar:  { checkinId3: {...}, ...},
            //   museum: { ... }
            // }

            const results = ALL_CATEGORIES.map((category) => {
                const checkInsObj = data[category] || {};  // If category missing in Firebase, treat as {}
                const checkInCount = Object.keys(checkInsObj).length;
                return {
                    category,
                    count: checkInCount,
                    badge: getBadge(checkInCount),
                };
            });

            setAchievements(results);
        } catch (err) {
            console.error("Error fetching achievements:", err);
            setError("Failed to fetch achievements.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" />
                <Text>Loading Achievements...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={{ color: 'red' }}>{error}</Text>
            </View>
        );
    }

    if (achievements.length === 0) {
        return (
            <View style={styles.container}>
                <Text>No achievements found. Try checking in somewhere!</Text>
            </View>
        );
    }

    // Renders each achievement as a grid item
    const renderAchievementItem = ({ item }) => {
        const trophyImage = getBadgeImage(item.category, item.badge);
        return (
            <View style={styles.gridItem}>
                <Image
                    source={trophyImage}
                    style={[
                        styles.badgeImage,
                        item.count < 5 && { opacity: 0.3 }, // dull if below 5
                    ]}
                />
                <Text style={styles.gridItemTitle}>{item.category.toUpperCase()}</Text>
                <Text style={styles.gridItemCheckins}>Check-Ins: {item.count}</Text>

                <Progress.Bar
                    progress={getProgress(item.count)}
                    width={null}
                    borderWidth={0}
                    borderRadius={0}
                    unfilledColor="#EEE"
                    color="#1E3A8A"
                    style={styles.gridProgressBar}
                />
                <Text style={styles.gridProgressText}>
                    {getProgressText(item.count)}
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaWrapper>
            <View style={styles.container}>
                <Text style={styles.title}>Your Achievements</Text>

                {/* FlatList with 3 columns for a grid layout */}
                <FlatList
                    data={achievements}
                    keyExtractor={(item) => item.category}
                    numColumns={3}  // Grid with 3 columns
                    renderItem={renderAchievementItem}
                    columnWrapperStyle={styles.columnWrapper} // optional styling
                />
            </View>
        </SafeAreaWrapper>
    );
};

export default AchievementsScreen;