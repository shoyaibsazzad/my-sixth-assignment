
// ******API******

const API = {
  categories: "https://openapi.programming-hero.com/api/categories",
  category: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  plant: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

// ******DOM Elements*******

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
