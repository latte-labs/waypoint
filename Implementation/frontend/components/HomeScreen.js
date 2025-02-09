import React from 'react';
import { useState } from 'react';
import {
    Text,
    ScrollView,
    View,
    TextInput,
    FlatList,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

import styles from '../styles/HomeScreenStyle';

const { width } = Dimensions.get('window');

function HomeScreen() {

    const [searchQuery, setSearchQuery] = useState('');
    const [trips, setTrips] = useState([
        { id: '1', tripName: 'Hiking Trip in Vancouver', date: 'March 20, 2025' },
        { id: '2', tripName: 'Staycation on Bowen Island', date: 'April 16, 2025' },
        { id: '3', tripName: 'Cafe Hopping', date: 'April 25, 2025' },
    ])

    const renderItem = ({ item }) => (
        <View style={[styles.card, { width: width * 0.8, marginHorizontal: 10 }]}>
            <Text style={styles.tripName}>{item.tripName}</Text>
            {item.date ? <Text style={styles.date}>{item.date}</Text> : null}
        </View>
    );

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container} >
                <TextInput
                    style={styles.searchbar}
                    placeholder='Search...'
                    value={searchQuery}
                    onChangeText={(text) => setSearchQuery(text)}
                />
                <View style={styles.myTrips}>
                    <Text style={styles.myTripsTitle}>My Trips</Text>
                    {trips.length > 0 ? (
                        <FlatList
                            data={trips}
                            renderItem={renderItem}
                            keyExtractor={(item) => item.id}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingLeft: 0, paddingRight: 0 }}
                        />
                    ) : (
                        <View style={[styles.card, { width: width * 0.8, marginHorizontal: 10 }]}>
                            <Text style={styles.tripName}>No upcoming trips</Text>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
}

export default HomeScreen;