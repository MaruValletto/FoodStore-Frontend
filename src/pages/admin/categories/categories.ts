import type { ICategory } from "../../../types/category";
import { api } from "../../../utils/api";
import { checkAuth, logout } from "../../../utils/auth";

checkAuth("ADMIN");
document.getElementById("btn-logout")?.addEventListener("click", logout);

let categories: ICategory[] = [];
let editingId: number | null = null;

const loadCategories = async () => {
    categories = await api.get<ICategory[]>("/categorias");
};

const renderTable = () => {
    const tbody = document.getElementById("cat-table-body") as HTMLElement;

    tbody.innerHTML = categories.map(c => `
        <tr>
            <td>${c.id}</td>
            <td>
                <img
                    src="${c.imagen || "/img/logo1.png"}"
                    class="admin-table-img"
                    onerror="this.src='/img/logo1.png'">
            </td>
            <td>${c.nombre}</td>
            <td>${c.descripcion || ""}</td>
            <td>
                <button class="btn-edit" data-id="${c.id}">Editar</button>
                <button class="btn-delete" data-id="${c.id}">Eliminar</button>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".btn-edit").forEach(btn =>
        btn.addEventListener("click", () =>
            openEdit(Number((btn as HTMLElement).dataset.id))
        )
    );

    document.querySelectorAll(".btn-delete").forEach(btn =>
        btn.addEventListener("click", () =>
            deleteCategory(Number((btn as HTMLElement).dataset.id))
        )
    );
};

const openModal = () => {
    (document.getElementById("cat-modal") as HTMLElement).style.display = "flex";
    (document.getElementById("cat-error") as HTMLElement).style.display = "none";
};

const closeModal = () => {
    (document.getElementById("cat-modal") as HTMLElement).style.display = "none";
    editingId = null;

    (document.getElementById("cat-nombre") as HTMLInputElement).value = "";
    (document.getElementById("cat-desc") as HTMLTextAreaElement).value = "";
    (document.getElementById("cat-imagen") as HTMLInputElement).value = "";
    (document.getElementById("modal-title") as HTMLElement).textContent = "Nueva Categoria";
};

const openEdit = (id: number) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;

    editingId = id;

    (document.getElementById("cat-nombre") as HTMLInputElement).value = cat.nombre;
    (document.getElementById("cat-desc") as HTMLTextAreaElement).value = cat.descripcion || "";
    (document.getElementById("cat-imagen") as HTMLInputElement).value = cat.imagen || "";
    (document.getElementById("modal-title") as HTMLElement).textContent = "Editar Categoria";

    openModal();
};

const deleteCategory = async (id: number) => {
    const cat = categories.find(c => c.id === id);
    if (!cat || !confirm(`Eliminar categoria "${cat.nombre}"?`)) return;

    await api.delete(`/categorias/${id}`);

    categories = categories.filter(c => c.id !== id);
    renderTable();

    await loadCategories();
    renderTable();
};

document.getElementById("btn-new-cat")?.addEventListener("click", () => {
    editingId = null;
    openModal();
});

document.getElementById("close-cat-modal")?.addEventListener("click", closeModal);

document.getElementById("btn-save-cat")?.addEventListener("click", async () => {
    const nombre = (document.getElementById("cat-nombre") as HTMLInputElement).value.trim();
    const descripcion = (document.getElementById("cat-desc") as HTMLTextAreaElement).value.trim();
    const imagen = (document.getElementById("cat-imagen") as HTMLInputElement).value.trim();

    const errEl = document.getElementById("cat-error") as HTMLElement;

    if (!nombre || !imagen) {
        errEl.textContent = "El nombre y la imagen son obligatorios.";
        errEl.style.display = "block";
        return;
    }

    const payload = { nombre, descripcion, imagen };

    if (editingId !== null) {
        await api.put<ICategory>(`/categorias/${editingId}`, {
            id: editingId,
            ...payload
        });
    } else {
        await api.post<ICategory>("/categorias", payload);
    }

    await loadCategories();
    renderTable();
    closeModal();
});

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    renderTable();
});