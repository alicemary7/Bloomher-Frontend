const CART_API_URL = `${window.API_BASE_URL}/cart`;
const PRODUCT_API_URL = `${window.API_BASE_URL}/products`;
const userId = localStorage.getItem("user_id");
const token = localStorage.getItem("access_token");

const urlParams = new URLSearchParams(window.location.search);
let productId = urlParams.get("id") || document.body.dataset.productId;

const productName = document.getElementById("productName");
const productImage = document.getElementById("productImage");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const featuresBox = document.getElementById("featuresBox");
const quantityInput = document.getElementById("productQuantity");
const addToCartBtn = document.getElementById("addToCartBtn");
const buyNowBtn = document.getElementById("buyNowBtn");

const loadingContent = document.getElementById("loadingContent");
const productContent = document.getElementById("productContent");

// COMMAND: Fetch Product Details - UI population for details page
async function fetchProductDetails() {
  if (!productId) {
    if (loadingContent) loadingContent.textContent = "Error: No product ID provided.";
    return;
  }

  try {
    const res = await fetch(`${PRODUCT_API_URL}/${productId}`);
    if (!res.ok) {
      if (res.status === 404) throw new Error("Product not found");
      throw new Error("Failed to fetch product details");
    }
    const product = await res.json();

    if (productName) productName.textContent = product.name;
    if (productImage) {
      productImage.src = product.image_url;
      productImage.alt = product.name;
    }
    if (productPrice) productPrice.textContent = `₹${product.price}`;
    if (productDescription) productDescription.textContent = product.description;

    const starSpan = document.querySelector(".rating .stars");
    if (starSpan) {
      const rating = product.rating || 0;
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStar;
      starSpan.textContent = "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
    }

    document.title = `${product.name} - BLOOMHER`;

    if (featuresBox) {
      let featuresHtml = '<h2 class="features-title">Key Features</h2>';
      let features = [];

      if (Array.isArray(product.features)) {
        features = product.features;
      } else if (typeof product.features === 'string' && product.features.trim() !== "") {
        features = product.features.split(/\r?\n|,/).map(f => f.trim()).filter(f => f !== "");
      }

      if (features.length === 0) {
        features = ["100% Certified Organic Cotton", "Breathable & Chemical-Free", "Ultra-Absorbent Core", "Eco-friendly & Biodegradable"];
      }

      features.forEach(f => {
        featuresHtml += `<div class="feature-item"><span class="checkmark">✓</span><span>${f}</span></div>`;
      });
      featuresBox.innerHTML = featuresHtml;
    }

    // Show content and hide loading
    if (loadingContent) loadingContent.style.display = "none";
    if (productContent) productContent.style.display = "block";

  } catch (err) {
    console.error("Error loading product:", err);
    if (loadingContent) {
      loadingContent.style.color = "red";
      loadingContent.textContent = "Error: " + err.message;
    }
  }
}

// COMMAND: Add to Cart - Saves item to cart via API
async function addToCart() {
  if (!userId) {
    alert("Please login first!");
    window.location.href = "./login.html";
    return;
  }

  let quantity = parseInt(quantityInput.value) || 1;
  if (quantity >= 99) {
    quantity = 98;
    quantityInput.value = 98;
  }

  try {
    const response = await fetch(`${CART_API_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ product_id: parseInt(productId), quantity }),
    });

    if (response.ok) {
      alert("Added to cart successfully!");
    } else if (response.status === 401) {
      alert("Session expired. Please login again.");
      window.location.href = "./login.html";
    } else {
      const errorData = await response.json();
      alert("Failed to add to cart: " + (errorData.detail || "Unknown error"));
    }
  } catch (error) {
    console.error("Network Error:", error);
    alert("Server error. Could not add to cart.");
  }
}

// COMMAND: Buy Now - LocalStorage prep and checkout redirect
async function buyNow() {
  if (!userId) {
    alert("Please login first!");
    window.location.href = "./login.html";
    return;
  }

  let quantity = (parseInt(quantityInput.value) || 1) >= 99 ? 98 : (parseInt(quantityInput.value) || 1);
  const selectedSize = document.querySelector('input[name="size"]:checked')?.value || "Regular";

  const productData = {
    id: productId,
    name: productName.textContent,
    image: productImage.src,
    selectedSize,
    quantity,
    price: parseFloat(productPrice.textContent.replace("₹", "")),
  };

  localStorage.setItem("selectedProduct", JSON.stringify(productData));
  localStorage.removeItem("checkoutMode");
  localStorage.removeItem("cartTotal");
  window.location.href = "./address.html";
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProductDetails();
  if (addToCartBtn) addToCartBtn.addEventListener("click", e => { e.preventDefault(); addToCart(); });
  if (buyNowBtn) buyNowBtn.addEventListener("click", e => { e.preventDefault(); buyNow(); });
});
