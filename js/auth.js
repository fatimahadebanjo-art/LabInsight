// js/auth.js

// Import modular functions for Authentication
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
// You might not need firebase/app here if the 'app' instance is passed from index.html


// --- UI Utilities ---

// Function to switch between login/signup tabs
export function switchTab(target) {
  const signupBox = document.getElementById("signup");
  const loginBox = document.getElementById("login");
  if (!signupBox || !loginBox) return;

  if (target === "login") {
    signupBox.classList.remove("active");
    loginBox.classList.add("active");
  } else {
    loginBox.classList.remove("active");
    signupBox.classList.add("active");
  }
}
window.switchTab = switchTab; // Make it globally accessible for inline onclick (consider removing inline scripts)


export function setupAuthTabs() {
  // If there are tab buttons in the layout, keep them working.
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const target = btn.dataset.target;
      if (!target) return;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll(".form-box").forEach((box) => box.classList.remove("active"));
      const targetBox = document.getElementById(target);
      if (targetBox) targetBox.classList.add("active");
    });
  });

  if (window.location.hash === "#signup" || window.location.hash === "#login") {
    const hashTarget = window.location.hash.replace("#", "");
    const targetBox = document.getElementById(hashTarget);
    if (targetBox) {
      document.querySelectorAll(".form-box").forEach((box) => box.classList.remove("active"));
      targetBox.classList.add("active");
    }
  }
}

function redirectToAnalyzer() {
  window.location.href = "analyzer.html";
}

function redirectToLogin() {
  window.location.href = "index.html#login";
}

// --- Firebase Authentication Integrations ---

// Google Sign-in
export function setupGoogleLogin(app) {
  const auth = getAuth(app); // Get the auth instance
  const googleBtn = document.querySelector(".google-btn");
  if (!googleBtn) return;

  let popupPending = false;
  const googleStatus = document.getElementById("googleStatus");

  googleBtn.addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent default button behavior
    if (popupPending) return;
    popupPending = true;
    if (googleStatus) googleStatus.textContent = "Opening Google sign-in...";

    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("User signed in with Google:", user.displayName || user.email);
      localStorage.setItem("loggedIn", "true");
      if (googleStatus) googleStatus.textContent = "Signed in successfully. Redirecting...";
      redirectToAnalyzer();
    } catch (error) {
      console.error("Google Sign-in error:", error.code, error.message);
      if (error.code === "auth/popup-blocked" || error.code === "auth/browser-popup-blocked") {
        alert("Popup blocked by browser. Redirecting to Google sign-in instead.");
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectError) {
          console.error("Redirect sign-in failed:", redirectError.code, redirectError.message);
          alert(`Google redirect sign-in failed: ${redirectError.message}`);
        }
      } else if (error.code === "auth/cancelled-popup-request" || error.code === "auth/popup-closed-by-user") {
        if (googleStatus) googleStatus.textContent = "Popup canceled. Please try again.";
        alert("Google sign-in popup was canceled. Please click the button again and complete the sign-in.");
      } else {
        if (googleStatus) googleStatus.textContent = "Google sign-in failed.";
        alert(`Google Sign-in failed: ${error.message}`);
      }
    } finally {
      popupPending = false;
    }
  });

  // Handle redirect result in browsers that use redirect flow
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      console.log("Redirect sign-in success, user:", user.email);
      localStorage.setItem("loggedIn", "true");
      redirectToAnalyzer();
    }
  });
}

// Email/Password Sign Up
export function setupSignupValidation(app) {
  const auth = getAuth(app); // Get the auth instance
  const signupBtn = document.getElementById("signupBtn");
  if (!signupBtn) return;

  signupBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim(); // Firebase doesn't directly store 'name' on signup, you'd update profile separately
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all sign-up fields.");
      return;
    }
    if (password.length < 8) {
      alert("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // User created successfully
      const user = userCredential.user;
      console.log("User signed up with email:", user.email);

      // Optionally, you can update the user's display name after creation
      // await updateProfile(user, { displayName: name });
      // console.log("User display name updated.");

      localStorage.setItem("loggedIn", "true");
      redirectToAnalyzer();
    } catch (error) {
      console.error("Email signup error:", error.code, error.message);
      alert(`Account creation failed: ${error.message}`);
    }
  });
}

// Email/Password Login
export function setupLoginValidation(app) {
  const auth = getAuth(app); // Get the auth instance
  const loginBtn = document.getElementById("loginBtn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User logged in successfully
      const user = userCredential.user;
      console.log("User logged in with email:", user.email);
      localStorage.setItem("loggedIn", "true");
      redirectToAnalyzer();
    } catch (error) {
      console.error("Email login error:", error.code, error.message);
      alert(`Login failed: ${error.message}`);
    }
  });
}

// Logout
export function setupLogout(app) {
  const auth = getAuth(app); // Get the auth instance
  const logoutBtn = document.getElementById("logoutBtn") || document.getElementById("navLogoutBtn");
  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      await signOut(auth);
      console.log("User signed out.");
      localStorage.removeItem("loggedIn");
      // You can also remove specific user data from localStorage if you stored any (e.g., userName, userEmail)
      localStorage.removeItem("userName"); // Clear local storage data
      localStorage.removeItem("userEmail");
      redirectToLogin(); // Redirect to login page after logout
    } catch (error) {
      console.error("Logout error:", error.code, error.message);
      alert(`Logout failed: ${error.message}`);
    }
  });
}

// Monitor Authentication State
export function monitorAuthState(app) {
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user) => {
    const isLoginPage = window.location.pathname.includes('index.html');
    const isAnalyzerPage = window.location.pathname.includes('analyzer.html');

    if (user) {
      // User is signed in
      console.log("Auth state changed: User is signed in.", user.uid, user.email);
      if (isLoginPage) {
        // Redirect from login/signup page if user is authenticated
        redirectToAnalyzer();
      }
      // You might want to update UI elements here (e.g., show user's name, hide login forms)
    } else {
      // User is signed out
      console.log("Auth state changed: No user signed in.");
      if (isAnalyzerPage) {
        // Redirect from protected pages (like analyzer.html) if user is not authenticated
        redirectToLogin();
      }
      // You might want to update UI elements here (e.g., show login forms, hide user's name)
    }
  });
}

// Initial setup call (consider if you need to call this only once, or if it handles dynamically added elements)
// You might need to call monitorAuthState(app) and setupLogout(app) on every page that requires it.
