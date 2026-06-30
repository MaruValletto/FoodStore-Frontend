import type { CartItem } from "../../../types/product";
import { getUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";

const ENVIO = 0;

const user = getUser();
if (!user) navigate("/src/pages/auth/login/login.html");

const cartItemsContainer = document.getElementById("cart-items") as HTMLElement;
const totalLabel = document.getElementById("cart-total-amount") as HTMLElement;
const subtotalLabel = document.getElementById("cart-subtotal") as HTMLElement;
const emptyMsg = document.getElementById("empty-cart-msg") as HTMLElement;
const cartContent = document.getElementById("cart-content") as HTMLElement;
const cartNavCount = document.getElementById("cart-nav-count") as HTMLElement;

const getImagen = (item: CartItem): string => {
    return item.imagen || (item as any).imagenUrl || (item as any).image || "/img/logo1.png";
};

const renderCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

    if (cartNavCount) {
        cartNavCount.textContent = String(cart.reduce((a, i) => a + i.cantidad, 0));
    }

    if (cart.length === 0) {
        emptyMsg.style.display = "block";
        cartContent.style.display = "none";
        return;
    }

    cartContent.style.display = "flex";
    emptyMsg.style.display = "none";
    cartItemsContainer.innerHTML = "";

    let subtotal = 0;

    cart.forEach(item => {
        const itemSubtotal = item.precio * item.cantidad;
        const imagen = getImagen(item);
        subtotal += itemSubtotal;

        const div = document.createElement("div");
        div.className = "cart-card-item";

        div.innerHTML = `
            <img src="${imagen}" alt="${item.nombre}" class="cart-card-img" onerror="this.src='/img/logo1.png'">
            <div class="cart-card-details">
                <h4>${item.nombre}</h4>
                <span class="cart-card-price">$${item.precio.toLocaleString("es-AR")}</span>
            </div>
            <div class="cart-card-actions">
                <button class="btn-qty btn-minus" data-id="${item.id}">-</button>
                <span class="cart-qty-num">${item.cantidad}</span>
                <button class="btn-qty btn-plus" data-id="${item.id}">+</button>
                <button class="btn-remove-item" data-id="${item.id}">🗑️</button>
            </div>
            <div class="cart-card-subtotal">
                <span>Subtotal</span>
                <strong>$${itemSubtotal.toLocaleString("es-AR")}</strong>
            </div>
        `;

        cartItemsContainer.appendChild(div);
    });

    const total = subtotal + ENVIO;

    if (subtotalLabel) {
        subtotalLabel.textContent = `$${subtotal.toLocaleString("es-AR")}`;
    }

    if (totalLabel) {
        totalLabel.textContent = `$${total.toLocaleString("es-AR")}`;
    }

    const modalTotal = document.getElementById("modal-total") as HTMLElement | null;
    if (modalTotal) {
        modalTotal.textContent = `$${total.toLocaleString("es-AR")}`;
    }
};

cartItemsContainer.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const id = Number(target.dataset.id);

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");

    if (target.classList.contains("btn-plus")) {
        const item = cart.find(i => i.id === id);
        if (item) item.cantidad++;
    } else if (target.classList.contains("btn-minus")) {
        const idx = cart.findIndex(i => i.id === id);
        if (idx !== -1) {
            cart[idx].cantidad--;
            if (cart[idx].cantidad <= 0) {
                cart.splice(idx, 1);
            }
        }
    } else if (target.classList.contains("btn-remove-item")) {
        const idx = cart.findIndex(i => i.id === id);
        if (idx !== -1) {
            cart.splice(idx, 1);
        }
    } else {
        return;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
});

document.getElementById("btn-clear-cart")?.addEventListener("click", () => {
    localStorage.removeItem("cart");
    renderCart();
});

document.getElementById("btn-checkout")?.addEventListener("click", () => {
    const modal = document.getElementById("checkout-modal") as HTMLElement | null;
    if (modal) modal.style.display = "flex";
});

document.getElementById("close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("checkout-modal") as HTMLElement | null;
    if (modal) modal.style.display = "none";
});

document.getElementById("btn-confirm-order")?.addEventListener("click", async () => {
    const tel = (document.getElementById("checkout-tel") as HTMLInputElement).value.trim();
    const dir = (document.getElementById("checkout-dir") as HTMLInputElement).value.trim();
    const pago = (document.getElementById("checkout-pago") as HTMLSelectElement).value;
    const errEl = document.getElementById("checkout-error") as HTMLElement;

    if (!tel || !dir || !pago) {
        errEl.textContent = "Por favor complete todos los campos.";
        errEl.style.display = "block";
        return;
    }

    errEl.style.display = "none";

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const subtotal = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);
    const total = subtotal + ENVIO;

    const pedido = {
        formaPago: pago,
        usuarioId: user!.id,
        detalles: cart.map(i => ({
            productoId: i.id,
            cantidad: i.cantidad
        }))
    };

    let pedidoConfirmado: any;

    try {
        const { api } = await import("../../../utils/api");
        pedidoConfirmado = await api.post("/pedidos", pedido);
    } catch {
        errEl.textContent = "No se pudo confirmar el pedido. Verificá stock y conexión con la API.";
        errEl.style.display = "block";
        return;
    }

    localStorage.removeItem("cart");

    alert(
        `Pedido ${pedidoConfirmado.id} confirmado!\nTotal: $${Number(pedidoConfirmado.total || total).toLocaleString("es-AR")}\nEstado: PENDIENTE`
    );

    navigate("/src/pages/client/orders/orders.html");
});

document.addEventListener("DOMContentLoaded", renderCart);