// COMMAND: Initialize Auth UI - Handles Navbar state and Role-based visibility
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  const userRole = localStorage.getItem("role");
  const loginBtn = document.querySelector(".btn-login");
  const adminLink = document.querySelector(".btn-admin");

  // Strictly enforce admin to only see admin.html
  if (
    userRole === "admin" &&
    !window.location.pathname.includes("admin.html")
  ) {
    const isPagesDir = window.location.pathname.includes("/pages/");
    window.location.href = isPagesDir ? "./admin.html" : "./pages/admin.html";
    return;
  }

  // Toggle Login/Profile/Dashboard Button
  if (userId && loginBtn) {
    const isPagesDir = window.location.pathname.includes("/pages/");

    if (userRole === "admin") {
      loginBtn.textContent = "Dashboard";
      loginBtn.href = isPagesDir ? "./admin.html" : "./pages/admin.html";
    } else {
      loginBtn.textContent = "Profile";
      loginBtn.href = isPagesDir ? "./profile.html" : "./pages/profile.html";
    }
  }

  // Toggle Admin Button based on role
  if (adminLink) {
    adminLink.style.display = (userRole === "admin") ? "inline-block" : "none";
  }

  // Toggle "MY ORDERS" link based on login
  const trackingLink = document.getElementById("tracking-link");
  if (trackingLink) {
    // Hide for visitors or if user is admin (assuming admins don't track orders)
    if (userId && userRole !== "admin") {
      trackingLink.parentElement.style.display = "inline-block";
    } else {
      trackingLink.parentElement.style.display = "none";
    }
  }
});
