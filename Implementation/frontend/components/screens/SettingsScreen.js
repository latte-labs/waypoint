// components/screens/SettingsScreen.js
import React, { useEffect, useState } from 'react';
import { 
    View, Text, Button, Switch, StyleSheet, SafeAreaView, Platform, 
    StatusBar, KeyboardAvoidingView, ActivityIndicator, Alert 
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { database } from '../../firebase';
import API_BASE_URL from '../../config';

const SettingsScreen = ({ navigation }) => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [travelStyle, setTravelStyle] = useState(null);
    const [language, setLanguage] = useState('English');
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [openTravelStyle, setOpenTravelStyle] = useState(false);
    const [openLanguage, setOpenLanguage] = useState(false);

    const travelStyles = [
        { label: 'Adventure', value: 2 },
        { label: 'Relaxation', value: 1 },
        { label: 'Cultural', value: 3 },
        { label: 'Undefined', value: 4 }  // ✅ Includes "Undefined" option
    ];

    const languages = [
        { label: 'English', value: 'English' },
        { label: 'Spanish', value: 'Spanish' },
        { label: 'French', value: 'French' }
    ];

    // ✅ Load User Preferences from AsyncStorage on Screen Load
    useEffect(() => {
        const fetchUserPreferences = async () => {
            try {
                console.log("🔄 Loading user data from AsyncStorage...");
                const storedUser = await AsyncStorage.getItem('user');

                if (!storedUser) {
                    console.error("❌ User not found in AsyncStorage!");
                    setLoading(false);
                    return;
                }

                const userData = JSON.parse(storedUser);
                setUserId(String(userData.id));  // ✅ Ensure UUID format
                setTravelStyle(userData.travel_style_id);

                console.log("📥 Loaded Travel Style ID:", userData.travel_style_id);
            } catch (error) {
                console.error("❌ Error loading AsyncStorage:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPreferences();
    }, []);

    // ✅ Handle Travel Style Change & Update Across AsyncStorage, PostgreSQL, and Firebase
    const updateTravelStyle = async (newStyle) => {
        console.log(`🔄 Updating travel style to: ${newStyle}`);
        setTravelStyle(newStyle);

        try {
            if (!userId) {
                console.error("❌ User ID not found, cannot update travel style!");
                return;
            }

            const travelStyleId = Number(newStyle);
            if (isNaN(travelStyleId)) {
                console.error("❌ Invalid travel_style_id:", newStyle);
                return;
            }

            // ✅ Update PostgreSQL (FastAPI)
            await axios.put(`${API_BASE_URL}/users/${String(userId)}/travel_style`, {
                travel_style_id: travelStyleId
            });

            console.log("✅ Travel style updated in PostgreSQL!");

            // ✅ Update Firebase
            const userRef = database().ref(`/users/${userId}`);
            await userRef.update({ travel_style_id: travelStyleId });

            console.log("✅ Travel style updated in Firebase!");

            // ✅ Update AsyncStorage
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                let userData = JSON.parse(storedUser);
                userData.travel_style_id = travelStyleId;
                await AsyncStorage.setItem('user', JSON.stringify(userData));
            }

            Alert.alert("Success", "Your travel style has been updated!");
        } catch (error) {
            console.error("❌ Error updating travel style:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to update travel style. Please try again.");
        }
    };

    // ✅ Handle Language Change
    const updateLanguage = async (newLanguage) => {
        console.log(`🔄 Updating language to: ${newLanguage}`);
        setLanguage(newLanguage);

        try {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);

                // ✅ Preserve travel style while updating language
                const updatedUser = { ...userData, language: newLanguage };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                console.log("✅ Language updated in AsyncStorage.");
            }
        } catch (error) {
            console.error("❌ Error updating language:", error.message);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardContainer}>
                <Text style={styles.title}>Settings</Text>

                {/* Travel Style Selection */}
                <View style={[styles.dropdownWrapper, { zIndex: 3000 }]}>
                    <Text style={styles.label}>Travel Style:</Text>
                    <DropDownPicker
                      open={openTravelStyle}
                      value={travelStyle}
                      items={travelStyles}
                      setOpen={setOpenTravelStyle}
                      setValue={setTravelStyle}
                      onSelectItem={(item) => updateTravelStyle(item.value)}  // ✅ Fires ONLY when user selects an option
                      containerStyle={styles.dropdownContainer}
                      dropDownContainerStyle={styles.dropdown}
                      style={styles.dropdownPicker}
                      zIndex={3000}
                      modalProps={{ animationType: 'fade' }}
                      removeClippedSubviews={false}
                  />

                </View>

                {/* Language Selection */}
                <View style={[styles.dropdownWrapper, { zIndex: 2000 }]}>
                    <Text style={styles.label}>Language:</Text>
                    <DropDownPicker
                        open={openLanguage}
                        value={language}
                        items={languages}
                        setOpen={setOpenLanguage}
                        setValue={setLanguage}
                        onChangeValue={updateLanguage}
                        containerStyle={styles.dropdownContainer}
                        dropDownContainerStyle={styles.dropdown}
                        style={styles.dropdownPicker}
                        zIndex={2000}
                        modalProps={{ animationType: 'fade' }}
                        removeClippedSubviews={false}
                    />
                </View>

                {/* Notifications Toggle */}
                <View style={styles.row}>
                    <Text style={styles.label}>Enable Notifications:</Text>
                    <Switch value={notificationsEnabled} onValueChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                </View>

                {/* Navigation Buttons */}
                <Button title="Go Back to Profile" onPress={() => navigation.navigate('Profile')} />
                <Button title="Log Out" onPress={() => navigation.replace('Login')} />
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 50 },
    keyboardContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
    row: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    dropdownWrapper: { width: '100%', marginBottom: 20 },
    dropdownContainer: { width: '100%' },
    dropdown: { backgroundColor: '#fafafa', elevation: 5 },
    dropdownPicker: { borderColor: '#ccc' },
});

export default SettingsScreen;
