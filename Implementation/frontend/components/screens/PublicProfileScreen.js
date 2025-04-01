// PublicProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, Alert, StatusBar } from 'react-native';
import SafeAreaWrapper from './SafeAreaWrapper';
import { database } from '../../firebase';

const PublicProfileScreen = ({ route, navigation }) => {
    const { friendId } = route.params;
    const [friendData, setFriendData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const friendRef = database().ref(`/users/${friendId}`);
        friendRef.once('value')
            .then(snapshot => {
                if (snapshot.exists()) {
                    setFriendData(snapshot.val());
                } else {
                    Alert.alert("Error", "Friend profile not found.");
                }
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching friend data:", error);
                Alert.alert("Error", "Could not load profile.");
                setLoading(false);
            });
    }, [friendId]);

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


                {/* Fun Facts Section */}
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


                {/* Travel Behavior Section */}
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


                {/* Planning Habits Section */}
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
});

export default PublicProfileScreen;
