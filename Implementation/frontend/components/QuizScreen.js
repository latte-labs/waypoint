import react from 'react';
import {
    Text,
    Pressable,
    View,
    ScrollView,
  } from 'react-native';
import styles from '../styles/QuizScreenStyles';

function QuizScreen() {

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <Text style={styles.questionTitle}>Question 1</Text>
      <Text style={styles.question}>This is an example question. What is your favourite colour?</Text>
      <Text style={styles.question}>Is it: {"\n"}A) Red{"\n"}B) Orange{"\n"}C) Blue{"\n"}D) None</Text>
        <View style={styles.grid}>
          <Pressable style={styles.button} onPress={() => console.log('Button A pressed')}>
            <Text style={styles.buttonText}>Button A</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => console.log('Button B pressed')}>
            <Text style={styles.buttonText}>Button B</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => console.log('Button C pressed')}>
            <Text style={styles.buttonText}>Button C</Text>
          </Pressable>

          <Pressable style={styles.button} onPress={() => console.log('Button D pressed')}>
            <Text style={styles.buttonText}>Button D</Text>
          </Pressable>
      </View>
    </ScrollView>
  );
}

export default QuizScreen;