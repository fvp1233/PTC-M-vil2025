// Archivo: usuarioController.js

import {
    getUserById,
    updateUsername,
    updateProfilePicture,
    getTicketCountByUser
} from '../usuarioService/usuarioService.js';

import {
    uploadImageToFolder
} from '../../CreateTicket/Service/imageService.js';
import {
    fetchWithAuth, logout
} from '../../Login/AuthService/authService.js';

import {
    me
} from '../../Login/AuthService/authService.js';

const nombre = document.getElementById('nombre');
const usuario = document.getElementById('usuario');
const nombreCompleto = document.getElementById('nombre-completo');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');
const fotoPerfil = document.getElementById('fotoPerfil');

// Elementos para la foto de perfil y su funcionalidad
const fotoContainer = document.getElementById('fotoContainer');
const editarFotoOverlay = document.getElementById('editarFotoOverlay');
const fileInput = document.getElementById('fileInput');
let overlayVisible = false;

// Variables globales para el usuario
let currentUser = null;
let loggedInUser = null;

// Solicitud GET para cargar los datos del usuario desde la API
async function CargarDatos() {
    try {
        loggedInUser = await me();

        if (!loggedInUser || !loggedInUser.userId) {
            console.error("No se encontró un ID de usuario en el localStorage. Por favor, inicie sesión.");
            return;
        }

        const user = await getUserById(loggedInUser.userId);

        if (user) {
            currentUser = user;
            CargarUsuario(user);
            CargarUsuario(currentUser);
            mostrarTicketsGenerados();
            console.log("Datos del usuario cargados:", user);
        } else {
            console.error("No se encontraron datos de usuario para el ID proporcionado.");
        }
    } catch (error) {
        console.error('Error al cargar el usuario:', error);
    }
}

// Función para actualizar la interfaz de usuario con los datos del usuario
function CargarUsuario(user) {
    if (!user) {
        console.error("CargarUsuario: El objeto de usuario es nulo o indefinido.");
        return;
    }

    if (fotoPerfil && user.profilePictureUrl) {
        fotoPerfil.src = user.profilePictureUrl;
    }

    if (nombre && user.name) {
        const nameParts = user.name.split(' ');
        nombre.textContent = nameParts.length >= 3 ? `${nameParts[0]} ${nameParts[2]}` : user.name;
    }

    if (usuario) {
        usuario.textContent = user.username || '';
    }

    if (nombreCompleto) {
        nombreCompleto.textContent = user.name || '';
    }

    if (correo) {
        correo.textContent = user.email || '';
    }

    if (telefono) {
        telefono.textContent = user.phone || '';
    }

    console.log('Valor del token recibido:', localStorage.getItem('jwt_token'));
}


// --- Lógica del Modal para cerrar sesión ---
const modalLogout = document.getElementById("modal-logout");
const btnAbrirModalLogout = document.getElementById("btnAbrirModalLogout");
const btnCerrarModalLogout = document.getElementById("btnCerrarModalLogout");
const btnConfirmarLogout = document.getElementById("btnConfirmarLogout");

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

if (btnConfirmarLogout) {
    btnConfirmarLogout.addEventListener("click", async (event) => {
        event.preventDefault();
        modalLogout.close();
        await logout();
        window.location.href = 'inicioSesion.html';
    });
}


// --- Lógica del Modal para Editar Usuario ---
const modalEditar = document.getElementById("modal-username");
const btnCerrarEditar = document.getElementById("btnCancelar");
const btnAbrirModalEditar = document.getElementById("edit");

if (btnCerrarEditar) {
    btnCerrarEditar.addEventListener("click", () => {
        modalEditar.close();
    });
}

if (btnAbrirModalEditar) {
    btnAbrirModalEditar.addEventListener("click", () => {
        if (currentUser) {
            abrirModalEditar(currentUser.id, currentUser);
        } else {
            console.warn("No hay datos de usuario cargados en 'currentUser'. No se puede abrir el modal de edición.");
            Swal.fire({
                icon: "warning",
                title: "Atención",
                text: "No se pudieron cargar los datos del usuario para editar. Por favor, recargue la página.",
            });
        }
    });
}

function abrirModalEditar(id, userObj) {
    const usernameInput = document.getElementById("username");
    const userIdInput = document.getElementById("userId");

    if (usernameInput && userObj && userObj.username) {
        usernameInput.value = userObj.username;
        userIdInput.value = id;
    } else {
        console.error("No se pudo rellenar el input de username. Elemento o datos faltantes.");
    }
    modalEditar.showModal();
}


// --- LÓGICA DE ACTUALIZACIÓN ---
// Manejador del formulario para enviar la actualización del nombre de usuario
const frmEditarUsuario = document.getElementById("frmEditarUsuario");
if (frmEditarUsuario) {
    frmEditarUsuario.addEventListener("submit", async e => {
        e.preventDefault();
        const usernameInput = document.getElementById("username");
        const newUsername = usernameInput.value.trim();

        if (!newUsername) {
            Swal.fire({
                icon: "warning",
                title: "Campo vacío",
                text: "Por favor, complete el campo de usuario.",
            });
            return;
        }

        const updatedUserData = {
            username: newUsername,
            email: currentUser.email,
            phone: currentUser.phone,
            name: currentUser.name,
            profilePictureUrl: currentUser.profilePictureUrl,
            isActive: currentUser.isActive // 👈 este es el que faltaba
        };



        if (!currentUser || !currentUser.id) {
            console.error("No hay un usuario o ID de usuario para actualizar.");
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error: No se pudo identificar al usuario para actualizar.",
            });
            return;
        }

        try {
            const userId = document.getElementById("userId").value;
            const newUsername = usernameInput.value.trim();

            const result = await updateUsername(currentUser.id, updatedUserData);

            console.log("✅ Usuario actualizado:", result);

            Swal.fire({
                icon: 'info',
                title: 'Usuario actualizado',
                text: 'Tu nombre de usuario ha cambiado. Por seguridad, por favor inicia sesión nuevamente.',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                logout(); // Limpia token y datos del usuario
                window.location.href = 'inicioSesion.html'; // Redirige al login
            });

            modalEditar.close();

        } catch (error) {
            console.error("❌ Error al actualizar el usuario:", error);

            Swal.fire({
                icon: "error",
                title: "Error de conexión",
                text: error.message || "Hubo un problema al actualizar el usuario.",
            });
        }

    });
}


// --- Lógica para la edición de la foto de perfil con el servicio de Cloudinary ---

// Evento de clic en el contenedor de la foto para mostrar el overlay
fotoContainer.addEventListener('click', () => {
    if (!overlayVisible) {
        editarFotoOverlay.classList.add('visible');
        overlayVisible = true;
    } else {
        fileInput.click();
    }
});

// Evento para ocultar el overlay cuando se hace clic fuera del contenedor de la foto
document.body.addEventListener('click', (e) => {
    if (overlayVisible && !fotoContainer.contains(e.target) && e.target !== fileInput) {
        editarFotoOverlay.classList.remove('visible');
        overlayVisible = false;
    }
});

// Evento `change` del input de archivo, se dispara cuando se selecciona un archivo
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        uploadImage(file);
    }
});

// Función para subir la imagen usando tu servicio `imageService.js`
async function uploadImage(file) {
    Swal.fire({
        title: 'Subiendo imagen...',
        text: 'Por favor, espere.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const data = await uploadImageToFolder(file, 'usuarios');
        const newPhotoUrl = data.url;

        console.log('URL de la nueva foto:', newPhotoUrl);

        editarFotoOverlay.classList.remove('visible');
        overlayVisible = false;

        const updatedUserData = {
            id: currentUser.id,
            username: currentUser.username,
            email: currentUser.email,
            phone: currentUser.phone,
            name: currentUser.name,
            profilePictureUrl: newPhotoUrl,
            isActive: currentUser.isActive
        };

        // 👇 Aquí va tu try/catch para actualizar la foto en tu backend
        try {
            const result = await updateProfilePicture(currentUser.id, updatedUserData);

            currentUser.profilePictureUrl = newPhotoUrl;
            fotoPerfil.src = newPhotoUrl;

            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: 'Foto de perfil actualizada correctamente.',
                showConfirmButton: false,
                timer: 1800
            });
        } catch (error) {
            console.error('❌ Error al actualizar la foto:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo actualizar la foto.',
            });
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo subir la imagen: ${error.message}`,
        });
        console.error('Error al subir la imagen a Cloudinary:', error);
    }
}

async function mostrarTicketsGenerados() {
    try {
        const count = await getTicketCountByUser(currentUser.id);
        const ticketsLabel = document.getElementById("tickets-generados");
        ticketsLabel.textContent = `Tickets generados: ${count}`;
    } catch (error) {
        console.error("❌ Error al obtener el número de tickets:", error);
    }
}

// Ejecutar CargarDatos cuando el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', CargarDatos);
