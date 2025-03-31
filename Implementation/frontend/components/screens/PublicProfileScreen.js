// PublicProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet, Alert } from 'react-native';
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
                    <Text style={styles.sectionText}>
                        {friendData.bio || "No bio available."}
                    </Text>
                    <Text style={styles.sectionText}>
                        {friendData.location || "Location not provided."}
                    </Text>
                    <Text style={styles.sectionText}>
                        {friendData.languages || "Languages not specified."}
                    </Text>
                    <Text style={styles.sectionText}>
                        {friendData.favoriteDestinations || "Favorite destinations not listed."}
                    </Text>
                </View>

                {/* Fun Facts Section */}
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>Fun Facts</Text>
                    <Text style={styles.sectionText}>
                        {friendData.dreamDestination || "No dream destination provided."}
                    </Text>
                    <Text style={styles.sectionText}>
                        {friendData.travelApp || "No favorite travel app listed."}
                    </Text>
                    <Text style={styles.sectionText}>
                        {friendData.instagram || "Instagram not provided."}
                    </Text>
                </View>

                {/* Travel Behavior Section */}
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>Travel Behavior</Text>
                    <Text style={styles.sectionText}>
                        Packing Style: {friendData.packingStyle || "Not set"}
                    </Text>
                    <Text style={styles.sectionText}>
                        Travel Companion: {friendData.travelCompanion || "Not set"}
                    </Text>
                    <Text style={styles.sectionText}>
                        Budget Range: {friendData.budgetRange || "Not set"}
                    </Text>
                </View>

                {/* Planning Habits Section */}
                <View style={styles.cardContainer}>
                    <Text style={styles.cardHeader}>Planning Habits</Text>
                    <Text style={styles.sectionText}>
                        Planning Habit: {friendData.planningHabit || "Not set"}
                    </Text>
                    <Text style={styles.sectionText}>
                        Trip Role: {friendData.tripRole || "Not set"}
                    </Text>
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
        padding: 20,
        backgroundColor: '#fff',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#fff',
    },
    placeholderImage: {
        backgroundColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 10,
    },
    emailText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 4,
    },
    cardContainer: {
        backgroundColor: '#f9f9f9',
        padding: 16,
        marginBottom: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    cardHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
        color: '#263986',
    },
    sectionText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 4,
    },
});

export default PublicProfileScreen;
