// firestore-init.js
import app from "./firebase-init.js";
import { initializeFirestore } 
  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Use long-polling to avoid "client offline" issues in some environments
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

export default db;
