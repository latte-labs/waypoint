// components/FeatureCarousel.js
import React, { useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ImageBackground, useWindowDimensions, TouchableOpacity } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


const features = [
    {
      id: '1',
      title: 'Plan with Friends',
      desc: 'Build trips together',
      icon: 'user-friends',
      image: require('../../assets/images/card_plan.jpg'),
    },
    {
      id: '2',
      title: 'AI Travel Assistant',
      desc: 'Smart travel advice, 24/7',
      icon: 'robot',
      image: require('../../assets/images/card_chatbot.jpg'),
    },
    {
      id: '3',
      title: 'Earn Badges',
      desc: 'Gamify your journey',
      icon: 'award',
      image: require('../../assets/images/card_badge.jpg'),
    },
    {
      id: '4',
      title: 'Interactive Map',
      desc: 'Explore on a live map',
      icon: 'map',
      image: require('../../assets/images/card_map.jpg'),
    },
    {
      id: '5',
      title: 'Personalized Recos',
      desc: 'Places just for your style',
      icon: 'map-marked-alt',
      image: require('../../assets/images/card_personalized.jpg'),
    },
];
  
const FeatureCarousel = () => {
    const { width } = useWindowDimensions();
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const onScroll = (event) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(offsetX / width);
        setCurrentIndex(newIndex);
    };
    const flatListRef = useRef(null);


    return (
    <View style={styles.container}>
        <FlatList
            ref={flatListRef}
            data={features}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            snapToInterval={width}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
                <ImageBackground
                source={item.image}
                style={[styles.card, { width }]}
                imageStyle={{ borderRadius: 20 }}
                resizeMode="cover"
                >
                <View style={styles.overlay}>
                    <FontAwesome5 name={item.icon} size={30} color="#fff" style={styles.icon} />
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.desc}>{item.desc}</Text>
                </View>
                </ImageBackground>
            )}
            onScroll={onScroll}
            scrollEventThrottle={16}
        />
        <View style={styles.pagination}>
        {features.map((_, index) => (
            <TouchableOpacity
            key={index}
            onPress={() => {
                flatListRef.current.scrollToIndex({ index, animated: true });
                setCurrentIndex(index); // optional, keeps state in sync immediately
            }}
            activeOpacity={0.7}
            >
            <View
                style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
                ]}
            />
            </TouchableOpacity>
        ))}
        </View>


    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      marginTop: 20,
    },
    card: {
        height: 180,
        borderRadius: 20,
    },
    overlay: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'center',
    },
    icon: {
      marginBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    desc: {
      fontSize: 14,
      color: '#eee',
      marginTop: 4,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },      
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
        marginHorizontal: 4,
    },      
    activeDot: {
        backgroundColor: '#333',
        width: 10,
        height: 10,
    },
      
});
  
export default FeatureCarousel;
