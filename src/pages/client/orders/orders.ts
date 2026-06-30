import type { Pedido } from "../../../types/pedido";
import { api } from "../../../utils/api";
import { getUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { logout } from "../../../utils/auth";

const user = getUser();
if (!user) navigate("/src/pages/auth/login/login.html");

document.getElementById("btn-logout")?.addEventListener("click", logout);

const statusColors: Record<string, string> = { PENDIENTE: "badge-pending", CONFIRMADO: "badge-confirmed", TERMINADO: "badge-done", CANCELADO: "badge-cancelled" };
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
const prodName = (d: any) => d.productoNombre || d.nombreProducto || `Producto #${d.productoId || d.idProducto}`;

const renderOrders = (pedidos: Pedido[]) => {
    const list = document.getElementById("orders-list") as HTMLElement;
    const filterVal = (document.getElementById("filter-estado") as HTMLSelectElement).value;
    const filtered = filterVal ? pedidos.filter(p => p.estado === filterVal) : pedidos;
    if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-cart"><p>No tenes pedidos${filterVal ? " con ese estado" : ""}.</p><a href="../../store/home/home.html" class="btn-primary">Ir al catalogo</a></div>`;
        return;
    }
    list.innerHTML = filtered.map(p => `
        <div class="order-card" data-id="${p.id}">
            <div class="order-card-header">
                <span class="order-id">Pedido #${p.id}</span>
                <span class="order-badge ${statusColors[p.estado] || ""}">${p.estado}</span>
            </div>
            <p class="order-date">${formatDate(String(p.fecha))}</p>
            <p class="order-summary">${p.detalles.slice(0, 3).map(prodName).join(", ")}${p.detalles.length > 3 ? "..." : ""}</p>
            <div class="order-footer">
                <strong>$${p.total.toLocaleString("es-AR")}</strong>
                <button class="btn-detail" data-id="${p.id}">Ver detalle</button>
            </div>
        </div>`).join("");
    document.querySelectorAll(".btn-detail").forEach(btn => btn.addEventListener("click", () => {
        const pedido = filtered.find(p => String(p.id) === (btn as HTMLElement).dataset.id);
        if (pedido) showModal(pedido);
    }));
};

const showModal = (p: Pedido) => {
    const content = document.getElementById("order-modal-content") as HTMLElement;
    content.innerHTML = `
        <h3>Pedido #${p.id}</h3>
        <p><strong>Fecha:</strong> ${formatDate(String(p.fecha))}</p>
        <p><strong>Estado:</strong> <span class="order-badge ${statusColors[p.estado]}">${p.estado}</span></p>
        <p><strong>Forma de pago:</strong> ${p.formaPago}</p>
        <h4>Productos</h4>
        ${p.detalles.map(d => `<div class="order-detail-row"><span>${prodName(d)} x${d.cantidad}</span><span>$${d.subtotal.toLocaleString("es-AR")}</span></div>`).join("")}
        <div class="summary-total"><span>Total</span><strong>$${p.total.toLocaleString("es-AR")}</strong></div>`;
    (document.getElementById("order-modal") as HTMLElement).style.display = "flex";
};

document.getElementById("close-order-modal")?.addEventListener("click", () => { (document.getElementById("order-modal") as HTMLElement).style.display = "none"; });
document.getElementById("filter-estado")?.addEventListener("change", () => renderOrders(ALL_PEDIDOS));

let ALL_PEDIDOS: Pedido[] = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const pedidos = await api.get<Pedido[]>(`/pedidos`);
        console.log("Pedidos desde API:", pedidos);
        ALL_PEDIDOS = pedidos.filter(p => (p.usuarioId || p.idUsuario) === user!.id);
        renderOrders(ALL_PEDIDOS);
    } catch {
        document.getElementById("orders-list")!.innerHTML = "<p>Error al cargar pedidos desde la API.</p>";
    }
});
