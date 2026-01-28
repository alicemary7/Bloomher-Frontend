const API_URL = `${window.API_BASE_URL}/products`;
const CART_API_URL = `${window.API_BASE_URL}/cart`;
const productsGrid = document.querySelector(".products-grid");

const userId = localStorage.getItem("user_id");
const token = localStorage.getItem("access_token");

// COMMAND: Get Rating Stars - Converts numerical rating to star icons
function getRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return "★".repeat(fullStars) + (halfStar ? "½" : "") + "☆".repeat(emptyStars);
}

// COMMAND: Fetch Products - Loads all products into the grid
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");

    const products = await response.json();
    productsGrid.innerHTML = "";

    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");

      const pageLink = `./product_detail.html?id=${product.id}`;

      productCard.innerHTML = `
        <div class="product-image">
          <a href="${pageLink}">
            <img src="${product.image_url}" height="330px" alt="${product.name}" />
          </a>
        </div>
        <div class="product-info">
          <h3><a href="${pageLink}" style="text-decoration: none; color: inherit;">${product.name}</a></h3>
          <div class="product-rating" style="color: #ffc107; margin-bottom: 10px;">
            <span class="stars">${getRatingStars(product.rating || 0)}</span>
          </div>
          <p>${product.description}</p>
          <div class="product-price">₹${product.price}</div>
          <div style="display: flex; justify-content: space-between">
            <button class="btn-add-cart" style="width: 150px" onclick="addToCart(${product.id})">
              Add to Cart
            </button>
            <button class="btn-buy" style="width: 150px" onclick="buyNow(${product.id})">
              Buy Now
            </button>
          </div>
        </div>
      `;
      productsGrid.appendChild(productCard);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    productsGrid.innerHTML =
      "<p>Failed to load products. Please try again later.</p>";
  }
}

// COMMAND: Add to Cart - Saves product to user's cart
async function addToCart(productId) {
  if (!userId) {
    showToast("Please login to add items to cart!", "info");
    window.location.href = "./login.html";
    return;
  }

  try {
    const response = await fetch(`${CART_API_URL}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ product_id: productId, quantity: 1 }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        showToast("Session expired. Please login again.", "error");
        window.location.href = "./login.html";
        return;
      }
      throw new Error("Failed to add to cart");
    }

    showToast("Item added to cart successfully!", "success");
  } catch (error) {
    console.error("Error adding to cart:", error);
    showToast("Failed to add item to cart.", "error");
  }
}

// COMMAND: Buy Now - Direct checkout for a single product
async function buyNow(productId) {
  if (!userId) {
    showToast("Please login first!", "info");
    window.location.href = "./login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/${productId}`);
    const product = await res.json();

    const productData = {
      id: product.id,
      name: product.name,
      image: product.image_url,
      selectedSize: "Regular",
      quantity: 1,
      price: product.price,
    };

    localStorage.setItem("selectedProduct", JSON.stringify(productData));
    window.location.href = "./address.html";
  } catch (err) {
    console.error("Error preparing buy now:", err);
  }
}

fetchProducts();
