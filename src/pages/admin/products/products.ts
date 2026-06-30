import type { Product } from "../../../types/product";
import type { ICategory } from "../../../types/category";
import { api } from "../../../utils/api";
import { checkAuth, logout } from "../../../utils/auth";

checkAuth("ADMIN");
document.getElementById("btn-logout")?.addEventListener("click", logout);

let products: Product[] = [];
let categories: ICategory[] = [];
let editingId: number | null = null;

const loadData = async () => {
    [products, categories] = await Promise.all([api.get<Product[]>("/productos"), api.get<ICategory[]>("/categorias")]);
};
const getCatName = (id: number) => categories.find(c => c.id === id)?.nombre || "-";

const renderTable = () => {
    const tbody = document.getElementById("prod-table-body") as HTMLElement;
    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td><img src="${p.imagen || 'https://via.placeholder.com/50'}" width="50" style="border-radius:8px;" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td>${p.nombre}</td>
            <td>$${p.precio.toLocaleString("es-AR")}</td>
            <td>${getCatName(p.categoriaId)}</td>
            <td>${p.stock}</td>
            <td><span class="order-badge ${p.disponible ? "badge-confirmed" : "badge-cancelled"}">${p.disponible ? "Disponible" : "No disponible"}</span></td>
            <td>
                <button class="btn-edit" data-id="${p.id}">Editar</button>
                <button class="btn-delete" data-id="${p.id}">Eliminar</button>
            </td>
        </tr>`).join("");
    document.querySelectorAll(".btn-edit").forEach(b => b.addEventListener("click", () => openEdit(Number((b as HTMLElement).dataset.id))));
    document.querySelectorAll(".btn-delete").forEach(b => b.addEventListener("click", () => deleteProduct(Number((b as HTMLElement).dataset.id))));
};

const fillCatSelect = () => {
    const sel = document.getElementById("prod-cat") as HTMLSelectElement;
    sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
};

const openModal = () => { fillCatSelect(); (document.getElementById("prod-modal") as HTMLElement).style.display = "flex"; };
const closeModal = () => {
    (document.getElementById("prod-modal") as HTMLElement).style.display = "none";
    editingId = null;
    (document.getElementById("prod-modal-title") as HTMLElement).textContent = "Nuevo Producto";
    ["prod-nombre","prod-desc","prod-precio","prod-stock","prod-imagen"].forEach(id => (document.getElementById(id) as HTMLInputElement).value = "");
    (document.getElementById("prod-disponible") as HTMLInputElement).checked = true;
    (document.getElementById("prod-error") as HTMLElement).style.display = "none";
};

const openEdit = (id: number) => {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    editingId = id;
    (document.getElementById("prod-nombre") as HTMLInputElement).value = p.nombre;
    (document.getElementById("prod-desc") as HTMLTextAreaElement).value = p.descripcion || "";
    (document.getElementById("prod-precio") as HTMLInputElement).value = String(p.precio);
    (document.getElementById("prod-stock") as HTMLInputElement).value = String(p.stock);
    (document.getElementById("prod-imagen") as HTMLInputElement).value = p.imagen || "";
    (document.getElementById("prod-cat") as HTMLSelectElement).value = String(p.categoriaId);
    (document.getElementById("prod-disponible") as HTMLInputElement).checked = p.disponible;
    (document.getElementById("prod-modal-title") as HTMLElement).textContent = "Editar Producto";
    openModal();
};

const deleteProduct = async (id: number) => {
    const p = products.find(pr => pr.id === id);
    if (!p || !confirm(`Eliminar "${p.nombre}"?`)) return;
    
    await api.delete(`/productos/${id}`);
    
    products = products.filter(pr => pr.id !== id);
    renderTable();
    
    await loadData();
    renderTable();
};

document.getElementById("btn-new-prod")?.addEventListener("click", () => { editingId = null; openModal(); });
document.getElementById("close-prod-modal")?.addEventListener("click", closeModal);

document.getElementById("btn-save-prod")?.addEventListener("click", async () => {
    const nombre = (document.getElementById("prod-nombre") as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById("prod-desc") as HTMLTextAreaElement).value.trim();
    const precio = Number((document.getElementById("prod-precio") as HTMLInputElement).value);
    const stock = Number((document.getElementById("prod-stock") as HTMLInputElement).value);
    const categoriaId = Number((document.getElementById("prod-cat") as HTMLSelectElement).value);
    const imagen = (document.getElementById("prod-imagen") as HTMLInputElement).value.trim();
    const disponible = (document.getElementById("prod-disponible") as HTMLInputElement).checked;
    const errEl = document.getElementById("prod-error") as HTMLElement;
    if (!nombre || precio <= 0 || stock < 0 || !categoriaId) {
        errEl.textContent = "Completa todos los campos correctamente (precio > 0, stock >= 0).";
        errEl.style.display = "block"; return;
    }
    const payload = { nombre, descripcion, precio, stock, categoriaId, imagen, disponible };
    if (editingId !== null) await api.put<Product>(`/productos/${editingId}`, { id: editingId, ...payload });
    else await api.post<Product>("/productos", payload);
    await loadData();
    renderTable(); closeModal();
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadData();
    fillCatSelect();
    renderTable();
});
