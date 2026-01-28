const signupForm = document.getElementById("signupForm");

// COMMAND: Submit Signup Form - Validates and creates a new user account
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const terms = document.getElementById("terms").checked;

  if (password !== confirmPassword) {
    showToast("Passwords don't match", "error");
    return;
  }

  if (!terms) {
    showToast("Please accept the Terms & Conditions", "error");
    return;
  }

  try {
    const response = await fetch(`${window.API_BASE_URL}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    showToast("Signup successful! Redirecting to login...", "success");
    window.location.href = "./login.html";
  } catch (error) {
    console.error(error);
    showToast(error.message || "Server error", "error");
  }
});
