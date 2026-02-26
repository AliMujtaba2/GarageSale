import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBr6oXd3a8ozXa5KTbjFYk8Qco7cLhnEeE",
  authDomain: "garagesale-318e2.firebaseapp.com",
  projectId: "garagesale-318e2",
  storageBucket: "garagesale-318e2.appspot.com",
  messagingSenderId: "370111385075",
  appId: "1:370111385075:android:YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);



const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export { db , auth };