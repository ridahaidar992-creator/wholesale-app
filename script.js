const API = "https://wholesale-app-k4mq.onrender.com";

let products = [];
let selectedProduct = null;

// LOAD PRODUCTS
async function loadProducts() {
  const res = await fetch(API + "/products");
  products = await res.json();
  render(products);
}

// RENDER PRODUCTS
function render(list) {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  list.forEach((p) => {
    container.innerHTML += `
      <div class="card" onclick="openModal(${p.id})">
        <img src="${p.image_url || ""}">
        <h3>${p.name}</h3>
        <p>$${p.price}</p>
      </div>
    `;
  });
}

// OPEN MODAL (FIXED)
function openModal(id) {
  selectedProduct = products.find(p => p.id === id);

  document.getElementById("modal").style.display = "flex";

  document.getElementById("m-img").src = selectedProduct.image_url || "";
  document.getElementById("m-name").innerText = selectedProduct.name;
  document.getElementById("m-desc").innerText = selectedProduct.description || "";
  document.getElementById("m-price").innerText = "$" + selectedProduct.price;
}

// CLOSE MODAL
function closeModal() {
  document.getElementById("modal").style.display = "none";
}

// ORDER
async function order() {
  const qty = document.getElementById("qty").value;

  if (!qty) {
    alert("Enter quantity");
    return;
  }

  await fetch(API + "/orders", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      product_name: selectedProduct.name,
      quantity: qty,
      price: selectedProduct.price
    })
  });

  const msg = `Hello, I want to order:

Product: ${selectedProduct.name}
Price: ${selectedProduct.price}
Quantity: ${qty}`;

  window.open(`https://wa.me/96181958288?text=${encodeURIComponent(msg)}`);
}

// LOAD ORDERS (ADMIN)
async function loadOrders(){
  const res = await fetch(API + "/orders");
  const data = await res.json();

  const container = document.getElementById("orders");
  if (!container) return;

  container.innerHTML = data.map(o => `
    <div class="card">
      <h3>${o.product_name}</h3>
      <p>Qty: ${o.quantity}</p>
      <p>$${o.price}</p>
    </div>
  `).join("");
}