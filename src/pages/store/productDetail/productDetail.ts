import type { Product, CartItem } from "../../../types/product";
import { api } from "../../../utils/api";

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id"));
const detailContent = document.getElementById("detail-content") as HTMLElement;
const cartBadge = document.getElementById("cart-badge") as HTMLElement;

const updateBadge = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cartBadge) cartBadge.textContent = String(cart.reduce((a, i) => a + i.cantidad, 0));
};

document.addEventListener("DOMContentLoaded", async () => {
    updateBadge();
    if (!productId) { detailContent.innerHTML = "<p>Producto no encontrado.</p>"; return; }
    const p = await api.get<Product>(`/productos/${productId}`);
    if (!p) { detailContent.innerHTML = "<p>Producto no encontrado.</p>"; return; }

    detailContent.innerHTML = `
        <a href="../home/home.html" class="btn-back">&larr; Volver al catalogo</a>
        <div class="detail-layout">
            <img src="${p.imagen || 'https://via.placeholder.com/500x350?text=Sin+imagen'}" alt="${p.nombre}" class="detail-img" onerror="this.src='https://via.placeholder.com/500x350?text=Sin+imagen'">
            <div class="detail-info">
                <h1>${p.nombre}</h1>
                <p class="detail-price">$${p.precio.toLocaleString("es-AR")}</p>
                <p class="detail-desc">${p.descripcion || ""}</p>
                <p class="detail-stock">Stock disponible: <strong>${p.stock}</strong></p>
                ${p.disponible && p.stock > 0 ? `
                <div class="qty-selector">
                    <label>Cantidad:</label>
                    <button id="btn-minus">-</button>
                    <span id="qty-display">1</span>
                    <button id="btn-plus">+</button>
                </div>
                <button id="btn-add-cart" class="btn-primary">Agregar al carrito</button>
                <p id="confirm-msg" class="confirm-msg" style="display:none;">Producto agregado al carrito!</p>
                ` : `<p class="badge-unavailable">No disponible</p>`}
            </div>
        </div>`;

    let qty = 1;
    const qtyDisplay = document.getElementById("qty-display") as HTMLElement;
    document.getElementById("btn-minus")?.addEventListener("click", () => { if (qty > 1) { qty--; qtyDisplay.textContent = String(qty); } });
    document.getElementById("btn-plus")?.addEventListener("click", () => { if (qty < p.stock) { qty++; qtyDisplay.textContent = String(qty); } });
    document.getElementById("btn-add-cart")?.addEventListener("click", () => {
        const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(i => i.id === p.id);
        if (existing) existing.cantidad += qty;
        else cart.push({ ...p, cantidad: qty });
        localStorage.setItem("cart", JSON.stringify(cart));
        updateBadge();
        const msg = document.getElementById("confirm-msg") as HTMLElement;
        msg.style.display = "block";
        setTimeout(() => msg.style.display = "none", 2000);
    });
});
