import type { ICategory } from "../../../types/category";
import type { Product } from "../../../types/product";
import type { Pedido } from "../../../types/pedido";
import { api } from "../../../utils/api";
import { checkAuth, logout } from "../../../utils/auth";

checkAuth("ADMIN");
document.getElementById("btn-logout")?.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", async () => {
    const [categorias, productos, pedidos] = await Promise.all([
        api.get<ICategory[]>("/categorias"),
        api.get<Product[]>("/productos"),
        api.get<Pedido[]>("/pedidos")
    ]);

    const catActivas = categorias.filter(c => !c.eliminado);
    const prodActivos = productos.filter(p => !p.eliminado);
    const prodDisponibles = prodActivos.filter(p => p.disponible);

    (document.getElementById("stat-categorias") as HTMLElement).textContent = String(catActivas.length);
    (document.getElementById("stat-productos") as HTMLElement).textContent = String(prodActivos.length);
    (document.getElementById("stat-pedidos") as HTMLElement).textContent = String(pedidos.length);
    (document.getElementById("stat-disponibles") as HTMLElement).textContent = String(prodDisponibles.length);

    const estadoCount = pedidos.reduce((acc: Record<string, number>, p) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1;
        return acc;
    }, {});

    (document.getElementById("summary-content") as HTMLElement).innerHTML = `
        <div class="summary-grid">
            <div><strong>Categorias activas:</strong> ${catActivas.length}</div>
            <div><strong>Productos activos:</strong> ${prodActivos.length}</div>
            <div><strong>Productos sin stock:</strong> ${prodActivos.filter(p => p.stock === 0).length}</div>
            <div><strong>Pedidos pendientes:</strong> ${estadoCount["PENDIENTE"] || 0}</div>
            <div><strong>Pedidos confirmados:</strong> ${estadoCount["CONFIRMADO"] || 0}</div>
            <div><strong>Pedidos terminados:</strong> ${estadoCount["TERMINADO"] || 0}</div>
        </div>
    `;
});