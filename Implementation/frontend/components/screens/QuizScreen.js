import React, { useState } from 'react';
import {
  Text,
  Pressable,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Progress from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import API_BASE_URL from '../../config';
import { database } from '../../firebase';
import styles from '../../styles/QuizScreenStyles';

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
      "Local street foor and cultural experiences",
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
  const [selectedAnswers, setSelectedAnswers] = useState(Array(questions.length).fill(null));
  const [scores, setScores] = useState({ relaxation: 0, culture: 0, adventure: 0, none: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [travelStyle, setTravelStyle] = useState({ emoji: '', name: '', description: '' });
  const navigation = useNavigation();

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

    const previousAnswer = updatedAnswers[currentQuestionIndex]; // Get the previously selected answer
    updatedAnswers[currentQuestionIndex] = index; // Store the selected answer for the current question
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


  const determineTravelStyle = async () => {
    const { relaxation, culture, adventure, none } = scores;
    let resultStyle = '';
    let emoji = '';

    if (none > 3) {
      resultStyle = "You didn’t align with any specific travel style.";
      emoji = '🔀';
    } else {
      const maxScore = Math.max(relaxation, culture, adventure);
      const dominantStyles = [];

      if (relaxation === maxScore) dominantStyles.push("Relaxation");
      if (culture === maxScore) dominantStyles.push("Cultural");
      if (adventure === maxScore) dominantStyles.push("Adventure");

      // Determine emoji based on combinations
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
        emoji = "🔀";  // Default for rare all-tied cases
      }

      resultStyle = dominantStyles.join(" and ");
    }

    const userId = await getUserId();
    if (userId) {
      await sendResultToBackend(userId, resultStyle);
      console.log("Retrieved User ID:", userId);
    } else {
      console.error("User ID not found, cannot send quiz result to backend.");
    }

    setTravelStyle({ emoji, resultStyle });
    setQuizCompleted(true);
  };

  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <>
      <SafeAreaView style={[styles.container, quizCompleted ? styles.resultsBackground : styles.quizBackground]}>
        {quizCompleted ? (
          <>
            {/* X Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.closeButtonText}>✖</Text>
            </TouchableOpacity>

            {/* Result Card */}
            <View style={styles.resultContainer}>
              <Text style={styles.resultEmoji}>{travelStyle.emoji}</Text>

              {travelStyle.resultStyle === "You didn’t align with any specific travel style." ? (
                // ✅ If no specific style, display only this text (NO extra "You are a / Traveler!")
                <Text style={styles.resultText}>
                  {travelStyle.resultStyle}
                </Text>
              ) : (
                // ✅ If a specific style is found, follow the correct format
                <Text style={styles.resultText}>
                  {"You are a\n"}
                  <Text style={styles.resultStyleName}>{travelStyle.resultStyle}</Text>
                  {"\nTraveler!"}
                </Text>
              )}

              <TouchableOpacity style={styles.retakeQuizButton} onPress={handleRetakeQuiz}>
                <Text style={styles.retakeQuizButtonText}>RETAKE QUIZ</Text>
              </TouchableOpacity>
            </View>
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
              disabled={currentQuestionIndex === 0}>
              <Text style={styles.buttonText}>{'<'}</Text>
            </Pressable>

            {/* Progress Bar */}
            <Progress.Bar
              style={styles.progressBar}
              progress={progress}
              width={300} height={10}
              color='#1E3A8A'
              unfilledColor='#F2F2F2'
              borderWidth={0}
              borderRadius={5}
            />

            {/* Question */}
            <Text style={styles.questionTitle}>Question {currentQuestionIndex + 1}</Text>
            <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {questions[currentQuestionIndex].options.map((option, index) => (
                <Text key={index} style={styles.optionText}>
                  {String.fromCharCode(65 + index)}) {option}
                </Text>
              ))}
            </View>

            {/* Answer Buttons */}
            <View style={styles.grid}>
              {["A", "B", "C", "D"].map((letter, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.button,
                    selectedAnswers[currentQuestionIndex] === index && styles.selectedButton
                  ]}
                  onPress={() => handleAnswerSelection(index)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedAnswers[currentQuestionIndex] === index && styles.selectedButtonText
                    ]}>
                    {letter}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Next Button */}
            <Pressable
              style={[styles.buttonNext, selectedAnswers[currentQuestionIndex] === null && styles.disabledButton]}
              onPress={handleNextQuestion}
              disabled={selectedAnswers[currentQuestionIndex] === null}>
              <Text style={[styles.buttonNextText, selectedAnswers[currentQuestionIndex] === null && styles.disabledButtonText]}>
                {currentQuestionIndex === questions.length - 1 ? "SUBMIT" : "NEXT"}
              </Text>
            </Pressable>
          </>
        )}

      </SafeAreaView>
    </>
  );
}

export default QuizScreen;