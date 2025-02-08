import react from 'react';
import { useState } from 'react';
import {
  Text,
  Pressable,
  View,
  ScrollView,
} from 'react-native';
import * as Progress from 'react-native-progress';
import styles from '../styles/QuizScreenStyles';

const questions = [
  {
    question: "What is your favorite color?",
    options: ["Red", "Orange", "Blue", "None"]
  },
  {
    question: "Which animal do you like most?",
    options: ["Dog", "Cat", "Bird", "Fish"]
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"]
  }
];

function QuizScreen() {

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
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
  }

  const progress = (currentQuestionIndex + 1) / questions.length;

  return (
    <ScrollView contentContainerStyle={styles.container}>
    
        <Pressable
          style={[
            styles.buttonNav,
            currentQuestionIndex === 0 && styles.hiddenButton 
          ]}
          onPress={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}>
          <Text style={styles.buttonText}>{'<'}</Text>
        </Pressable>
      
      <Progress.Bar
        style={styles.progressBar}
        progress={progress}
        width={300} height={10}
        color='#1E3A8A'
        unfilledColor='#F2F2F2'
        borderWidth={0}
        borderRadius={5}
      />

      <Text style={styles.questionTitle}>Question {currentQuestionIndex + 1}</Text>
      <Text style={styles.question}>{questions[currentQuestionIndex].question}</Text>

      <View style={styles.optionsContainer}>
        {questions[currentQuestionIndex].options.map((option, index) => (
          <Text key={index} style={styles.optionText}>
            {String.fromCharCode(65 + index)}) {option} {/* Converts index to A, B, C, D */}
          </Text>
        ))}
      </View>
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
                selectedAnswer === index && styles.selectedButtonText // Change text color if selected
              ]}>
              {letter}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.buttonNext} onPress={handleNextQuestion}>
        <Text style={styles.buttonNextText}>NEXT</Text>
      </Pressable>
    </ScrollView>
  );
}

export default QuizScreen;