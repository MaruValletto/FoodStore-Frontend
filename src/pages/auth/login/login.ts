import type { IUser } from "../../../types/IUser";
import { saveUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { api } from "../../../utils/api";

const form = document.getElementById("login-form") as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const mail = (document.getElementById("email") as HTMLInputElement).value.trim();
    const contrasena = (document.getElementById("password") as HTMLInputElement).value;
    try {
        const user = await api.post<IUser>("/usuarios/login", { mail, contrasena });
        saveUser({ ...user, loggedIn: true });
        if (user.rol === "ADMIN") navigate("/src/pages/admin/adminHome/adminHome.html");
        else navigate("/src/pages/store/home/home.html");
    } catch {
        errorMsg.textContent = "Email o contraseña incorrectos.";
        errorMsg.style.display = "block";
    }
});
