// ./js/notifications.js
// ES module: exports showNotification and showProNotification

export function showNotification(message, type = "info", duration = 3000) {
  const containerId = "notification-container";
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    Object.assign(container.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "300px",
      zIndex: "9999",
      pointerEvents: "none"
    });
    document.body.appendChild(container);
  }

  const notif = document.createElement("div");
  notif.className = `notification ${type}`;
  notif.textContent = message;
  Object.assign(notif.style, {
    marginBottom: "8px",
    padding: "10px 12px",
    borderRadius: "6px",
    background: type === "info" ? "#222" : (type === "success" ? "#1e7e34" : "#d9534f"),
    color: "#fff",
    pointerEvents: "auto",
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
  });

  container.appendChild(notif);

  notif.style.opacity = 0;
  notif.style.transform = "translateX(100%)";
  notif.style.transition = "all 0.28s ease";
  requestAnimationFrame(() => {
    notif.style.opacity = 1;
    notif.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    notif.style.opacity = 0;
    notif.style.transform = "translateX(100%)";
    setTimeout(() => notif.remove(), 300);
  }, duration);
}

export function showProNotification(message) {
  const existing = document.querySelector(".pro-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.className = "pro-modal";
  Object.assign(modal.style, {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.45)",
    zIndex: 10000
  });

  const content = document.createElement("div");
  content.className = "pro-modal-content";
  Object.assign(content.style, {
    background: "#fff",
    padding: "18px",
    borderRadius: "8px",
    maxWidth: "420px",
    width: "90%",
    boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
    color: "#222"
  });

  content.innerHTML = `
    <h3 style="margin:0 0 8px 0;">🔒 Pro Feature</h3>
    <p style="margin:0 0 12px 0;">${message}</p>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <a href="pro.html" class="btn btn-primary" style="text-decoration:none;padding:8px 12px;border-radius:6px;background:#0b5ed7;color:#fff;">Upgrade Now</a>
      <button class="btn btn-outline" id="closeProModal" style="padding:8px 12px;border-radius:6px;border:1px solid #ccc;background:#fff;">Close</button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  modal.querySelector("#closeProModal").addEventListener("click", () => modal.remove());
}
