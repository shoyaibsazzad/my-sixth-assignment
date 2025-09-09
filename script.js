

//*******API endpoints******
const API = {
  categories: "https://openapi.programming-hero.com/api/categories",
  category: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  plant: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

// ******* DOM elements******
const categoriesEl = document.getElementById("categories");
const treesEl = document.getElementById("trees");
const cartEl = document.getElementById("cart");
const totalEl = document.getElementById("total");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModalBtn = document.getElementById("closeModal");


let activeCategoryId = null;
let cart = []; 
let total = 0;

// *****loading spinner*****

function showSpinner(container) {
  container.innerHTML = `
    <div class="flex justify-center items-center py-8">
      <div class="w-10 h-10 border-4 border-dashed rounded-full animate-spin" aria-hidden="true"></div>
    </div>
  `;
}

function formatMoney(n) {
  const num = Number(n) || 0;
  return `$${num.toLocaleString()}`;
}

function safeGet(obj, ...keys) {
  
  for (const k of keys) {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) return obj[k];
  }
  return undefined;
}

// ******Load categories & render buttons******
async function loadCategories() {
  categoriesEl.innerHTML = "";
  showSpinner(categoriesEl);

  try {
    const res = await fetch(API.categories);
    const json = await res.json();
    const categories = safeGet(json, "data", "categories") || [];

    categoriesEl.innerHTML = "";

    if (categories.length === 0) {
      categoriesEl.innerHTML = `<p class="text-sm text-gray-600">No categories found.</p>`;
      return;
    }

    categories.forEach((cat, idx) => {
      
      const id = safeGet(cat, "category_id", "id", "_id") || idx;
      const name = safeGet(cat, "category", "name", "title") || `Category ${idx + 1}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.id = id;
      btn.textContent = name;
      btn.className = "block w-full px-4 py-2 rounded-lg mb-2 text-left text-sm";
      btn.classList.add("bg-green-200", "hover:bg-green-300");

      btn.addEventListener("click", () => {
        if (String(activeCategoryId) === String(id)) return;
        activeCategoryId = id;
        setActiveCategoryButton();
        loadTreesByCategory(id);
      });

      categoriesEl.appendChild(btn);

      // *****auto-load first*****
      if (idx === 0 && activeCategoryId === null) {
        activeCategoryId = id;
      }
    });

    setActiveCategoryButton();

    if (activeCategoryId !== null) loadTreesByCategory(activeCategoryId);
  } catch (err) {
    console.error("Failed to load categories:", err);
    categoriesEl.innerHTML = `<p class="text-sm text-red-600">Failed to load categories.</p>`;
  }
}

function setActiveCategoryButton() {
  const btns = categoriesEl.querySelectorAll("button");
  btns.forEach((b) => {
    if (String(b.dataset.id) === String(activeCategoryId)) {
      b.classList.remove("bg-green-200", "text-gray-800");
      b.classList.add("bg-green-600", "text-white");
    } else {
      b.classList.remove("bg-green-600", "text-white");
      b.classList.add("bg-green-200");
    }
  });
}

// *****Load trees for chosen category*****
async function loadTreesByCategory(catId) {
  treesEl.innerHTML = "";
  showSpinner(treesEl);

  try {
    const res = await fetch(API.category(catId));
    const json = await res.json();
    const trees = safeGet(json, "data", "plants", "items") || [];

    treesEl.innerHTML = "";

    if (!Array.isArray(trees) || trees.length === 0) {
      treesEl.innerHTML = `<div class="col-span-full text-center text-gray-600 py-8">No trees found.</div>`;
      return;
    }

    // *****render cards****
    trees.forEach((t) => {
      
      const id = safeGet(t, "id", "plant_id", "_id");
      const name = safeGet(t, "plant_name", "name", "title") || "Unknown Plant";
      const img = safeGet(t, "image", "img", "thumbnail") || "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?q=80&w=1887&auto=format&fit=crop";
      const desc = safeGet(t, "description", "short_description", "about") || "A lovely tree to plant.";
      const category = safeGet(t, "category", "category_name") || "";
      const price = Number(safeGet(t, "price", "cost")) || 0;

      const card = document.createElement("div");
      card.className = "bg-white p-4 rounded-lg shadow flex flex-col";

      card.innerHTML = `
        <figure class="mb-3 overflow-hidden rounded-md aspect-[4/3]">
          <img src="${img}" alt="${name}" class="object-cover w-full h-full" />
        </figure>
        <h3 class="text-base md:text-lg font-semibold text-green-800 hover:underline cursor-pointer mb-2" data-id="${id}">${name}</h3>
        <p class="text-sm text-gray-600 line-clamp-2 mb-2">${desc}</p>
        <div class="flex justify-between items-center text-sm text-gray-700 mb-3">
          <span class="opacity-80">${category}</span>
          <span class="font-semibold">${formatMoneyForCard(price)}</span>
        </div>
        <button class="btn-add-to-cart mt-auto px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Add to Cart</button>
      `;

      // ****** modal*****
      card.querySelector("h3").addEventListener("click", () => openPlantModal(id));

      // *****add to cart*****
      card.querySelector(".btn-add-to-cart").addEventListener("click", () => {
        addToCart({ id, name, price });
      });

      treesEl.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load trees:", err);
    treesEl.innerHTML = `<p class="text-sm text-red-600">Failed to load trees.</p>`;
  }
}

function formatMoneyForCard(n) {
  return `$${(Number(n) || 0)}`;
}

// **** plant details and show ****
async function openPlantModal(id) {
  modalContent.innerHTML = "";
  modal.classList.remove("hidden");
  showSpinner(modalContent);

  try {
    const res = await fetch(API.plant(id));
    const json = await res.json();
    const p = safeGet(json, "data", "plant") || json || {};

    const name = safeGet(p, "plant_name", "name", "title") || "Plant";
    const img = safeGet(p, "image", "img", "thumbnail") || "";
    const desc = safeGet(p, "description", "about") || "No description available.";
    const price = Number(safeGet(p, "price", "cost")) || 0;
    const category = safeGet(p, "category", "category_name") || "";

    modalContent.innerHTML = `
      <div class="space-y-3">
        <div class="grid md:grid-cols-2 gap-4">
          <img src="${img}" alt="${name}" class="rounded-md w-full h-48 object-cover" />
          <div>
            <h3 class="text-xl font-bold text-green-800">${name}</h3>
            <p class="text-sm text-gray-700 mt-2">${desc}</p>
            <div class="mt-3 text-sm text-gray-700">Category: <span class="font-medium">${category}</span></div>
            <div class="mt-2 font-semibold">Price: ${formatMoneyForCard(price)}</div>
            <div class="mt-4">
              <button id="modalAddBtn" class="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalAddBtn = document.getElementById("modalAddBtn");
    modalAddBtn?.addEventListener("click", () => {
      addToCart({ id, name, price });
      closeModal();
    });
  } catch (err) {
    console.error("Failed to load plant:", err);
    modalContent.innerHTML = `<p class="text-sm text-red-600">Failed to load details.</p>`;
  }
}

function closeModal() {
  modal.classList.add("hidden");
}
closeModalBtn?.addEventListener("click", closeModal);

modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// *****Cart functions***
function addToCart(item) {
  cart.push(item);
  total += Number(item.price || 0);
  renderCart();
}

function removeFromCart(index) {
  const it = cart[index];
  if (!it) return;
  total -= Number(it.price || 0);
  cart.splice(index, 1);
  renderCart();
}

function renderCart() {
  cartEl.innerHTML = "";

  if (!cart.length) {
    cartEl.innerHTML = `<p class="text-sm text-gray-600">Your cart is empty.</p>`;
    totalEl.textContent = "0";
    return;
  }

  cart.forEach((it, idx) => {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between gap-3 border-b py-2";
    li.innerHTML = `
      <div class="text-sm truncate">${it.name}</div>
      <div class="flex items-center gap-3">
        <div class="text-sm font-medium">${formatMoneyForCard(it.price)}</div>
        <button class="text-red-600 remove-btn" aria-label="Remove">❌</button>
      </div>
    `;
    li.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(idx));
    cartEl.appendChild(li);
  });

  totalEl.textContent = Number(total).toLocaleString();
}

//  ****Init*****
(function init() {
  
  if (!categoriesEl || !treesEl || !cartEl || !totalEl || !modal || !modalContent || !closeModalBtn) {
    console.error("");
    return;
  }

  loadCategories();
})();
