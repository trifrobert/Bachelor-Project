// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJsdj8P2ekGtWMlMJq_197awK2xiOnvUE",
  authDomain: "esp32-car-data.firebaseapp.com",
  projectId: "esp32-car-data",
  storageBucket: "esp32-car-data.appspot.com",
  messagingSenderId: "481806121618",
  appId: "1:481806121618:web:d87ac21ed609a911e6044b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

export { db, ref, onValue };