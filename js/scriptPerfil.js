API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbUsers";

const nombre = document.getElementById('nombre');
const rol = document.getElementById('rol');
const usuario = document.getElementById('usuario');
const nombreCompleto = document.getElementById('nombre-completo');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');

let currentUser = null; // Variable global para almacenar el objeto del usuario cargado
let userId = null; // Variable para almacenar el ID del usuario actual

// Solicitud GET para cargar los datos del usuario desde la API
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        currentUser = data[0];
        userId = currentUser.userId; // Asigna el ID del usuario actual
        CargarUsuario(currentUser);
        console.log("Datos del usuario cargados:", currentUser);
    } catch (error) {
        console.error('Error al cargar el usuario:', error);
    }
}

// Función para actualizar la interfaz de usuario con los datos del usuario
function CargarUsuario(user) { // Este 'user' es el objeto que se recibe
    if (!user) {
        console.error("CargarUsuario: El objeto de usuario es nulo o indefinido.");
        return;
    }

    if (nombre && user.fullName) {
        const nameParts = user.fullName.split(' ');
        nombre.textContent = nameParts.length >= 2 ? `${nameParts[0]} ${nameParts[2]}` : user.fullName;
    }
    if (rol) {
        rol.textContent = user.rol || '';
    }
    if (usuario) {
        usuario.textContent = user.userName || '';
    }
    if (nombreCompleto) {
        nombreCompleto.textContent = user.fullName || '';
    }
    if (correo) {
        correo.textContent = user.email || '';
    }
    if (telefono) {
        telefono.textContent = user.phone || '';
    }
}

// Modal para cerrar sesión
const modalLogout = document.getElementById("modal-logout");
const btnAbrirModalLogout = document.getElementById("btnAbrirModalLogout");
const btnCerrarModalLogout = document.getElementById("btnCerrarModalLogout");

if (btnAbrirModalLogout) {
    btnAbrirModalLogout.addEventListener("click", () => {
        modalLogout.showModal();
    });
}

if (btnCerrarModalLogout) {
    btnCerrarModalLogout.addEventListener("click", (event) => {
        event.preventDefault();
        modalLogout.close();
    });
}

// Ejecutar CargarDatos cuando el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', CargarDatos);

// --- Lógica del Modal para Editar Usuario ---
const modalEditar = document.getElementById("modal-username");
const btnCerrarEditar = document.getElementById("btnCancelar");
const btnAbrirModalEditar = document.getElementById("edit"); // El SVG con ID "edit"

if (btnCerrarEditar) {
    btnCerrarEditar.addEventListener("click", () => {
        modalEditar.close();
    });
}

// Event listener para abrir el modal de edición
if (btnAbrirModalEditar) {
    btnAbrirModalEditar.addEventListener("click", () => {
        if (currentUser) {
            abrirModalEditar(userId, currentUser);
        } else {
            console.warn("No hay datos de usuario cargados en 'currentUser'. No se puede abrir el modal de edición.");
            alert("No se pudieron cargar los datos del usuario para editar. Por favor, recargue la página.");
        }
    });
}

// Función para abrir el modal de edición y rellenar el input
function abrirModalEditar(userId, userObj) {
    const usernameInput = document.getElementById("username");
    const userIdInput = document.getElementById("userId");
    // Verificar que el input existe y que el objeto userObj y su propiedad userName están definidos
    if (usernameInput && userObj && userObj.userName) {
        usernameInput.value = userObj.userName;
        userIdInput.value = userIdInput.value; // Asignar el ID del usuario al input oculto
        console.log(userIdInput.value);
    } else {
        console.error("No se pudo rellenar el input de username. Elemento o datos faltantes.");
        if (!usernameInput) console.error("Elemento 'username' (el input) no encontrado.");
        if (!userObj) console.error("Objeto 'userObj' es nulo o indefinido.");
        if (userObj && !userObj.userName) console.error("Propiedad 'userObj.userName' es nula o indefinida.");
    }
    modalEditar.showModal();
}

// Event listener para el envío del formulario de edición
document.getElementById("frmEditarUsuario").addEventListener("submit", async e => {
    e.preventDefault(); // Evita que el formulario se envíe de la manera tradicional
    const usernameInput = document.getElementById("username");
    const newUsername = usernameInput.value.trim(); // Obtiene el nuevo nombre de usuario del input

    // Validación básica
    if (!newUsername) {
        alert("Complete el campo");
        return;
    }

    if (!currentUser || !userId) {
        console.error("No hay un usuario seleccionado o no tiene ID para actualizar.");
        alert("Error: No se pudo identificar al usuario para actualizar.");
        return;
    }

    try {
        // Llamada a la API para actualizar el usuario
        const respuesta = await fetch(`${API_URL}/${userId}`, { // Usa currentUser.id
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: newUsername }) // Envía el campo 'userName' con el nuevo valor
        });

        if (respuesta.ok) {
            //Alerta de éxito de SweetAlert
            Swal.fire({
                position: "center",
                icon: "success",
                text: "El usuario fue actualizado correctamente",
                showConfirmButton: false,
                timer: 1800,
                width: "90%",
            });

            modalEditar.close();

            currentUser.userName = newUsername;
            CargarUsuario(currentUser);
        } else {
            const errorText = await respuesta.text(); // Intenta leer el cuerpo de la respuesta de error
            Swal.fire({
                //Alerta de error de SweetAlert
                position: "center",
                icon: "error",
                text: `Hubo un error al actualizar: ${respuesta.status} - ${errorText}`,
                showConfirmButton: false,
                timer: 1800,
                width: "90%"
            });
            console.error('Error en la respuesta de la API:', respuesta.status, errorText);
        }
    } catch (error) {
        console.error('Error al enviar la solicitud de actualización:', error);
        alert("Hubo un error de conexión al actualizar.");
    }
});