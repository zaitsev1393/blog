// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBF8oVKqgPIjq0uP_oQwf5r0xV64UwlH0g",
  authDomain: "blog-386d3.firebaseapp.com",
  projectId: "blog-386d3",
  storageBucket: "blog-386d3.appspot.com",
  messagingSenderId: "195390063310",
  appId: "1:195390063310:web:9d33e8b1e043864bf1469f",
  measurementId: "G-5XYMRBPNDQ",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

window.app = app;
window.analytics = analytics;
