import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InteractiveMapScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Interactive Map Screen</Text>
      {/* Google Maps Component will go here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InteractiveMapScreen;
