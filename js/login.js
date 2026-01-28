const loginForm = document.querySelector("form");

// COMMAND: Submit Login Form - Authenticates user and stores session tokens
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  try {
    const response = await fetch(`${window.API_BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("role", data.role);

    alert("Login successful");

    if (data.role === "admin") {
      window.location.href = "./admin.html";
    } else {
      window.location.href = "./product.html";
    }
  } catch (error) {
    console.error(error);
    alert(error.message || "Server error");
  }
});
