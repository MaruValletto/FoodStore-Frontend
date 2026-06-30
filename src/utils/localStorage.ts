import type { IUser } from "../types/IUser";

export const saveUser = (user: IUser) => {
  localStorage.setItem("userData", JSON.stringify(user));
};
export const getUser = (): IUser | null => {
  const data = localStorage.getItem("userData");
  return data ? JSON.parse(data) : null;
};
export const removeUser = () => {
  localStorage.removeItem("userData");
};
// Cart
export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart") || "[]");
};
export const saveCart = (cart: any[]) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};
export const clearCart = () => {
  localStorage.removeItem("cart");
};
