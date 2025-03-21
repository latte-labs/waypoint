// components/StartJourneyBanner.js
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Pressable } from 'react-native';

const StartJourneyBanner = ({ title, subtitle, buttonText, onPress, image }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    return (
    <View style={styles.container}>
      {image && (
        <Image source={image} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <Pressable
            onPressIn={() => {
                Animated.spring(scaleAnim, {
                toValue: 0.95, // Shrinks slightly
                useNativeDriver: true,
                }).start();
            }}
            onPressOut={() => {
                Animated.spring(scaleAnim, {
                toValue: 1, // Returns to normal
                useNativeDriver: true,
                }).start();
            }}
            onPress={onPress} // Your existing navigation action
            >
            <Animated.View style={[styles.button, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </Animated.View>
        </Pressable>

      </View>
    </View>
    );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginVertical: 20,
    backgroundColor: '#F2F2F2',
  },
  image: {
    width: '100%',
    height: 120,
  },
  textContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#222',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default StartJourneyBanner;
