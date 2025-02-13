import react from 'react';
import { useState } from 'react';
import {
  Text,
  Pressable,
  View,
  ScrollView,
} from 'react-native';
import * as Progress from 'react-native-progress';
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
  const [travelStyle, setTravelStyle] = useState('');


  const sendResultToBackend = async (travelStyle) => {
    try {
      const response = await fetch('https://your-backend-url.com/api/user/travel-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: "USER_ID", travelStyle }),
      });
  
      const data = await response.json();
      console.log("Response from backend:", data);
    } catch (error) {
      console.error("Error sending travel style to backend:", error);
    }
  };  

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      determineTravelStyle();
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
  
  const determineTravelStyle = () => {
    const { relaxation, culture, adventure, none } = scores;
    let result = '';
  
    if (none > 3) {
      result = "You didn’t align with any specific travel style.";
    } else {
      const maxScore = Math.max(relaxation, culture, adventure);
      const dominantStyles = [];
  
      if (relaxation === maxScore) dominantStyles.push("Relaxation Traveler 🏝");
      if (culture === maxScore) dominantStyles.push("Cultural Explorer 🎭");
      if (adventure === maxScore) dominantStyles.push("Adventure Seeker 🌄");
  
      result = dominantStyles.length > 1
        ? `You're a mix of ${dominantStyles.join(" and ")}!`
        : `You are a **${dominantStyles[0]}**!`;
    }
  
    setTravelStyle(result);
    setQuizCompleted(true);
    sendResultToBackend(result);
  };
  
  

  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {quizCompleted ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{travelStyle}</Text>
        </View>
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
    </ScrollView>
  );
}

export default QuizScreen;