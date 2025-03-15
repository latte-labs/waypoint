import React, { useState, useEffect } from "react";
import { Text, View, FlatList, ActivityIndicator } from "react-native";
import styles from "../../styles/EventsScreenStyles";
import SafeAreaWrapper from "./SafeAreaWrapper";
import axios from "axios";
import Geolocation from 'react-native-geolocation-service';
import API_BASE_URL from "../../config";

const EventsScreen = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    fetchEvents = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/events`, {
                params: { latitude, longitude }
            });
            setEvents(response.data);
        } catch (err) {
            console.error("Error fetching events: ", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchEvents(latitude, longitude);
            },
            err => {
                console.error("Error obtaining location", err);
                setError(err);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    if (loading) {
        return (
            <SafeAreaWrapper>
                <ActivityIndicator size={"large"} />
                <Text>Loading events...</Text>
            </SafeAreaWrapper>
        );
    }


    return (
        <>
            <SafeAreaWrapper>
                <View styles={styles.container}>
                    <Text style={styles.title}>EVENTS</Text>
                </View>
                <FlatList
                    data={events}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.cardLayout}>
                            <View style={styles.eventDetailsContainer}>
                                <Text style={styles.eventDay}>{item.day}</Text>
                                <Text style={styles.eventDate}>{item.date}</Text>
                                <Text style={styles.eventMonth}>{item.month}</Text>
                            </View>
                            <View style={styles.eventNameContainer}>
                                <Text style={styles.eventTitle}>{item.title}</Text>
                            </View>
                        </View>
                    )}
                />
                {/** ITEM 1 */}
                {/* <View style={styles.cardLayout}>
                    <View style={styles.eventDetailsContainer}> 
                        <Text style={styles.eventDay}>Saturday</Text>
                        <Text style={styles.eventDate}>12</Text>
                        <Text style={styles.eventMonth}>September</Text>
                    </View>
                    <View style={styles.eventNameContainer}>
                    <   Text style={styles.eventTitle}>Event Title: Beyonce</Text>
                    </View>
                </View> */}
                {/** ITEM 2 */}
                {/* <View style={styles.cardLayout}>
                    <View style={styles.eventDetailsContainer}> 
                        <Text style={styles.eventDay}>Saturday</Text>
                        <Text style={styles.eventDate}>12</Text>
                        <Text style={styles.eventMonth}>September</Text>
                    </View>
                    <View style={styles.eventNameContainer}>
                        <Text style={styles.eventTitle}>Event Title: Beyonce</Text>
                    </View>
                </View> */}
            </SafeAreaWrapper>
        </>
    )
}

export default EventsScreen;