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
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [scores, setScores] = useState({ relaxation: 0, culture: 0, adventure: 0, none: 0 });
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [travelStyle, setTravelStyle] = useState({ emoji: '', resultStyle: '' });
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

      const response = await axios.post(`${API_BASE_URL}/quiz_results`, {
          user_id: userId,
          travel_style: travelStyle,
      });

      console.log("✅ Quiz result saved:", response.data);
  } catch (error) {
      console.error("❌ Error sending travel style to backend:", error.response?.data || error.message);
  }
};

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      await determineTravelStyle();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  }

  const handleAnswerSelection = (index) => {
    setSelectedAnswer(index);

    setScores(prevScores => {
      const updatedScores = { ...prevScores };

      if (index === 0) updatedScores.relaxation += 1;
      else if (index === 1) updatedScores.culture += 1;
      else if (index === 2) updatedScores.adventure += 1;
      else if (index === 3) updatedScores.none += 1;

      return updatedScores;
    });
  };

  const determineTravelStyle = async () => {
    const { relaxation, culture, adventure, none } = scores;
    let resultStyle = '';
    let emoji = '';

    if (none > 3) {
      resultStyle = "You didn’t align with any specific travel style.";
    } else {
      const maxScore = Math.max(relaxation, culture, adventure);
      const dominantStyles = [];

      if (relaxation === maxScore) {
        dominantStyles.push("Relaxation");
        emoji = "🏝";
      }
      if (culture === maxScore) {
        dominantStyles.push("Cultural Explorer");
        emoji = "🎭";
      }
      if (adventure === maxScore) {
        dominantStyles.push("Adventure Seeker");
        emoji = "🌄";
      }

      resultStyle = dominantStyles.length > 1
      ? `${dominantStyles.join(" and ")}`
      : `${dominantStyles[0]}`;
  
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
              <Text style={styles.resultText}>
                You are a {'\n'}
                <Text style={styles.resultStyleName}>{travelStyle.resultStyle}</Text>{'\n'}
                Traveler!
              </Text>
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
                    selectedAnswer === index && styles.selectedButton
                  ]}
                  onPress={() => handleAnswerSelection(index)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      selectedAnswer === index && styles.selectedButtonText
                    ]}>
                    {letter}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Next Button */}
            <Pressable style={styles.buttonNext} onPress={handleNextQuestion}>
              <Text style={styles.buttonNextText}>{currentQuestionIndex === questions.length - 1 ? "SUBMIT" : "NEXT"}</Text>
            </Pressable>
          </>
        )}

      </SafeAreaView>
    </>
  );
}

export default QuizScreen;