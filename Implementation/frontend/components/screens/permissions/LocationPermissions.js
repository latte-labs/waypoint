import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import SafeAreaWrapper from "../SafeAreaWrapper";
import styles from "../../../styles/LocationPermissionsStyle";
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions'
import Geolocation from 'react-native-geolocation-service';

const requestLocationPermission = async () => {
    
    try {
        const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        console.log('iOS permission result: ', permission);
        return permission === RESULTS.GRANTED;
    } catch (err) {
        console.log("Error requesting location permission: ", err);
        return false;
    }
}

const LocationPermissions = () => {

    const [location, setLocation] = useState(false);

    const getLocation = () => {
        const result = requestLocationPermission();
        result.then(res => {
            console.log('res is: res');
            if (res) {
                Geolocation.getCurrentPosition(
                    position => {
                        console.log(position);
                        setLocation(position);
                    },
                    error => {
                        console.log(error.code, error.message);
                        setLocation(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            }
        });
        console.log(location);
    }

    return (
        <SafeAreaWrapper>
            <Image source={require("../../../assets/images/logo.png")} style={styles.image} />
            <View style={styles.titleContainer}>
                <Text style={styles.textTitle}>Enable Geolocation</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>By allowing geolocation, you are able to enjoy more features with WayPoint</Text>
            </View>
            <View>
            <Text>Latitude: {location ? location.coords.latitude : null}</Text>
            <Text>Longitude: {location ? location.coords.longitude : null}</Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={(getLocation)}>
                <Text style={styles.buttonText}>Allow</Text>
            </TouchableOpacity>
        </SafeAreaWrapper>
    );
}

export default LocationPermissions;