import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';

// Manually provide Firebase options instead of using plist
const firebaseConfig = {
  apiKey: "AIzaSyCqbUDCHgZC-OkXD3mKYfE7wiY9x4HWWIc",
  databaseURL: "https://waypoint-travel-default-rtdb.firebaseio.com",
  projectId: "waypoint-travel",
  storageBucket: "waypoint-travel.firebasestorage.app", // ✅ Fix storage domain
  appId: "1:77540150774:ios:43fc11ea0153c0c83c8bd7",
  messagingSenderId: "77540150774",
};

// Force Firebase to initialize manually
try {
  if (!firebase.apps.length) {
    console.log("🔥 Manually initializing Firebase...");
    firebase.initializeApp(firebaseConfig)
      .then(() => console.log("✅ Firebase initialized successfully with manual config"))
      .catch((error) => console.error("🔥 Firebase initialization error:", error));
  } else {
    console.log("✅ Firebase already initialized.");
  }
} catch (error) {
  console.error("🔥 Firebase initialization error:", error);
}

export { firebase, database };