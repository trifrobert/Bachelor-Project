 // Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJsdj8P2ekGtWMlMJq_197awK2xiOnvUE",
  authDomain: "esp32-car-data.firebaseapp.com",
  databaseURL: "https://esp32-car-data-default-rtdb.firebaseio.com/",
  projectId: "esp32-car-data",
  storageBucket: "esp32-car-data.appspot.com",
  messagingSenderId: "481806121618",
  appId: "1:481806121618:web:d87ac21ed609a911e6044b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

export { db, ref, onValue, app };