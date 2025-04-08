import React, { useState, useEffect, useRef } from 'react';
import {
  Text,
  Pressable,
  View,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { database } from '../../firebase';
import styles from '../../styles/QuizScreenStyles';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ConfettiCannon from 'react-native-confetti-cannon';

const questions = [
  {
    question: "What is your preferred travel pace?",
    options: [
      "Relaxing and slow-paced",
      "Balanced mix of exploration and relaxation",
      "Active and full of adventure",
      "None of the above"]
  },
  {
    question: "What is your ideal accomodation choice?",
    options: [
      "Beachfront resort/spa treatment",
      "Boutique hotel in a historic district",
      "Campsite or adventure lodge",
      "None of the above"]
  },
  {
    question: "What sounds the most exciting to you?",
    options: [
      "Unwinding with scenic views and minimal plans",
      "Exploring museums, culture, and historical sites",
      "Hiking, water sports, or outdoor activities",
      "None of the above"]
  },
  {
    question: "What is your preference in food experience?",
    options: [
      "Fine dining with scenic ambiance",
      "Local street foot and cultural experiences",
      "Outdoor cooking or unique survival experiences",
      "None of the above"]
  },
  {
    question: "How do you spend a free day while travelling?",
    options: [
      "Spa, beach, or just relaxing",
      "Exploring cultural sites and local neighbourhoods",
      "Doing extreme activities (skydiving, rafting, etc.)",
      "None of the above"]
  },
  {
    question: "What is your preferred mode of exploration?",
    options: [
      "Leisurely walks or private transport",
      "Guided cultural tours or self-guided exploration",
      "Trekking, cycling, or adventure-packed excursions",
      "None of the above"]
  },
  {
    question: "How would you like to remember your trips by?",
    options: [
      "Relaxation-focused souvenirs (spa oils, beach decor)",
      "Art, local crafts, or historical books",
      "Gear, sports souvenirs, or thrill-based mementos",
      "None of the above"]
  },
];



function QuizScreen() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const resultOpacity = useSharedValue(0);
  const resultFadeIn = useAnimatedStyle(() => ({
    opacity: resultOpacity.value,
  }));

  const [selectedAnswers, setSelectedAnswers] = useState(Array(questions.length).fill(null));
  const [scores, setScores] = useState({ relaxation: 0, culture: 0, adventure: 0, none: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [travelStyle, setTravelStyle] = useState({ emoji: '', name: '', description: '' });
  const navigation = useNavigation();
  const animatedScalesRef = useRef(
    questions.map(() => Array(4).fill().map(() => useSharedValue(1)))
  ).current;
  
  const animatedStylesRef = questions.map((_, qIdx) =>
    Array(4)
      .fill()
      .map((_, optIdx) =>
        useAnimatedStyle(() => ({
          transform: [{ scale: animatedScalesRef[qIdx][optIdx].value }],
        }))
      )
  );
  
  
  const loadQuizProgress = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;
  
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const parsedUser = JSON.parse(userJson);
        if (parsedUser.name) {
          setUserName(parsedUser.name);
          console.log("👤 Loaded user name:", parsedUser.name);
        }
      }
  
      const snapshot = await database().ref(`/Realtime_Quiz_Progress/${userId}`).once('value');
      const data = snapshot.val();
  
      if (data && data.current_question && data.selected_answers && data.scores) {
        setHasSavedProgress(true);
        setShowResumePrompt(true);
      }
    } catch (error) {
      console.error("❌ Failed to load quiz progress or username:", error.message);
    }
  };
  
  const resumeSavedQuiz = async () => {
    const userId = await getUserId();
    if (!userId) return;
  
    const snapshot = await database().ref(`/Realtime_Quiz_Progress/${userId}`).once('value');
    const data = snapshot.val();
  
    if (data) {
      setCurrentQuestionIndex(data.current_question - 1);
      setSelectedAnswers(data.selected_answers);
      setScores(data.scores);
      setShowResumePrompt(false);
    }
  };
  const startNewQuiz = async () => {
    const userId = await getUserId();
    if (!userId) return;
  
    await database().ref(`/Realtime_Quiz_Progress/${userId}`).remove();
  
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setScores({ relaxation: 0, culture: 0, adventure: 0, none: 0 });
    setShowResumePrompt(false);
  };
  
  
  const getUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      console.log("📥 Retrieved User ID from AsyncStorage:", userId); // ✅ Debugging log
      if (!userId) {
        console.error("❌ No user ID found in AsyncStorage!");
      }
      return userId;
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      return null;
    }
  };
  const updateQuizProgress = async (userId, currentQuestionIndex) => {
    try {
      const progressPercentage = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
      await database().ref(`/Realtime_Quiz_Progress/${userId}`).set({
        progress: progressPercentage,
        current_question: currentQuestionIndex + 1,
        selected_answers: selectedAnswers,
        scores: scores,
      });      
      console.log(`✅ Quiz progress updated for ${userId}: ${progressPercentage}% (Question ${currentQuestionIndex + 1})`);
    } catch (error) {
      console.error("❌ Error updating quiz progress in Firebase:", error);
    }
  };

  const sendResultToBackend = async (userId, travelStyle) => {
    try {
        console.log("📤 Sending Quiz Result:", { userId, travelStyle });

        // ✅ Determine travel style ID based on the final result
        let travelStyleId = 4; // Default to Undefined
        if (travelStyle.includes("Relaxation")) travelStyleId = 1;
        if (travelStyle.includes("Cultural")) travelStyleId = 3;
        if (travelStyle.includes("Adventure")) travelStyleId = 2;

        // ✅ Update user travel_style_id in Firebase
        await database().ref(`/users/${userId}`).update({ travel_style_id: travelStyleId });

        // ✅ Update user travel_style_id in AsyncStorage
        await AsyncStorage.setItem('user_travel_style', JSON.stringify(travelStyleId));

        // ✅ Send only `travel_style_id` in the request body (Fixes error)
        await axios.put(`${API_BASE_URL}/users/${userId}/travel_style`, { travel_style_id: travelStyleId });

        // ✅ Fetch Travel Style details from `travel_style_routes.py`
        const response = await axios.get(`${API_BASE_URL}/travel-styles/${travelStyleId}`);
        setTravelStyle({
            emoji: travelStyleId === 1 ? "🏝" : travelStyleId === 2 ? "🌄" : travelStyleId === 3 ? "🎭" : "🔀",
            resultStyle: response.data.name,
            description: response.data.description
        });

        console.log("✅ Quiz result saved successfully:", response.data);
    } catch (error) {
        console.error("❌ Error sending travel style to backend:", error.response?.data || error.message);
    }
  };



  const handleNextQuestion = async () => {
    if (selectedAnswers[currentQuestionIndex] === null) return; // Prevent going forward without selection
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        // Clear future selections when moving forward after going back
        const updatedAnswers = selectedAnswers.slice(0, nextIndex);
        updatedAnswers[nextIndex] = null; // Ensure new selection is fresh
        setSelectedAnswers(updatedAnswers);

        setScores((prevScores) => {
          // Recalculate scores based only on retained answers
          const resetScores = { relaxation: 0, culture: 0, adventure: 0, none: 0 };
          updatedAnswers.forEach((answer) => {
            if (answer === 0) resetScores.relaxation += 1;
            else if (answer === 1) resetScores.culture += 1;
            else if (answer === 2) resetScores.adventure += 1;
            else if (answer === 3) resetScores.none += 1;
          });
          return resetScores;
        });
        // ✅ Update Firebase with new quiz progress
        getUserId().then((userId) => {
          if (userId) {
              updateQuizProgress(userId, nextIndex);
          }
        });

        return nextIndex;
      });
    } else {
      await determineTravelStyle();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
    }
  }

  const handleAnswerSelection = (index) => {
    const updatedAnswers = [...selectedAnswers];
    const previousAnswer = updatedAnswers[currentQuestionIndex];
    updatedAnswers[currentQuestionIndex] = index; 
    setSelectedAnswers(updatedAnswers);

    setScores(prevScores => {
        const updatedScores = { ...prevScores };

        // Remove previous answer's point
        if (previousAnswer !== null) {
            if (previousAnswer === 0) updatedScores.relaxation -= 1;
            else if (previousAnswer === 1) updatedScores.culture -= 1;
            else if (previousAnswer === 2) updatedScores.adventure -= 1;
            else if (previousAnswer === 3) updatedScores.none -= 1;
        }

        // Add new answer's point
        if (index === 0) updatedScores.relaxation += 1;
        else if (index === 1) updatedScores.culture += 1;
        else if (index === 2) updatedScores.adventure += 1;
        else if (index === 3) updatedScores.none += 1;

        return updatedScores;
    });

    // 🔥 Bounce Effect Animation
    animatedScalesRef[currentQuestionIndex][index].value = withTiming(1.1, { duration: 100 }, () => {
      animatedScalesRef[currentQuestionIndex][index].value = withTiming(1, { duration: 100 });
    });
  };

  const handleRetakeQuiz = async () => {
    console.log("Retaking quiz...");

    // Reset all quiz states
    setCurrentQuestionIndex(0);
    setSelectedAnswers(Array(questions.length).fill(null));
    setScores({ relaxation: 0, culture: 0, adventure: 0, none: 0 });
    setQuizCompleted(false);
    setTravelStyle({ emoji: '', resultStyle: '' });

    // Retrieve user ID again to ensure fresh submission
    const userId = await getUserId();

    if (userId) {
      console.log("📤 Sending new quiz attempt...");
    } else {
      console.error("❌ User ID not found, cannot send new quiz result.");
    }
  };

  ///asfadfafadsf

  const determineTravelStyle = async () => {
    setIsLoadingResult(true);
    const { relaxation, culture, adventure, none } = scores;
    let resultStyle = '';
    let emoji = '';
    let personalizedDescription = ''; // ✅ Declare at the top
  
    if (none > 3) {
      resultStyle = "You didn’t align with any specific travel style.";
      emoji = '🔀';
      personalizedDescription = `Hey ${userName || 'traveler'}, your travel style is still unfolding — no worries! You can retake the quiz anytime for fresh recommendations.`;
    } else {
      const maxScore = Math.max(relaxation, culture, adventure);
      const dominantStyles = [];
  
      if (relaxation === maxScore) dominantStyles.push("Relaxation");
      if (culture === maxScore) dominantStyles.push("Cultural");
      if (adventure === maxScore) dominantStyles.push("Adventure");
  
      // Set emoji
      if (dominantStyles.length === 1) {
        if (dominantStyles[0] === "Relaxation") emoji = "🏝";
        if (dominantStyles[0] === "Cultural") emoji = "🎭";
        if (dominantStyles[0] === "Adventure") emoji = "🌄";
      } else if (dominantStyles.length === 2) {
        if (dominantStyles.includes("Relaxation") && dominantStyles.includes("Cultural")) emoji = "🏯";
        if (dominantStyles.includes("Relaxation") && dominantStyles.includes("Adventure")) emoji = "🏕️";
        if (dominantStyles.includes("Cultural") && dominantStyles.includes("Adventure")) emoji = "🎢";
      } else {
        resultStyle = "You have a unique travel style!";
        emoji = "🔀";
      }
  
      resultStyle = dominantStyles.join(" and ");
  
      // 🧠 Personalized message
      if (dominantStyles.length === 1) {
        if (dominantStyles[0] === "Relaxation") {
          personalizedDescription = `You're someone who values peaceful escapes. WayPoint will prioritize tranquil getaways and relaxing recommendations tailored just for you.`;
        } else if (dominantStyles[0] === "Cultural") {
          personalizedDescription = `You’re an explorer of stories and heritage. Expect culturally rich destinations and immersive experiences to fill your WayPoint journey.`;
        } else if (dominantStyles[0] === "Adventure") {
          personalizedDescription = `You're a thrill-seeker! WayPoint will recommend exciting activities, bold destinations, and a touch of the wild to match your pace.`;
        }
      } else {
        personalizedDescription = `You have a dynamic taste for travel. WayPoint will mix it up for you with a balanced blend of experiences and destinations.`;
      }
    }
  
    const userId = await getUserId();
    if (userId) {
      await sendResultToBackend(userId, resultStyle);
      console.log("Retrieved User ID:", userId);
    } else {
      console.error("User ID not found, cannot send quiz result to backend.");
    }
  
    // ✅ Set final state before ending loading
    setTravelStyle({ emoji, resultStyle, description: personalizedDescription });
    setTimeout(() => {
      setIsLoadingResult(false);
      setHasFiredConfetti(true);
      setQuizCompleted(true);
      resultOpacity.value = withTiming(1, { duration: 600 });
    }, 2000);
  
  };
  
  // asdfasdfadadfadfadsfas

  const progress = useSharedValue(0); 

  useEffect(() => {
    loadQuizProgress(); 
  }, []);

  useEffect(() => {
    progress.value = withTiming((currentQuestionIndex + 1) / questions.length, { duration: 500 });
  }, [currentQuestionIndex]);


  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
        width: `${progress.value * 100}%`, // Convert progress to percentage width
    };
  });
const [isLoadingResult, setIsLoadingResult] = useState(false);
const [hasFiredConfetti, setHasFiredConfetti] = useState(false);
const [hasSavedProgress, setHasSavedProgress] = useState(false);
const [showResumePrompt, setShowResumePrompt] = useState(false);
const [userName, setUserName] = useState('');
const goHomeWithMessage = () => {
  Alert.alert("🎉 All set!", "Your travel style has been saved.", [
    { text: "OK", onPress: () => navigation.navigate('Main', { screen: 'Home' }) }
  ]);
};


  return (
    <>
      {showResumePrompt && (
        <View style={styles.resumeOverlay}>
          <View style={styles.resumeModal}>
            <Text style={styles.resumeTitle}>Resume your previous quiz?</Text>
            <Text style={styles.resumeMessage}>
              We found your saved progress. Do you want to continue from where you left off?
            </Text>
            <View style={styles.resumeButtonRow}>
            <TouchableOpacity onPress={startNewQuiz} style={styles.modalButtonSecondary}>
              <Text style={styles.modalButtonSecondaryText}>Start New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resumeSavedQuiz} style={styles.modalButtonPrimary}>
              <Text style={styles.modalButtonPrimaryText}>Resume</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      )}

      <SafeAreaView style={[styles.container, quizCompleted ? styles.resultsBackground : styles.quizBackground]}>
      {isLoadingResult ? (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Calculating your travel style...</Text>
    <Progress.CircleSnail color={['#1E3A8A', '#FF6F00']} />
  </View>
      ) : quizCompleted ? (
        <>
          {/* ✅ Confetti Animation */}
          {hasFiredConfetti && (
            <ConfettiCannon
              count={100}
              origin={{ x: 200, y: 0 }}
              fadeOut={true}
              explosionSpeed={400}
              fallSpeed={3000}
            />
          )}

          {/* Result Card */}
          <Animated.View style={[styles.resultContainer, resultFadeIn]}>

          <Text style={styles.resultEmoji}>{travelStyle.emoji}</Text>

          {travelStyle.resultStyle === "You didn’t align with any specific travel style." ? (
            <Text style={styles.resultText}>
              {travelStyle.resultStyle}
            </Text>
          ) : (
            <>
              <Text style={styles.resultText}>You are a</Text>
              <Text style={styles.resultStyleName}>{travelStyle.resultStyle}</Text>
              <Text style={styles.resultText}>Traveler!</Text>
              <Text style={styles.resultText}>
                {`Hey ${userName || 'traveler'}, ${travelStyle.description}`}
              </Text>

            </>
          )}

          <TouchableOpacity style={styles.retakeQuizButton} onPress={handleRetakeQuiz}>
            <Text style={styles.retakeQuizButtonText}>RETAKE QUIZ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retakeQuizButton, { backgroundColor: '#1E3A8A', marginTop: 16 }]}
            onPress={goHomeWithMessage}
          >
            <Text style={styles.retakeQuizButtonText}>BACK TO HOME</Text>
          </TouchableOpacity>

        </Animated.View>
      </>
        ) : (
          <>
            {/* Back Button */}
            <Pressable
              style={[
                styles.buttonNav,
                currentQuestionIndex === 0 && styles.hiddenButton
              ]}
              onPress={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <FontAwesome name="chevron-left" size={18} color="#1E3A8A" />
            </Pressable>


            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <Animated.View style={[styles.progressBar, animatedProgressStyle]} />
          </View>


            {/* Question */}
            <Text style={styles.questionTitle}>Question {currentQuestionIndex + 1}</Text>
            <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
            {questions[currentQuestionIndex].options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === index;

              animatedStylesRef[currentQuestionIndex][index]

              return (
                <Pressable
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.selectedOptionButton
                  ]}
                  onPress={() => handleAnswerSelection(index)}
                >
                  <Animated.View style={[animatedStylesRef[currentQuestionIndex][index], styles.optionContent]}>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText
                    ]}>
                      {String.fromCharCode(65 + index)}. {option}
                    </Text>
                    {isSelected && (
                      <FontAwesome 
                        name="check" 
                        size={16} 
                        color="white" 
                        style={styles.checkmarkIcon} 
                      />
                    )}
                  </Animated.View>
                </Pressable>
              );
            })}
            </View>


            {/* Next Button */}
            <Pressable
              style={[
                styles.buttonNext,
                selectedAnswers[currentQuestionIndex] === null && styles.disabledButton
              ]}
              onPress={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === null}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={[
                    styles.buttonNextText,
                    selectedAnswers[currentQuestionIndex] === null && styles.disabledButtonText,
                    { marginRight: 8 }
                  ]}
                >
                  {currentQuestionIndex === questions.length - 1 ? "SUBMIT" : "NEXT"}
                </Text>
                <FontAwesome
                  name={currentQuestionIndex === questions.length - 1 ? "check" : "chevron-right"}
                  size={16}
                  color={selectedAnswers[currentQuestionIndex] === null ? "#555" : "#fff"}
                />
              </View>
            </Pressable>

          </>
        )}

      </SafeAreaView>
    </>
  );
}

export default QuizScreen;