import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { database } from '../../firebase'; // Adjusted import path

const FirebaseTestScreen = () => {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Reference to Firebase Realtime Database
    const reference = database().ref('/test');

    // Listen for changes in the database
    reference.on('value', (snapshot) => {
      setMessage(snapshot.val()?.message || 'No data');
    });

    // Cleanup listener when component unmounts
    return () => reference.off();
  }, []);

  const writeTestData = () => {
    database()
      .ref('/test')
      .set({ message: 'Hello, Firebase from React Native!' })
      .then(() => console.log('Data written successfully.'));
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Firebase Test Message: {message}</Text>
      <Button title="Write to Firebase" onPress={writeTestData} />
    </View>
  );
};

export default FirebaseTestScreen;
