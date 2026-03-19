// js/firebase-init.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyANwe8WuJlm52572eLokU35_M-1ECmLQKE",
  authDomain: "labinsight01.firebaseapp.com",
  projectId: "labinsight01"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export default app;
