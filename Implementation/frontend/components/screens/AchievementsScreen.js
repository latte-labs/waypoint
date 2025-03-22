import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { database } from '../../firebase';        // Make sure this matches your Firebase import
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_CATEGORIES = ['park', 'bar', 'museum'];

// Helper to determine badge based on check-in count
function getBadge(count) {
    if (count >= 20) return 'Gold';
    if (count >= 10) return 'Silver';
    if (count >= 5) return 'Bronze';
    return 'No Badge Yet';
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Achievements</Text>
            {achievements.map((item) => (
                <View key={item.category} style={styles.card}>
                    <Text style={styles.cardTitle}>{item.category.toUpperCase()}</Text>
                    <Text>Check-Ins: {item.count}</Text>
                    <Text>Badge: {item.badge}</Text>
                </View>
            ))}
        </View>
    );
};

export default AchievementsScreen;

// Sample styling; adapt as needed or move to AchievementsScreenStyles.js
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    card: {
        backgroundColor: '#f2f2f2',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
});
