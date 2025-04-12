// PublicProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, Alert, StatusBar, TouchableOpacity } from 'react-native';
import SafeAreaWrapper from './SafeAreaWrapper';
import { database } from '../../firebase';

const trophyImages = {
    park: {
        Bronze: require('../../assets/achievements/park/bronze_park.png'),
        Silver: require('../../assets/achievements/park/silver_park.jpeg'),
        Gold: require('../../assets/achievements/park/gold_park.jpeg'),
    },
    bar: {
        Bronze: require('../../assets/achievements/bar/bronze_bar.jpeg'),
        Silver: require('../../assets/achievements/bar/silver_bar.png'),
        Gold: require('../../assets/achievements/bar/gold_bar.jpeg'),
    },
    museum: {
        Bronze: require('../../assets/achievements/museum/bronze_museum.jpeg'),
        Silver: require('../../assets/achievements/museum/silver_museum.jpeg'),
        Gold: require('../../assets/achievements/museum/gold_museum.jpeg'),
    },
};

const specialBadges = {
    onboarding: require('../../assets/achievements/badge_onboarding_completed.png'),
};

const ALL_CATEGORIES = ['park', 'bar', 'museum'];

function getBadge(count) {
    if (count >= 20) return 'Gold';
    if (count >= 10) return 'Silver';
    return 'Bronze';
}

function getBadgeImage(category, badge) {
    return trophyImages[category]?.[badge] ?? null;
}

function getBadgeDescription(category) {
    switch (category) {
        case 'onboarding':
            return 'Completed all onboarding tasks.';
        case 'park':
            return 'Check in at parks. 5 = Bronze, 10 = Silver, 20 = Gold.';
        case 'bar':
            return 'Check in at bars. 5 = Bronze, 10 = Silver, 20 = Gold.';
        case 'museum':
            return 'Check in at museums. 5 = Bronze, 10 = Silver, 20 = Gold.';
        default:
            return 'Achievement unlocked.';
    }
}

const PublicProfileScreen = ({ route, navigation }) => {
    const { friendId } = route.params;
    const [friendData, setFriendData] = useState(null);
    const [friendAchievements, setFriendAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadFriendProfileAndAchievements = async () => {
            try {
                const friendRef = database().ref(`/users/${friendId}`);
                const snapshot = await friendRef.once('value');
    
                if (snapshot.exists()) {
                    setFriendData(snapshot.val());
                    await fetchFriendAchievements(); // ✅ Ensure we wait for this to complete too
                } else {
                    Alert.alert("Error", "Friend profile not found.");
                }
            } catch (error) {
                console.error("Error fetching friend data:", error);
                Alert.alert("Error", "Could not load profile.");
            } finally {
                setLoading(false); // ✅ This was missing!
            }
        };
    
        loadFriendProfileAndAchievements();
    }, [friendId]);
    

    const fetchFriendAchievements = async () => {
        try {
            const snapshot = await database().ref(`/game/${friendId}`).once('value');
            const data = snapshot.val() || {};
    
            const results = ALL_CATEGORIES.map((category) => {
                const checkInsObj = data[category] || {};
                const checkInCount = Object.keys(checkInsObj).length;
                return {
                    category,
                    count: checkInCount,
                    badge: getBadge(checkInCount),
                };
            });
    
            const onboardingSnap = await database().ref(`/users/${friendId}/onboarding/onboarding_complete`).once('value');
            if (onboardingSnap.val() === true) {
                results.push({
                    category: 'onboarding',
                    count: 1,
                    badge: 'Completed',
                    isSpecial: true,
                });
            }
    
            // Optional sorting by badge level
            const badgePriority = { Completed: 4, Gold: 3, Silver: 2, Bronze: 1 };
            results.sort((a, b) => (badgePriority[b.badge] || 0) - (badgePriority[a.badge] || 0));
    
            setFriendAchievements(results);
        } catch (err) {
            console.error('Error fetching friend achievements:', err);
        }
    };
    

    if (loading) {
        return (
            <SafeAreaWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                </View>
            </SafeAreaWrapper>
        );
    }

    if (!friendData) {
        return (
            <SafeAreaWrapper>
                <View style={styles.loadingContainer}>
                    <Text>Profile data not available.</Text>
                </View>
            </SafeAreaWrapper>
        );
    }

    return (
        <SafeAreaWrapper>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Profile Header */}
                <View style={styles.headerContainer}>
                    {friendData.profilePhotoUrl ? (
                        <Image
                            source={{ uri: `${friendData.profilePhotoUrl}?ts=${Date.now()}` }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={[styles.profileImage, styles.placeholderImage]}>
                            <Text>No Photo</Text>
                        </View>
                    )}
                    <Text style={styles.name}>{friendData.username || 'User Name'}</Text>
                    <Text style={styles.emailText}>{friendData.email}</Text>
                </View>

                {/* About Section */}
                {(friendData.bio || friendData.location || friendData.languages || friendData.favoriteDestinations) && (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardHeader}>About</Text>

                        {friendData.bio ? (
                            <>
                                <Text style={{ fontWeight: 'bold' }}>Bio / Travel Philosophy</Text>
                                <Text style={styles.sectionText}>{friendData.bio}</Text>
                            </>
                        ) : null}

                        {friendData.location ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Home Country / City</Text>
                                <Text style={styles.sectionText}>{friendData.location}</Text>
                            </>
                        ) : null}

                        {friendData.languages ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Languages Spoken</Text>
                                <Text style={styles.sectionText}>{friendData.languages}</Text>
                            </>
                        ) : null}

                        {friendData.favoriteDestinations ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Top 3 Favorite Destinations</Text>
                                <Text style={styles.sectionText}>{friendData.favoriteDestinations}</Text>
                            </>
                        ) : null}
                    </View>
                )}

                {/* Fun Facts Section */}
                {(friendData.dreamDestination || friendData.travelApp || friendData.instagram) && (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardHeader}>Fun Facts</Text>

                        {friendData.dreamDestination ? (
                            <>
                                <Text style={{ fontWeight: 'bold' }}>Dream Destination</Text>
                                <Text style={styles.sectionText}>{friendData.dreamDestination}</Text>
                            </>
                        ) : null}

                        {friendData.travelApp ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Favorite Travel App</Text>
                                <Text style={styles.sectionText}>{friendData.travelApp}</Text>
                            </>
                        ) : null}

                        {friendData.instagram ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Instagram Handle</Text>
                                <Text style={styles.sectionText}>{friendData.instagram}</Text>
                            </>
                        ) : null}
                    </View>
                )}

                {/* Travel Behavior Section */}
                {(friendData.packingStyle || friendData.travelCompanion || friendData.budgetRange) && (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardHeader}>Travel Behavior</Text>

                        {friendData.packingStyle ? (
                            <>
                                <Text style={{ fontWeight: 'bold' }}>Packing Style</Text>
                                <Text style={styles.sectionText}>{friendData.packingStyle}</Text>
                            </>
                        ) : null}

                        {friendData.travelCompanion ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Travel Companion</Text>
                                <Text style={styles.sectionText}>{friendData.travelCompanion}</Text>
                            </>
                        ) : null}

                        {friendData.budgetRange ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Budget Range</Text>
                                <Text style={styles.sectionText}>{friendData.budgetRange}</Text>
                            </>
                        ) : null}
                    </View>
                )}

                {/* Planning Habits Section */}
                {(friendData.planningHabit || friendData.tripRole) && (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardHeader}>Planning Habits</Text>

                        {friendData.planningHabit ? (
                            <>
                                <Text style={{ fontWeight: 'bold' }}>Planning Habit</Text>
                                <Text style={styles.sectionText}>{friendData.planningHabit}</Text>
                            </>
                        ) : null}

                        {friendData.tripRole ? (
                            <>
                                <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Trip Role</Text>
                                <Text style={styles.sectionText}>{friendData.tripRole}</Text>
                            </>
                        ) : null}
                    </View>
                )}

                {friendAchievements.filter(item => item.isSpecial || item.count >= 5).length > 0 && (
                    <View style={styles.cardContainer}>
                        <Text style={styles.cardHeader}>Achievements</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingRight: 8 }}>
                            {friendAchievements
                                .filter(item => item.isSpecial || item.count >= 5) // ✅ show only earned badges
                                .map((item) => {
                                const imageSource = item.isSpecial
                                    ? specialBadges.onboarding
                                    : getBadgeImage(item.category, item.badge);

                                return (
                                    <TouchableOpacity
                                    key={item.category}
                                    onPress={() =>
                                        Alert.alert(
                                        item.category === 'onboarding' ? 'Onboarding Badge' : `${item.category.toUpperCase()} Badge`,
                                        getBadgeDescription(item.category)
                                        )
                                    }
                                    activeOpacity={0.7}
                                    >
                                    <View style={{ alignItems: 'center', width: 70, marginRight: 12 }}>
                                        <Image
                                        source={imageSource}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            resizeMode: 'contain',
                                        }}
                                        />
                                        <Text style={{ fontSize: 12, color: '#444', textAlign: 'center', marginTop: 4 }}>
                                        {item.category === 'onboarding' ? 'Onboarding' : item.category.toUpperCase()}
                                        </Text>
                                    </View>
                                    </TouchableOpacity>
                                );
                                })}
                            </ScrollView>
                    </View>
                )}
            </ScrollView>
        </SafeAreaWrapper>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    headerContainer: {
        marginTop: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    placeholderImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: 'white',
    },
    profileImageWrapper: {
        position: 'absolute',
        top: 70,
        zIndex: 2,
        borderRadius: 70,
        borderWidth: 2,
        borderColor: '#f9f9f9',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    placeholderImage: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    emailText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 4,
    },
    cardContainer: {
        backgroundColor: '#f9f9f9',
        padding: 18,
        marginHorizontal: 0,
        marginVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderLeftWidth: 5,
        borderLeftColor: '#263986',
        borderColor: '#eee',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    cardHeader: {
        fontSize: 16,
        fontWeight: '700',
        color: '#263986',
        borderBottomWidth: 2,
        borderBottomColor: '#d0d8ff',
        paddingBottom: 6,
        marginBottom: 16,
    },
    sectionText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
        marginTop: 6,
    },
    cardContainer: {
        backgroundColor: '#f9f9f9',
        padding: 18,
        marginHorizontal: 0,
        marginVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderLeftWidth: 5,
        borderLeftColor: '#263986',
        borderColor: '#eee',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        overflow: 'hidden',
    }
    
});

export default PublicProfileScreen;
