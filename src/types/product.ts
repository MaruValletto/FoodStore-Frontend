import type { ICategory } from "./category";

export interface Product {
    id: number;
    nombre: string;
    precio: number;
    descripcion: string;
    stock: number;
    imagen: string;
    disponible: boolean;
    eliminado?: boolean;
    categoriaId: number;
    categoriaNombre?: string;
    categoria?: ICategory;
}

export interface CartItem extends Product {
    cantidad: number;
}
