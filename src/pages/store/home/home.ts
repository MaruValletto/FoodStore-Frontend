import type { Product, CartItem } from "../../../types/product";
import type { ICategory } from "../../../types/category";
import { api } from "../../../utils/api";
import { getUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { logout } from "../../../utils/auth";

const user = getUser();
if (!user) navigate("/src/pages/auth/login/login.html");

let ALL_PRODUCTS: Product[] = [];
let ALL_CATEGORIES: ICategory[] = [];

const productGrid = document.getElementById("product-grid") as HTMLElement;
const categoryList = document.getElementById("category-list") as HTMLElement;
const searchInput = document.getElementById("search-input") as HTMLInputElement;
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
const cartBadge = document.getElementById("cart-badge") as HTMLElement;
const userNameEl = document.getElementById("user-name") as HTMLElement;
const btnLogout = document.getElementById("btn-logout") as HTMLElement;

if (userNameEl && user) userNameEl.textContent = user.nombre;
btnLogout?.addEventListener("click", logout);

const categoryIcons: Record<string, string> = { "Pizzas": "🍕", "Hamburguesas": "🍔", "Bebidas": "🥤", "Postres": "🍰", "Empanadas": "🥟", "Ensaladas": "🥗" };

const updateCartBadge = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cartBadge) cartBadge.textContent = String(cart.reduce((acc, item) => acc + item.cantidad, 0));
};

const renderProducts = (list: Product[]) => {
    productGrid.innerHTML = "";
    if (list.length === 0) { productGrid.innerHTML = `<p class="no-results">No se encontraron productos.</p>`; return; }
    list.forEach(p => {
        const cat = ALL_CATEGORIES.find(c => c.id === p.categoriaId);
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${p.imagen || 'https://via.placeholder.com/300x200?text=Sin+imagen'}" alt="${p.nombre}" class="product-img" onerror="this.src='https://via.placeholder.com/300x200?text=Sin+imagen'">
            <div class="product-info">
                <span class="product-category-tag">${cat?.nombre || p.categoriaNombre || ""}</span>
                <h3>${p.nombre}</h3>
                <p>${p.descripcion || ""}</p>
                <div class="product-footer">
                    <span class="price">$${p.precio.toLocaleString("es-AR")}</span>
                    ${p.disponible && p.stock > 0 ? `<button class="btn-add" data-id="${p.id}">Agregar</button>` : `<span class="badge-unavailable">Sin stock</span>`}
                </div>
            </div>`;
        productGrid.appendChild(card);
    });
};

const getSortedProducts = (list: Product[]): Product[] => {
    const val = sortSelect?.value || "default";
    if (val === "az") return [...list].sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (val === "za") return [...list].sort((a, b) => b.nombre.localeCompare(a.nombre));
    if (val === "asc") return [...list].sort((a, b) => a.precio - b.precio);
    if (val === "desc") return [...list].sort((a, b) => b.precio - a.precio);
    return list;
};

const filterAndRender = (catId?: number) => {
    let filtered = ALL_PRODUCTS.filter(p => p.disponible);
    if (catId) filtered = filtered.filter(p => p.categoriaId === catId);
    const term = searchInput?.value.toLowerCase() || "";
    if (term) filtered = filtered.filter(p => p.nombre.toLowerCase().includes(term));
    renderProducts(getSortedProducts(filtered));
};

const renderCategories = () => {
    categoryList.innerHTML = "";
    const all = document.createElement("div");
    all.innerHTML = "🍽️ Todos los productos";
    all.className = "category-card-item active";
    all.addEventListener("click", () => { document.querySelectorAll(".category-card-item").forEach(el => el.classList.remove("active")); all.classList.add("active"); filterAndRender(); });
    categoryList.appendChild(all);
    ALL_CATEGORIES.forEach(cat => {
        const card = document.createElement("div");
        card.innerHTML = `${categoryIcons[cat.nombre] || "🏷️"} ${cat.nombre}`;
        card.className = "category-card-item";
        card.addEventListener("click", () => { document.querySelectorAll(".category-card-item").forEach(el => el.classList.remove("active")); card.classList.add("active"); filterAndRender(cat.id); });
        categoryList.appendChild(card);
    });
};

const addToCart = (productId: number) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const product = ALL_PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(i => i.id === productId);
    if (existing) existing.cantidad += 1;
    else cart.push({ ...product, cantidad: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    const btn = productGrid.querySelector(`[data-id="${productId}"]`) as HTMLElement;
    if (btn) { btn.textContent = "Agregado!"; setTimeout(() => btn.textContent = "Agregar", 1000); }
};

productGrid.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("btn-add")) addToCart(Number(target.dataset.id));
});
searchInput?.addEventListener("input", () => filterAndRender());
sortSelect?.addEventListener("change", () => filterAndRender());

document.addEventListener("DOMContentLoaded", async () => {
    try {
        [ALL_PRODUCTS, ALL_CATEGORIES] = await Promise.all([api.get<Product[]>("/productos"), api.get<ICategory[]>("/categorias")]);
        renderCategories(); filterAndRender(); updateCartBadge();
    } catch {
        productGrid.innerHTML = `<p class="no-results">Error al conectar con la API. Verificá que el backend esté corriendo en http://localhost:8080.</p>`;
    }
});
