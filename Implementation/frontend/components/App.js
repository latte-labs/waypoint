import React from 'react';
import PropTypes from 'prop-types';

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
import HomeScreen from './HomeScreen';

function App() {

  return (
    <SafeAreaView>
      <HomeScreen />
    </SafeAreaView>
  );
}

export default App;
