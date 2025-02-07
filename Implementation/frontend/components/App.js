import React from 'react';
import {
  SafeAreaView,
} from 'react-native';
import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import QuizScreen from './QuizScreen';

function App() {

  return (
    <SafeAreaView>
      <QuizScreen />
    </SafeAreaView>
  );
}

export default App;
