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
    alert("Passwords don't match");
    return;
  }

  if (!terms) {
    alert("Please accept the Terms & Conditions");
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

    alert("Signup successful! Redirecting to login...");
    window.location.href = "./login.html";
  } catch (error) {
    console.error(error);
    alert(error.message || "Server error");
  }
});
