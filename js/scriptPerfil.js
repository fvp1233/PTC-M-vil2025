API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbUsers";

const nombre = document.getElementById('nombre');
const rol = document.getElementById('rol');
const usuario = document.getElementById('usuario');
const nombreCompleto = document.getElementById('nombre-completo');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');
const fotoPerfil = document.getElementById('fotoPerfil');

// Elementos para la foto de perfil y su funcionalidad
const fotoContainer = document.getElementById('fotoContainer');
const editarFotoOverlay = document.getElementById('editarFotoOverlay');
const fileInput = document.getElementById('fileInput'); // Asegúrate de que este ID esté en tu HTML
let overlayVisible = false;

// Variables globales para el usuario
let currentUser = null;
let userId = null;

// --- Configuración de Cloudinary ---
// Reemplaza 'YOUR_CLOUD_NAME' y 'YOUR_UPLOAD_PRESET' con tus credenciales
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dgpreaeg9/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'perfil_uploads';

// Solicitud GET para cargar los datos del usuario desde la API
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Asume que el primer usuario de la lista es el que se muestra
        currentUser = data[0]; 
        if (currentUser) {
            userId = currentUser.userId;
            CargarUsuario(currentUser);
            console.log("Datos del usuario cargados:", currentUser);
        } else {
            console.error("No se encontraron datos de usuario.");
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

    // Actualiza la foto de perfil si existe una URL
    if (fotoPerfil && user.photoUrl) {
        fotoPerfil.src = user.photoUrl;
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


// --- Lógica del Modal para cerrar sesión ---
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


// --- Lógica del Modal para Editar Usuario ---
const modalEditar = document.getElementById("modal-username");
const btnCerrarEditar = document.getElementById("btnCancelar");
const btnAbrirModalEditar = document.getElementById("edit"); // El SVG con ID "edit"

if (btnCerrarEditar) {
    btnCerrarEditar.addEventListener("click", () => {
        modalEditar.close();
    });
}

if (btnAbrirModalEditar) {
    btnAbrirModalEditar.addEventListener("click", () => {
        if (currentUser) {
            abrirModalEditar(currentUser.userId, currentUser);
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

    if (usernameInput && userObj && userObj.userName) {
        usernameInput.value = userObj.userName;
        userIdInput.value = id;
    } else {
        console.error("No se pudo rellenar el input de username. Elemento o datos faltantes.");
    }
    modalEditar.showModal();
}

document.getElementById("frmEditarUsuario").addEventListener("submit", async e => {
    e.preventDefault();
    const usernameInput = document.getElementById("username");
    const newUsername = usernameInput.value.trim();
    const currentUserId = document.getElementById("userId").value;

    if (!newUsername) {
        Swal.fire({
            icon: "warning",
            title: "Campo vacío",
            text: "Por favor, complete el campo de usuario.",
        });
        return;
    }

    if (!currentUserId) {
        console.error("No hay un ID de usuario para actualizar.");
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error: No se pudo identificar al usuario para actualizar.",
        });
        return;
    }

    try {
        const respuesta = await fetch(`${API_URL}/${currentUserId}`, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: newUsername })
        });

        if (respuesta.ok) {
            Swal.fire({
                position: "center",
                icon: "success",
                text: "El usuario fue actualizado correctamente",
                showConfirmButton: false,
                timer: 1800,
                width: "90%",
            });
            modalEditar.close();
            if (currentUser && currentUser.userId === currentUserId) {
                currentUser.userName = newUsername;
                CargarUsuario(currentUser);
            } else {
                CargarDatos();
            }
        } else {
            const errorText = await respuesta.text();
            Swal.fire({
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
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "Hubo un error de conexión al actualizar.",
        });
    }
});


// --- Lógica para la edición de la foto de perfil con Cloudinary ---

// Evento de clic en el contenedor de la foto para mostrar el overlay
fotoContainer.addEventListener('click', () => {
    if (!overlayVisible) {
        editarFotoOverlay.classList.add('visible');
        overlayVisible = true;
    } else {
        // Si ya está visible, se inicia la acción de seleccionar archivo
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
        uploadImageToCloudinary(file);
    }
});

// Función para subir la imagen a Cloudinary
async function uploadImageToCloudinary(file) {
    Swal.fire({
        title: 'Subiendo imagen...',
        text: 'Por favor, espere.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const res = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) {
            throw new Error(`Error en Cloudinary: ${res.statusText}`);
        }

        const data = await res.json();
        const newPhotoUrl = data.secure_url;

        console.log('URL de la nueva foto:', newPhotoUrl);

        editarFotoOverlay.classList.remove('visible');
        overlayVisible = false;

        await updateProfilePicture(newPhotoUrl);

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `No se pudo subir la imagen: ${error.message}`,
        });
        console.error('Error al subir la imagen a Cloudinary:', error);
    }
}

// Función para actualizar la URL de la foto de perfil en tu API (MockAPI)
async function updateProfilePicture(photoUrl) {
    if (!currentUser || !currentUser.userId) {
        console.error("No hay un usuario o ID de usuario para actualizar la foto.");
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la foto. ID de usuario no encontrado.',
        });
        return;
    }

    try {
        const res = await fetch(`${API_URL}/${currentUser.userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ photoUrl: photoUrl }),
        });

        if (res.ok) {
            currentUser.photoUrl = photoUrl;
            fotoPerfil.src = photoUrl;
            Swal.fire({
                icon: 'success',
                title: '¡Listo!',
                text: 'Foto de perfil actualizada correctamente.',
                showConfirmButton: false,
                timer: 1800
            });
        } else {
            throw new Error(`Error al actualizar la foto en la API: ${res.statusText}`);
        }
    } catch (error) {
        console.error('Error al actualizar la foto de perfil en la API:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar la foto en la base de datos.',
        });
    }
}


// Ejecutar CargarDatos cuando el DOM esté completamente cargado
window.addEventListener('DOMContentLoaded', CargarDatos);