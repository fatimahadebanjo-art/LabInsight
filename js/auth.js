// auth.js
import app from './firebase-init.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
import db from "./firestore-init.js";


// 🔹 Ensure login persists across reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Auth persistence set to local"))
  .catch(err => console.error("Failed to set persistence:", err));

// ----------------- Redirect Helpers -----------------
function redirectToAnalyzer() { window.location.href = "analyzer.html"; }
function redirectToLogin() { window.location.href = "account.html#login"; }

// ----------------- Plan Helpers -----------------
async function isProUser(userId) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;
    return docSnap.data().plan === "pro";
  } catch (err) {
    console.warn("Failed to fetch user plan", err);
    return false;
  }
}

window.LabInsight = window.LabInsight || {};
window.LabInsight.isPro = () => (localStorage.getItem("plan") || "").toLowerCase() === "pro";

// ----------------- Tab UI -----------------
export function switchTab(target) {
  const signupBox = document.getElementById("signup");
  const loginBox = document.getElementById("login");
  if (!signupBox || !loginBox) return;
  window.location.hash = target;
  if (target === "login") {
    signupBox.classList.remove("active");
    loginBox.classList.add("active");
  } else {
    loginBox.classList.remove("active");
    signupBox.classList.add("active");
  }
}
window.switchTab = switchTab;

export function setupAuthTabs() {
  const applyHash = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "login" || hash === "signup") {
      document.querySelectorAll(".form-box").forEach(box => box.classList.remove("active"));
      document.getElementById(hash)?.classList.add("active");
    }
  };
  applyHash();
  window.addEventListener("hashchange", applyHash);
}

// ----------------- Email/Password Sign Up -----------------
export function setupSignupValidation() {
  const signupBtn = document.getElementById("signupBtn");
  if (!signupBtn) return;
  signupBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim().toLowerCase();
    const password = document.getElementById("signup-password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;
    if (!name || !email || !password || !confirmPassword) return alert("Please fill all fields.");
    if (password.length < 8) return alert("Password must be at least 8 characters.");
    if (password !== confirmPassword) return alert("Passwords do not match.");
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      redirectToAnalyzer();
    } catch (err) {
      console.error("Signup error:", err);
      alert(`Signup failed: ${err.message}`);
    }
  });
}

// ----------------- Email/Password Login -----------------
export function setupLoginValidation() {
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;
  loginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email")?.value.trim().toLowerCase();
    const password = document.getElementById("login-password")?.value;
    if (!email || !password) return alert("Please enter email and password.");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      redirectToAnalyzer();
    } catch (err) {
      console.error("Login error:", err);
      alert(`Login failed: ${err.message}`);
    }
  });
}

// ----------------- Google Sign-In -----------------
export function setupGoogleLogin() {
  const googleBtn = document.getElementById("googleBtn");
  if (!googleBtn) return;
  const statusEl = document.getElementById("googleStatus");
  googleBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    statusEl && (statusEl.textContent = "Signing in with Google...");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      redirectToAnalyzer();
    } catch (popupErr) {
      console.warn("Google popup error:", popupErr);
      if (popupErr.code && (popupErr.code.includes("popup-blocked") || popupErr.code.includes("popup-closed"))) {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error("Google redirect failed:", redirectErr);
          alert(`Google login failed: ${redirectErr.message}`);
        }
      } else {
        alert(`Google login failed: ${popupErr.message}`);
      }
    }
  });

  // Handle redirect result if used
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult?.user) {
        redirectToAnalyzer();
      }
    } catch (err) {
      console.warn("Google redirect result error:", err);
    }
  });
}

// ----------------- Logout -----------------
export function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("navLogoutBtn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      // Clear local state
      localStorage.clear();
      console.log("User logged out");
      redirectToLogin();
    } catch (err) {
      console.error("Logout error:", err);
      alert(`Logout failed: ${err.message}`);
    }
  });
}

// ----------------- Monitor Auth State -----------------
export function monitorAuthState() {
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("navLogoutBtn");
  const userInfo = document.getElementById("userInfo");
  const userPhoto = document.getElementById("userPhoto");
  const userName = document.getElementById("userName");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("User signed in:", user.uid);
      const pro = await isProUser(user.uid);

      localStorage.setItem("plan", pro ? "pro" : "free");
      localStorage.setItem("isPro", pro ? "true" : "false");
      window.dispatchEvent(new Event("labinsight:planChanged"));

      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (userInfo) {
        userInfo.style.display = "inline-block";
        if (userName) userName.textContent = user.displayName || user.email || "";
        if (user.photoURL && userPhoto) {
          userPhoto.src = user.photoURL;
          userPhoto.style.display = "inline-block";
        } else if (userPhoto) {
          userPhoto.style.display = "none";
        }
      }

      const navProBadge = document.getElementById("navProBadge");
      if (navProBadge) {
        navProBadge.style.display = pro ? "inline-block" : "none";
      }

      if (window.location.pathname.includes("account.html")) {
        const statusEl = document.getElementById("googleStatus");
        if (statusEl) statusEl.textContent = "Login successful! Redirecting...";
        setTimeout(() => redirectToAnalyzer(), 900);
      }
    } else {
      console.log("No user signed in.");

      localStorage.setItem("plan", "free");
      localStorage.setItem("isPro", "false");
      window.dispatchEvent(new Event("labinsight:planChanged"));

      if (logoutBtn) logoutBtn.style.display = "none";
      if (userInfo) userInfo.style.display = "none";

      // Redirect only if on protected page
      if (window.location.pathname.includes("analyzer.html")) {
        redirectToLogin();
      }
    }
  });
}




import db from "./firestore-init.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

async function testFirestore() {
  try {
    const snapshot = await getDocs(collection(db, "users"));
    console.log("✅ Firestore connected. Users collection size:", snapshot.size);
  } catch (err) {
    console.error("❌ Firestore connection failed:", err.message);
  }
}

testFirestore();
