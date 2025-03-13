import React, { useState } from "react";
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

const LocationPermissions = () => {

    const [location, setLocation] = useState(false);
    const [weather, setWeather] = useState(null);

    const getLocation = () => {
        const result = requestLocationPermission();
        result.then(res => {
            console.log('res is: res');
            if (res) {
                Geolocation.getCurrentPosition(
                    position => {
                        console.log(position);
                        setLocation(position);
                        fetchWeather(position.coords.latitude, position.coords.longitude);
                    },
                    error => {
                        console.log(error.code, error.message);
                        setLocation(false);
                    },
                    { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
                );
            }
        });
    };

    const fetchWeather = async (latitude, longitude) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/weather`, {
                params: {
                    latitude, 
                    longitude
                }
            });

            if (response.data.status === "success") {
                setWeather(response.data.data);
            } else {
                console.log ("Error fetching weather: ", response.data.detail);
            }
        }
        catch (err) {
            console.log("Error fetching weather data: ", err)
        }
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
                {/* <Text>Latitude: {location ? location.coords.latitude : null}</Text>     // Check to see your coordinates
            <Text>Longitude: {location ? location.coords.longitude : null}</Text> */}
                <Text>

                </Text>
            </View>
            {/* ✅ TEMPORARY DISPLAY FOR WEATHER INFORMATION */}
            {weather && (
                <View style={styles.weatherContainer}>
                    <Text style={styles.weatherText}>🌡 Temperature: {weather.temperature}°C</Text>
                    <Text style={styles.weatherText}>☁️ Condition: {weather.weather_main}</Text>
                    <Image 
                        source={{ uri: `https://openweathermap.org/img/wn/${weather.weather_icon}@2x.png` }} 
                        style={{ width: 50, height: 50 }}
                    />
                </View>
            )}
            <TouchableOpacity style={styles.allowButton} onPress={(getLocation)}>
                <Text style={styles.buttonText}>Allow</Text>
            </TouchableOpacity>
        </SafeAreaWrapper>
    );
}

export default LocationPermissions;