// js/firebase-init.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyANwe8WuJlm52572eLokU35_M-1ECmLQKE",
  authDomain: "labinsight01.firebaseapp.com",
  projectId: "labinsight01",
  storageBucket: "labinsight01.firebasestorage.app",
  messagingSenderId: "342333331447",
  appId: "1:342333331447:web:bba0aabef149662c4400f2",
  measurementId: "G-ECF5BJ9L20"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

export default db;