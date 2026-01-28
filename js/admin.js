//  1. Admin Access Control (CRITICAL)
const userRole = localStorage.getItem("role");
const token = localStorage.getItem("access_token");

if (userRole !== "admin") {
  alert("Access Denied! Admins only.");
  window.location.href = "../index.html";
}

const BASE_URL = "http://127.0.0.1:8000";

//  2. Sidebar Navigation & Initialization
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.querySelectorAll(".menu-item");
  const sections = document.querySelectorAll(".content-section");

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      menuItems.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      sections.forEach((section) => {
        section.style.display = "none";
        section.classList.remove("active");
      });

      const sectionId = item.getAttribute("data-section");
      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.style.display = "block";
        setTimeout(() => targetSection.classList.add("active"), 10);

        // Fetch data when section is opened
        if (sectionId === "products") fetchProducts();
        if (sectionId === "users") fetchUsers();
        if (sectionId === "orders") fetchOrders();
        if (sectionId === "dashboard") refreshDashboard();
      }
    });
  });

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.clear();
        window.location.href = "./login.html";
      }
    });
  }

  // Product Form Submit
  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProduct);
  }

  // Initial Load
  refreshDashboard();
});

//  3. UI Helpers
// COMMAND: Toggle Product Form - Show/Hide the add/edit UI
function toggleProductForm() {
  const container = document.getElementById("addProductFormContainer");
  container.style.display =
    container.style.display === "none" ? "block" : "none";
}

// COMMAND: Open Add Product Form - Reset form for new entry
function openAddProductForm() {
  const container = document.getElementById("addProductFormContainer");
  document.getElementById("formTitle").innerText = "Add New Product";
  document.getElementById("addProductForm").reset();
  document.getElementById("p_id").value = "";
  document.getElementById("p_rating").value = "0";
  document.getElementById("p_features").value = "";
  container.style.display = "block";
}

//  4. Data Fetching Functions

// COMMAND: Fetch Products - Populate product table
async function fetchProducts() {
  try {
    const response = await fetch(`${BASE_URL}/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const products = await response.json();
    const body = document.getElementById("productsBody");
    body.innerHTML = "";

    products.forEach((p) => {
      body.innerHTML += `
                <tr>
                    <td><img src="${p.image_url}" width="50" style="border-radius: 5px;"></td>
                    <td>${p.name}</td>
                    <td>₹${p.price}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="status processing" style="border:none; cursor:pointer;" onclick="editProduct(${p.id})">Edit</button>
                        <button class="status pending" style="border:none; cursor:pointer;" onclick="deleteProduct(${p.id})">Deactivate</button>
                    </td>
                </tr>
            `;
    });
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

// COMMAND: Fetch Users - Populate user table
async function fetchUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await response.json();
    const body = document.getElementById("usersBody");
    body.innerHTML = "";

    users.forEach((u) => {
      body.innerHTML += `
                <tr>
                    <td>#${u.id}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="badge" style="background:${u.role === "admin" ? "#ffe2e5" : "#f0f0f0"}">${u.role}</span></td>
                </tr>
            `;
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

// COMMAND: Fetch Orders - Populate order history table
async function fetchOrders() {
  try {
    const response = await fetch(`${BASE_URL}/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await response.json();
    const body = document.getElementById("ordersBody");
    body.innerHTML = "";

    orders.forEach((o) => {
      const orderDate = new Date(o.order_date).toLocaleDateString();
      body.innerHTML += `
                <tr>
                    <td>#${o.id} <br><small style="color:#666">${orderDate}</small></td>
                    <td>${o.user ? o.user.name : `User #${o.user_id}`}</td>
                    <td>${o.product ? o.product.name : `Product #${o.product_id}`}</td>
                    <td>₹${o.total_amount}</td>
                    <td>
                        <select onchange="updateOrderStatus(${o.id}, this.value)" class="status-select ${o.status}">
                            <option value="processing" ${o.status === "processing" ? "selected" : ""}>Processing</option>
                            <option value="shipped" ${o.status === "shipped" ? "selected" : ""}>Shipped</option>
                            <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>Delivered</option>
                            <option value="cancelled" ${o.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                        </select>
                    </td>
                </tr>
            `;
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
  }
}

// COMMAND: Refresh Dashboard - Update stats and recent orders
async function refreshDashboard() {
  try {
    // 1. Fetch Orders and calculate Sales
    const orderRes = await fetch(`${BASE_URL}/orders/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await orderRes.json();

    const totalSales = orders.reduce((sum, o) => sum + o.total_amount, 0);
    document.getElementById("stat-total-sales").innerText =
      `₹${totalSales.toLocaleString()}`;
    document.getElementById("stat-total-orders").innerText = orders.length;

    // 2. Fetch Products count
    const productRes = await fetch(`${BASE_URL}/products/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const products = await productRes.json();
    document.getElementById("stat-total-products").innerText = products.length;

    // 3. Fetch Users count
    const userRes = await fetch(`${BASE_URL}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await userRes.json();
    document.getElementById("stat-total-users").innerText = users.length;

    // 4. Update Recent Orders Table
    const recentOrdersBody = document.querySelector("#dashboard table tbody");
    if (recentOrdersBody) {
      recentOrdersBody.innerHTML = "";
      // Show latest 5 orders
      orders
        .sort((a, b) => b.id - a.id)
        .slice(0, 5)
        .forEach((o) => {
          const orderDate = new Date(o.order_date).toLocaleDateString();
          recentOrdersBody.innerHTML += `
                    <tr>
                        <td>#${o.id} <br><small style="color:#666">${orderDate}</small></td>
                        <td>${o.user ? o.user.name : `User #${o.user_id}`}</td>
                        <td>${o.product ? o.product.name : `Product #${o.product_id}`}</td>
                        <td>₹${o.total_amount}</td>
                        <td>
                          <select onchange="updateOrderStatus(${o.id}, this.value)" class="status-select ${o.status}">
                            <option value="processing" ${o.status === "processing" ? "selected" : ""}>Processing</option>
                            <option value="shipped" ${o.status === "shipped" ? "selected" : ""}>Shipped</option>
                            <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>Delivered</option>
                            <option value="cancelled" ${o.status === "cancelled" ? "selected" : ""}>Cancelled</option>
                          </select>
                        </td>
                    </tr>
                `;
        });
    }
  } catch (err) {
    console.log("Dashboard refresh failed:", err);
  }
}

//  5. Action Handlers

// COMMAND: Handle Add Product - POST/PUT product data
async function handleAddProduct(e) {
  e.preventDefault();

  const pId = document.getElementById("p_id").value;
  const payload = {
    name: document.getElementById("p_name").value,
    description: document.getElementById("p_desc").value,
    price: parseFloat(document.getElementById("p_price").value),
    stock: parseInt(document.getElementById("p_stock").value),
    image_url: document.getElementById("p_image").value,
    rating: parseFloat(document.getElementById("p_rating").value) || 0,
    features: document.getElementById("p_features").value,
  };

  const method = pId ? "PUT" : "POST";
  const url = pId ? `${BASE_URL}/products/${pId}` : `${BASE_URL}/products/`;

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert(` Product ${pId ? "updated" : "added"} successfully!`);
      document.getElementById("addProductForm").reset();
      toggleProductForm();
      fetchProducts(); // Refresh list
    } else {
      const error = await response.json();
      alert(
        ` Failed to ${pId ? "update" : "add"} product: ` +
          (error.detail || "Unknown error"),
      );
    }
  } catch (err) {
    console.error("Error processing product:", err);
    alert(" Server connection error!");
  }
}

// COMMAND: Edit Product - Load product into form for update
async function editProduct(id) {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const p = await response.json();

    document.getElementById("p_id").value = p.id;
    document.getElementById("p_name").value = p.name;
    document.getElementById("p_price").value = p.price;
    document.getElementById("p_stock").value = p.stock;
    document.getElementById("p_image").value = p.image_url;
    document.getElementById("p_desc").value = p.description;
    document.getElementById("p_rating").value = p.rating || 0;
    document.getElementById("p_features").value = p.features || "";

    document.getElementById("formTitle").innerText = "Edit Product";
    document.getElementById("addProductFormContainer").style.display = "block";

    // Scroll to form
    document
      .getElementById("addProductFormContainer")
      .scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    console.error("Fetch product failed:", err);
  }
}

// COMMAND: Deactivate Product - Soft delete product entry
async function deleteProduct(id) {
  if (!confirm("Are you sure you want to deactivate this product?")) return;

  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) {
      fetchProducts();
    }
  } catch (err) {
    console.error("Delete failed:", err);
  }
}

// COMMAND: Update Order Status - PATCH status changes
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(
      `${BASE_URL}/orders/${orderId}/status?new_status=${newStatus}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      alert(`Order #${orderId} status updated to ${newStatus}`);
      fetchOrders(); // Refresh orders table
      refreshDashboard(); // Update dashboard stats
    } else {
      const error = await response.json();
      alert("Failed to update status: " + (error.detail || "Unknown error"));
    }
  } catch (err) {
    console.error("Update status failed:", err);
    alert("Server connection error!");
  }
}
