import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import SafeAreaWrapper from "../SafeAreaWrapper";
import styles from "../../../styles/LocationPermissionsStyle";
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions'
import Geolocation from 'react-native-geolocation-service';
import API_BASE_URL from "../../../config";
import { OPENWEATHERMAPS_API_KEY } from '@env';
import axios from "axios";

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

const LocationPermissions = ({ onLocationGranted }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [location, setLocation] = useState(false);

    // check permission on mount
    useEffect(() => {
        const verifyPermission = async () => {
            const result = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            if (result === RESULTS.GRANTED) {
                setHasPermission(true);
                // Optionally, fetch location immediately
                Geolocation.getCurrentPosition(
                    position => {
                        console.log("Auto-fetch location:", position);
                        setLocation(position.coords);
                        onLocationGranted(position.coords);
                    },
                    error => {
                        console.log(error.code, error.message);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
                );
            }
        };

        verifyPermission();
    }, []);

    const getLocation = async () => {
        const permissionGranted = await requestLocationPermission();

        if (!permissionGranted) {
            console.log("Location permissions not accepted");
            return;
        }

        Geolocation.getCurrentPosition(
            position => {
                console.log(position);
                setHasPermission(true);
                setLocation(position.coords);
                onLocationGranted(position.coords);
            },
            error => {
                console.log(error.code, error.message);
                setLocation(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
    };

    // If permission is already granted, do not show this screen again
    if (hasPermission) return null;

    return (
        <SafeAreaWrapper>
            <Image source={require("../../../assets/images/logo.png")} style={styles.image} />
            <View style={styles.titleContainer}>
                <Text style={styles.textTitle}>Enable Geolocation</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.text}>By allowing geolocation, you are able to enjoy more features with WayPoint</Text>
            </View>
            <TouchableOpacity style={styles.allowButton} onPress={(getLocation)}>
                <Text style={styles.buttonText}>Allow</Text>
            </TouchableOpacity>
        </SafeAreaWrapper>
    );
}

export default LocationPermissions