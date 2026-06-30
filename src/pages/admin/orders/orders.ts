import type { Pedido } from "../../../types/pedido";
import type { IUser } from "../../../types/IUser";
import { api } from "../../../utils/api";
import { checkAuth, logout } from "../../../utils/auth";

checkAuth("ADMIN");
document.getElementById("btn-logout")?.addEventListener("click", logout);

let ALL_PEDIDOS: Pedido[] = [];
let ALL_USERS: IUser[] = [];

const statusColors: Record<string, string> = {
    PENDIENTE: "badge-pending",
    CONFIRMADO: "badge-confirmed",
    TERMINADO: "badge-done",
    CANCELADO: "badge-cancelled"
};

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

const getClientName = (id?: number) => {
    const u = ALL_USERS.find(u => u.id === id);
    return u ? `${u.nombre} ${u.apellido}` : `Usuario #${id || "-"}`;
};

const prodName = (d: any) =>
    d.productoNombre || d.nombreProducto || `Producto #${d.productoId || d.idProducto}`;

const renderOrders = () => {
    const filterVal = (document.getElementById("filter-estado") as HTMLSelectElement).value;
    const list = document.getElementById("orders-list") as HTMLElement;

    const filtered = filterVal
        ? ALL_PEDIDOS.filter(p => p.estado === filterVal)
        : [...ALL_PEDIDOS];

    filtered.sort((a, b) =>
        new Date(String(b.fecha)).getTime() - new Date(String(a.fecha)).getTime()
    );

    if (filtered.length === 0) {
        list.innerHTML = "<p>No hay pedidos con ese estado.</p>";
        return;
    }

    list.innerHTML = filtered.map(p => `
        <div class="order-card">
            <div class="order-card-header">
                <span class="order-id">Pedido #${p.id}</span>
                <span class="order-badge ${statusColors[p.estado]}">${p.estado}</span>
            </div>

            <p><strong>Cliente:</strong> ${getClientName(p.usuarioId || p.idUsuario)}</p>
            <p class="order-date">${formatDate(String(p.fecha))}</p>
            <p>${p.detalles.length} producto(s)</p>

            <div class="order-footer">
                <strong>$${p.total.toLocaleString("es-AR")}</strong>
                <button class="btn-detail" data-id="${p.id}">Ver detalle</button>
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".btn-detail").forEach(btn =>
        btn.addEventListener("click", () => {
            const pedido = ALL_PEDIDOS.find(p =>
                String(p.id) === (btn as HTMLElement).dataset.id
            );

            if (pedido) showModal(pedido);
        })
    );
};

const showModal = (p: Pedido) => {
    const content = document.getElementById("order-modal-content") as HTMLElement;
    const estados = ["PENDIENTE", "CONFIRMADO", "TERMINADO", "CANCELADO"];

    content.innerHTML = `
        <h3>Pedido #${p.id}</h3>

        <p><strong>Cliente:</strong> ${getClientName(p.usuarioId || p.idUsuario)}</p>
        <p><strong>Fecha:</strong> ${formatDate(String(p.fecha))}</p>
        <p><strong>Forma de pago:</strong> ${p.formaPago}</p>

        <h4>Productos</h4>

        ${p.detalles.map(d => `
            <div class="order-detail-row">
                <span>${prodName(d)} x${d.cantidad}</span>
                <span>$${d.subtotal.toLocaleString("es-AR")}</span>
            </div>
        `).join("")}

        <div class="summary-total">
            <span>Total</span>
            <strong>$${p.total.toLocaleString("es-AR")}</strong>
        </div>

        <div class="form-group" style="margin-top:16px;">
            <label>Cambiar estado:</label>
            <select id="change-estado">
                ${estados.map(e =>
                    `<option value="${e}" ${e === p.estado ? "selected" : ""}>${e}</option>`
                ).join("")}
            </select>
        </div>

        <button id="btn-update-estado" class="btn-primary btn-full" data-id="${p.id}">
            Actualizar estado
        </button>
    `;

    document.getElementById("btn-update-estado")?.addEventListener("click", async () => {
        const newEstado = (document.getElementById("change-estado") as HTMLSelectElement).value;

        try {
            const actualizado = await api.patch<Pedido>(
                `/pedidos/${p.id}/estado?estado=${newEstado}`
            );

            ALL_PEDIDOS = ALL_PEDIDOS.map(pedido =>
                pedido.id === actualizado.id ? actualizado : pedido
            );

            await loadOrders();
            renderOrders();

            (document.getElementById("order-modal") as HTMLElement).style.display = "none";

            alert(`Estado actualizado correctamente a ${actualizado.estado}.`);
        } catch {
            alert("No se pudo actualizar el estado del pedido. Verificá que el backend esté corriendo.");
        }
    });

    (document.getElementById("order-modal") as HTMLElement).style.display = "flex";
};

const loadOrders = async () => {
    [ALL_PEDIDOS, ALL_USERS] = await Promise.all([
        api.get<Pedido[]>("/pedidos"),
        api.get<IUser[]>("/usuarios")
    ]);
};

document.getElementById("close-order-modal")?.addEventListener("click", () => {
    (document.getElementById("order-modal") as HTMLElement).style.display = "none";
});

document.getElementById("filter-estado")?.addEventListener("change", renderOrders);

document.addEventListener("DOMContentLoaded", async () => {
    await loadOrders();
    renderOrders();
});