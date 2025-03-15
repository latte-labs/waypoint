import React from "react";
import { Text, View, FlatList } from "react-native";
import styles from "../../styles/EventsScreenStyles";
import SafeAreaWrapper from "./SafeAreaWrapper";

const EventsScreen = () => {

    return (
        <>
            <SafeAreaWrapper>
                <View styles={styles.container}>
                    <Text style={styles.title}>EVENTS</Text>
                </View>
                {/** ITEM 1 */}
                <View style={styles.cardLayout}>
                    <View style={styles.eventDetailsContainer}> 
                        <Text style={styles.eventDay}>Saturday</Text>
                        <Text style={styles.eventDate}>12</Text>
                        <Text style={styles.eventMonth}>September</Text>
                    </View>
                    <View style={styles.eventNameContainer}>
                    <   Text style={styles.eventTitle}>Event Title: Beyonce</Text>
                    </View>
                </View>
                {/** ITEM 2 */}
                <View style={styles.cardLayout}>
                    <View style={styles.eventDetailsContainer}> 
                        <Text style={styles.eventDay}>Saturday</Text>
                        <Text style={styles.eventDate}>12</Text>
                        <Text style={styles.eventMonth}>September</Text>
                    </View>
                    <View style={styles.eventNameContainer}>
                        <Text style={styles.eventTitle}>Event Title: Beyonce</Text>
                    </View>
                </View>
            </SafeAreaWrapper>
        </>
    )
}

export default EventsScreen;