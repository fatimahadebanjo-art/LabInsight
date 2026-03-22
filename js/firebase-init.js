// js/firebase-init.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyANwe8WuJlm52572eLokU35_M-1ECmLQKE",
  authDomain: "labinsight01.firebaseapp.com",
  projectId: "labinsight01",
  storageBucket: "labinsight01.appspot.com",
  messagingSenderId: "1094416444895",
  appId: "1:1094416444895:web:9c8e7b0a3c8d2f1b2e4c9"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export default app;
