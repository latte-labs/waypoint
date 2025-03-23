import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, FlatList, Modal, TouchableOpacity } from 'react-native';
import { database } from '../../firebase';        // Make sure this matches your Firebase import
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/AchievementScreenStyles'
import SafeAreaWrapper from './SafeAreaWrapper';
import * as Progress from 'react-native-progress';
import { Dimensions } from 'react-native';

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
    const screenWidth = Dimensions.get('window').width;

    // modal
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedAchievement, setSelectedAchievement] = useState(null);

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

    const openModal = (achievement) => {
        setSelectedAchievement(achievement);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedAchievement(null);
    };

    // Renders each achievement as a grid item
    const renderAchievementItem = ({ item }) => {
        const trophyImage = getBadgeImage(item.category, item.badge);
        return (
            <TouchableOpacity style={styles.gridItem} onPress={() => openModal(item)}>
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
            </TouchableOpacity>
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
                {/* MODAL: displays when user taps a grid item */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent={true}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            {/* Close button */}
                            <Text
                                style={styles.modalCloseButton}
                                onPress={closeModal}
                            >
                                X
                            </Text>

                            {selectedAchievement && (
                                <>
                                    {/* Show the current trophy */}
                                    <Image
                                        source={getBadgeImage(selectedAchievement.category, selectedAchievement.badge)}
                                        style={styles.modalTrophyImage}
                                    />
                                    <Text style={styles.modalCategoryText}>
                                        {selectedAchievement.category.toUpperCase()}
                                    </Text>

                                    {/* Progress bar & text */}
                                    <View style={{ marginHorizontal: 20, width: screenWidth * 0.7 - 80, alignItems: 'center' }}>
                                        <Progress.Bar
                                            progress={getProgress(selectedAchievement.count)}
                                            width={screenWidth * 0.7}
                                            borderWidth={0}
                                            borderRadius={0}
                                            unfilledColor="#EEE"
                                            color="#1E3A8A"
                                            style={styles.modalProgressBar}
                                        />
                                    </View>
                                    <Text style={styles.modalProgressText}>
                                        {getProgressText(selectedAchievement.count)} to next tier
                                    </Text>

                                    {/* Description of how to get it */}
                                    <Text style={styles.modalDescription}>
                                        Check in at a {selectedAchievement.category} to earn this achievement. 5 = Bronze, 10 = Silver, 20 = Gold.
                                    </Text>

                                    {/* Display all available tiers */}
                                    <View style={styles.modalTiersRow}>
                                        <Image
                                            source={getBadgeImage(selectedAchievement.category, 'Bronze')}
                                            style={styles.modalTierIcon}
                                        />
                                        <Image
                                            source={getBadgeImage(selectedAchievement.category, 'Silver')}
                                            style={styles.modalTierIcon}
                                        />
                                        <Image
                                            source={getBadgeImage(selectedAchievement.category, 'Gold')}
                                            style={styles.modalTierIcon}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
            </View>
        </SafeAreaWrapper>
    );
};

export default AchievementsScreen;