// realtime-init.js
import app from "./firebase-init.js";
import { getDatabase } 
  from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const db = getDatabase(app);
export default db;
