import type { Rol } from "../types/Rol";
import { getUser, removeUser } from "./localStorage";
import { navigate } from "./navigate";

export const checkAuth = (rol: Rol) => {
  const user = getUser();
  if (!user || !user.rol) {
    navigate("/src/pages/auth/login/login.html");
    return false;
  }
  if (user.rol !== rol) {
    if (user.rol === "ADMIN") navigate("/src/pages/admin/adminHome/adminHome.html");
    else navigate("/src/pages/store/home/home.html");
    return false;
  }
  return true;
};

export const logout = () => {
  removeUser();
  navigate("/src/pages/auth/login/login.html");
};
