import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import SafeAreaWrapper from "../SafeAreaWrapper";
import styles from "../../../styles/LocationPermissionsStyle";

const LocationPermissions = () => {


    return (
        <SafeAreaWrapper>
            <Image source={require("../../../assets/images/logo.png")} style={styles.image} />
            <View style={styles.titleContainer}>
                <Text style={styles.textTitle}>Enable Geolocation</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>By allowing geolocation, you are able to enjoy more features with WayPoint</Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={() => alert('Feature coming soon')}>
                <Text style={styles.buttonText}>Allow</Text>
            </TouchableOpacity>
        </SafeAreaWrapper>
    );
}

export default LocationPermissions;