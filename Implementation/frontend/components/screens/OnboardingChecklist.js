// components/OnboardingChecklist.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome5';
import HomeScreenStyles from '../../styles/HomeScreenStyle';
import API_BASE_URL from '../../config';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  useAnimatedRef,
  measure,
  runOnUI,
  runOnJS
} from 'react-native-reanimated';


const OnboardingChecklist = ({ userId, onComplete, refreshTrigger, onWeatherNudge }) => {
  const navigation = useNavigation();
  const [progress, setProgress] = useState({
    quiz: false,
    itinerary: false,
    chatbot: false,
    weatherChecked: false,
  });
  const [showRewardModal, setShowRewardModal] = useState(false);
  const badgeScale = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);
  const badgeRotation = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const contentRef = useAnimatedRef();
  const [expanded, setExpanded] = useState(true);
  const [measuredHeight, setMeasuredHeight] = useState(0);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: contentHeight.value,
    overflow: 'hidden',
  }));
  


  useEffect(() => {
    if (showRewardModal) {
      badgeScale.value = 0;
      badgeOpacity.value = 0;
      badgeRotation.value = 0;

      // Show scale and fade in
      badgeScale.value = withSpring(1, { damping: 8, stiffness: 150 });
      badgeOpacity.value = withSpring(1);

      // Spin fast and slow down
      badgeRotation.value = withTiming(720, {
        duration: 1500, // 2 full spins over 1.5s
        easing: Easing.out(Easing.exp), // built-in easing
      });
    }
  }, [showRewardModal]);

  useEffect(() => {
    if (!expanded) {
      // Always collapse instantly, even if height not yet measured
      contentHeight.value = withTiming(0, { duration: 300 });
    } else if (measuredHeight > 0) {
      // Only expand if we have a measured height
      contentHeight.value = withTiming(measuredHeight, { duration: 300 });
    }
  }, [expanded, measuredHeight]);
  


  useFocusEffect(
    useCallback(() => {
      const fetchChecklistStatus = async () => {
        if (!userId) return;

        try {
          const [travelStyleSnap, itinerariesRes, chatbotSnap, weatherChangedSnap, packingTipSnap, checkedInSnap, achievementsSnap] = await Promise.all([
            database().ref(`/users/${userId}/travel_style_id`).once('value'),
            fetch(`${API_BASE_URL}/itineraries/users/${userId}/itineraries`),
            database().ref(`/users/${userId}/onboarding/used_chat`).once('value'),
            database().ref(`/users/${userId}/onboarding/weather_changed`).once('value'),
            database().ref(`/users/${userId}/onboarding/packing_tip_viewed`).once('value'),
            database().ref(`/users/${userId}/onboarding/checked_in`).once('value'),
            database().ref(`/users/${userId}/onboarding/viewed_achievements`).once('value'),
          ]);

          const travelStyleId = travelStyleSnap.val();
          const quizDone = travelStyleId && travelStyleId !== 4;
          const itineraries = await itinerariesRes.json();
          const hasItinerary = itineraries.length > 0;
          const chatbotUsed = chatbotSnap.val() === true;
          const weatherChecked = weatherChangedSnap.val() === true && packingTipSnap.val() === true;
          const checkedIn = checkedInSnap.val() === true;
          const achievementsViewed = achievementsSnap.val() === true;

          setProgress({
            quiz: quizDone,
            itinerary: hasItinerary,
            chatbot: chatbotUsed,
            weatherChecked,
            checkedIn,
            achievementsViewed,
          });
          
          // Trigger layout remeasure after a frame
          setTimeout(() => {
            if (expanded) updateHeight();
          }, 100);
          
        } catch (err) {
          console.error('Checklist fetch error:', err);
        }
      };

      fetchChecklistStatus();
    }, [userId, refreshTrigger])
  );

  const checklistItems = [
    { key: 'quiz', label: 'Take Travel Style Quiz', action: () => navigation.navigate('QuizScreen') },
    { key: 'itinerary', label: 'Create Your First Itinerary', action: () => navigation.navigate('Itinerary') },
    { key: 'chatbot', label: 'Use Chatbot', action: () => navigation.navigate('Chatbot') },
    { key: 'weatherChecked', label: 'Check Weather Widget', action: () => onWeatherNudge?.() },
    { key: 'checkedIn', label: 'Check In to a Place', action: () => navigation.navigate('CheckIn') },
    { key: 'achievementsViewed', label: 'View Achievements', action: () => navigation.navigate('Badges') },
  ];


  const completedCount = Object.values(progress).filter(Boolean).length;
  const updateHeight = () => {
    runOnUI(() => {
      'worklet';
      const measured = measure(contentRef);
      if (measured) {
        contentHeight.value = withTiming(measured.height, { duration: 300 });
      }
    })();
  };
  const animatedBadgeStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: badgeScale.value },
        { rotate: `${badgeRotation.value}deg` },
      ],
      opacity: badgeOpacity.value,
    };
  });
  
  return (
    <View style={[HomeScreenStyles.card, { marginTop: 2, padding: 6, marginBottom: -2 }]}>
      <TouchableOpacity
        onPress={() => {
          setExpanded((prev) => !prev);
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text style={[HomeScreenStyles.titleText]}>Get Started with WayPoint</Text>
        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color="#6B7280"
        />
      </TouchableOpacity>

      <Animated.View style={animatedContainerStyle}>
      <View
        ref={contentRef}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          if (height > 0) {
            setMeasuredHeight(height);
          }
        }}
        
      >

    {/* Checklist items */}
    {checklistItems.map((item, index) => (
      <TouchableOpacity
        key={item.key}
        onPress={item.action}
        disabled={progress[item.key]}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: index === 0 ? 12 : 4,  
          marginVertical: 4,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: !progress[item.key] ? '#F9FAFB' : 'transparent',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            name={progress[item.key] ? 'check-circle' : 'circle'}
            solid
            size={16}
            color={progress[item.key] ? '#10B981' : '#9CA3AF'}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: progress[item.key] ? '#10B981' : '#374151',
              fontWeight: progress[item.key] ? '500' : '400',
            }}
          >
            {item.label}
          </Text>
        </View>

        {!progress[item.key] && (
          <Icon
            name="chevron-right"
            size={12}
            color="#9CA3AF"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    ))}

    <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
      {completedCount} of {checklistItems.length} tasks completed
    </Text>
  </View>
</Animated.View>
{completedCount === checklistItems.length && (
  <TouchableOpacity
    onPress={() => setShowRewardModal(true)}
    style={{
      backgroundColor: '#F59E0B',
      paddingVertical: 10,
      borderRadius: 10,
      marginTop: 12,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: 'white', fontWeight: 'bold' }}>🎉 Claim Your Reward!</Text>
  </TouchableOpacity>
)}


      <View
        style={{ position: 'absolute', opacity: 0, zIndex: -1 }}
        onLayout={(event) => {
          // Exclude reward button if not all tasks are complete
          const { height } = event.nativeEvent.layout;
          const rewardHeight = completedCount === checklistItems.length ? 52 : 0;
          setMeasuredHeight(height - rewardHeight);
        }}
      >

        <View>
          {checklistItems.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={item.action}
              disabled={progress[item.key]}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
            >
              <Icon
                name={progress[item.key] ? 'check-circle' : 'circle'}
                solid
                size={16}
                color={progress[item.key] ? '#10B981' : '#9CA3AF'}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: progress[item.key] ? '#10B981' : '#374151' }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>
            {completedCount} of {checklistItems.length} tasks completed
          </Text>
          {completedCount === checklistItems.length && (
            <TouchableOpacity
              style={{
                backgroundColor: '#F59E0B',
                paddingVertical: 10,
                borderRadius: 10,
                marginTop: 12,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>🎉 Claim Your Reward!</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>


      <Modal
        visible={showRewardModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Way to go! 🥳</Text>
            <Animated.Image
              source={require('../../assets/achievements/badge_onboarding_completed.png')}
              style={[{ width: 120, height: 120, marginBottom: 16 }, animatedBadgeStyle]}
              resizeMode="contain"
            />
            <Text style={{ textAlign: 'center', marginBottom: 20 }}>
              You're officially part of the WayPoint Crew.{'\n'}
              You can view this badge in "Achievements".
            </Text>


            <TouchableOpacity
              onPress={async () => {
                if (userId) {
                  try {
                    await database()
                      .ref(`/users/${userId}/onboarding/onboarding_complete`)
                      .set(true);
                    if (onComplete) onComplete();
                  } catch (err) {
                    console.error('Error setting onboarding_complete:', err);
                  }
                }
                setShowRewardModal(false);
              }}
              style={{
                backgroundColor: '#F59E0B', // matches "Claim" button
                paddingVertical: 10,
                paddingHorizontal: 24,
                borderRadius: 10,
                marginTop: 8,
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>
                🎉 Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


    </View>
  );
};

export default OnboardingChecklist;
