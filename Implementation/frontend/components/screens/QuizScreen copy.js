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
import { database } from '../../firebase';
import API_BASE_URL from '../../config';
import styles from '../../styles/QuizScreenStyles';

const questions = [
  { question: "What is your preferred travel pace?", options: ["Relaxing", "Balanced", "Active", "None"] },
  { question: "What is your ideal accommodation choice?", options: ["Beachfront resort/spa treatment", "Boutique hotel in a historic district", "Campsite or adventure lodge", "None"] },
  { question: "What sounds the most exciting to you?", options: ["Unwinding with scenic views", "Exploring museums, culture, and history", "Hiking, water sports, or outdoor activities", "None"] },
  { question: "What is your preference in food experience?", options: ["Fine dining", "Local street food", "Outdoor cooking", "None"] },
  { question: "How do you spend a free day while traveling?", options: ["Spa & Relax", "Exploring cultural sites", "Extreme activities", "None"] },
  { question: "What is your preferred mode of exploration?", options: ["Leisurely walks", "Guided cultural tours", "Trekking & Cycling", "None"] },
  { question: "How would you like to remember your trips?", options: ["Relaxation-focused souvenirs", "Art, local crafts, books", "Gear & thrill-based mementos", "None"] }
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
      return await AsyncStorage.getItem('user_id');
    } catch (error) {
      console.error("Error retrieving user ID:", error);
      return null;
    }
  };

  const handleNextQuestion = async () => {
    if (selectedAnswers[currentQuestionIndex] === null) return;
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await determineTravelStyle();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleAnswerSelection = (index) => {
    const updatedAnswers = [...selectedAnswers];
    updatedAnswers[currentQuestionIndex] = index;
    setSelectedAnswers(updatedAnswers);

    setScores((prevScores) => {
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
    let travelStyleId = 4; // Default to Undefined

    const maxScore = Math.max(relaxation, culture, adventure);
    if (maxScore === relaxation) travelStyleId = 1;
    if (maxScore === culture) travelStyleId = 3;
    if (maxScore === adventure) travelStyleId = 2;

    const userId = await getUserId();
    if (userId) {
      await updateUserTravelStyle(userId, travelStyleId);
      await fetchTravelStyleDetails(travelStyleId);
    }

    setQuizCompleted(true);
  };

  const updateUserTravelStyle = async (userId, travelStyleId) => {
    try {
      await database().ref(`/users/${userId}`).update({ travel_style_id: travelStyleId });
      await AsyncStorage.setItem('user_travel_style', JSON.stringify(travelStyleId));
      await axios.put(`${API_BASE_URL}/users/${userId}`, { travel_style_id: travelStyleId });
    } catch (error) {
      console.error("Error updating travel style:", error);
    }
  };

  const fetchTravelStyleDetails = async (travelStyleId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/travel_styles/${travelStyleId}`);
      setTravelStyle({
        emoji: travelStyleId === 1 ? "🏝" : travelStyleId === 2 ? "🌄" : travelStyleId === 3 ? "🎭" : "🔀",
        name: response.data.name,
        description: response.data.description
      });
    } catch (error) {
      console.error("Error fetching travel style details:", error);
    }
  };

  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <SafeAreaView style={styles.container}>
      {quizCompleted ? (
        <>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.closeButtonText}>✖</Text>
          </TouchableOpacity>

          <View style={styles.resultContainer}>
            <Text style={styles.resultEmoji}>{travelStyle.emoji}</Text>
            <Text style={styles.resultText}>You are a {travelStyle.name} Traveler!</Text>
            <Text style={styles.resultDescription}>{travelStyle.description}</Text>

            <TouchableOpacity style={styles.retakeQuizButton} onPress={() => navigation.navigate('QuizScreen')}>
              <Text style={styles.retakeQuizButtonText}>RETAKE QUIZ</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Pressable style={styles.buttonNav} onPress={handlePreviousQuestion}>
            <Text style={styles.buttonText}>{'<'}</Text>
          </Pressable>

          <Progress.Bar style={styles.progressBar} progress={progress} width={300} height={10} color='#1E3A8A' unfilledColor='#F2F2F2' borderWidth={0} borderRadius={5} />

          <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

          <View style={styles.optionsContainer}>
            {questions[currentQuestionIndex].options.map((option, index) => (
              <Pressable 
                key={index} 
                style={[
                  styles.optionButton, 
                  selectedAnswers[currentQuestionIndex] === index && styles.selectedOption
                ]}
                onPress={() => handleAnswerSelection(index)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.buttonNext} onPress={handleNextQuestion}>
            <Text style={styles.buttonNextText}>
              {currentQuestionIndex === questions.length - 1 ? "SUBMIT" : "NEXT"}
            </Text>
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

export default QuizScreen;
