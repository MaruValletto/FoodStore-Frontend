import type { IUser } from "../../../types/IUser";
import { saveUser } from "../../../utils/localStorage";
import { navigate } from "../../../utils/navigate";
import { api } from "../../../utils/api";

const form = document.getElementById("registro-form") as HTMLFormElement;
const errorMsg = document.getElementById("error-msg") as HTMLElement;

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = (document.getElementById("nombre") as HTMLInputElement).value.trim();
    const apellido = (document.getElementById("apellido") as HTMLInputElement).value.trim();
    const mail = (document.getElementById("email") as HTMLInputElement).value.trim();
    const contrasena = (document.getElementById("password") as HTMLInputElement).value;

    if (contrasena.length < 6) {
        errorMsg.textContent = "La contraseña debe tener al menos 6 caracteres.";
        errorMsg.style.display = "block";
        return;
    }
    try {
        const nuevoUsuario = await api.post<IUser>("/usuarios/registro", { nombre, apellido, mail, contrasena, rol: "USUARIO" });
        saveUser({ ...nuevoUsuario, loggedIn: true });
        navigate("/src/pages/store/home/home.html");
    } catch {
        errorMsg.textContent = "No se pudo registrar. Revisá si el email ya existe.";
        errorMsg.style.display = "block";
    }
});
