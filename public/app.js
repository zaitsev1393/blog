import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { log } from "./utils/logger.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-analytics.js";
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
  databaseURL: "https://blog-386d3-default-rtdb.firebaseio.com",
};

// Initialize Firebase

let appPromise = null;

export function init() {
  return new Promise((resolve, reject) => {
    if (appPromise) {
      log("app already initialized");
      resolve(appPromise);
      return;
    }
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    appPromise = { app, db };
    resolve(appPromise);
  });
}
