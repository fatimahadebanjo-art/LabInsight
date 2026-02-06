export function setupAuthTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const forms = document.querySelectorAll(".form-box");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      forms.forEach(f => f.classList.remove("active"));
      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.target);
      if (target) target.classList.add("active");
    });
  });

  // Handle hash navigation (#signup or #login)
  if (window.location.hash === "#signup") {
    document.querySelector(".tab-btn[data-target='signup']").click();
  }
  if (window.location.hash === "#login") {
    document.querySelector(".tab-btn[data-target='login']").click();
  }
}

export function setupSignupValidation() {
  const signupBtn = document.getElementById("signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", function() {
      const password = document.getElementById("signup-password").value;
      const confirmPassword = document.getElementById("confirm-password").value;

      if (password === confirmPassword && password.length >= 8) {
        localStorage.setItem("loggedIn", "true");

        window.location.href = "welcome.html";
        
      } else if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
      } else {
        alert("Passwords do not match. Please try again.");
      }
    });
  }
}

export function setupLoginValidation() {
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", function() {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      if (email && password) {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("userName", document.getElementById("signup-name").value);
        window.location.href = "welcome.html"; 
      } else {
        alert("Please enter both email and password.");
      }
    });
  }
}

export function setupLogout() {
  const navLogoutBtn = document.getElementById("navLogoutBtn");
  if (navLogoutBtn) {
    navLogoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedIn");
      localStorage.removeItem("userName");
      window.location.href = "account.html?show=login"; // redirect to login
    });
  }
}

