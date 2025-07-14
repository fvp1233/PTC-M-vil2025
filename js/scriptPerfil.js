API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbUsers";

const nombre = document.getElementById('nombre');
const rol = document.getElementById('rol');
const usuario = document.getElementById('usuario'); // Este es el <p id="usuario">
const nombreCompleto = document.getElementById('nombre-completo');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');

let currentUser = null; // Variable global para almacenar el objeto del usuario cargado

// Solicitud GET para cargar los datos del usuario desde la API
async function CargarDatos() {
    console.log("Cargando datos del usuario...");
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json(); // 'data' será un array de usuarios

        if (data && data.length > 0) {
            currentUser = data[0]; // ¡Asigna el primer usuario a la variable global currentUser!
            console.log("Datos del usuario cargados:", currentUser);
            CargarUsuario(currentUser); // Llama a CargarUsuario para mostrar los datos
        } else {
            console.warn('No se encontraron usuarios en la API.');
        }
    } catch (error) {
        console.error('Error al cargar el usuario:', error);
        if (nombre) nombre.textContent = 'Error al cargar.';
        if (rol) rol.textContent = '';
    }
}

// Función para actualizar la interfaz de usuario con los datos del usuario
function CargarUsuario(user) { // Este 'user' es el objeto que se recibe
    if (!user) {
        console.error("CargarUsuario: El objeto de usuario es nulo o indefinido.");
        return;
    }

    if (nombre && user.fullName) {
        // Asegúrate de que el split sea seguro si el nombre completo tiene menos de 3 partes
        const nameParts = user.fullName.split(' ');
        // Si quieres solo el primer y segundo nombre, revisa el índice [2].
        // Normalmente sería [0] y [1] para "Nombre Apellido1"
        // Si "Esteban Zavaleta", split(' ')[0] es "Esteban", split(' ')[1] es "Zavaleta". No hay [2].
        nombre.textContent = nameParts.length >= 2 ? `${nameParts[0]} ${nameParts[1]}` : user.fullName;
    }
    if (rol) {
        rol.textContent = user.rol || '';
    }
    if (usuario) { // Actualiza el <p id="usuario"> con el userName
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

    const fotoPerfil = document.querySelector('.foto');
    if (fotoPerfil && user.profilePicture) { // Si tu API devuelve 'profilePicture'
        fotoPerfil.src = user.profilePicture;
    }
    console.log("Interfaz de usuario actualizada con:", user.userName);
}

// Modal para cerrar sesión (Mantener este tal cual, ya funciona)
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
        console.log("Modal de edición cerrado.");
    });
}

// Event listener para abrir el modal de edición
if (btnAbrirModalEditar) {
    btnAbrirModalEditar.addEventListener("click", () => {
        console.log("Clic en el botón de edición.");
        // Verificar si currentUser tiene datos antes de intentar abrir el modal
        if (currentUser) {
            console.log("currentUser existe:", currentUser);
            abrirModalEditar(currentUser); // ¡PASA EL OBJETO currentUser como argumento!
        } else {
            console.warn("No hay datos de usuario cargados en 'currentUser'. No se puede abrir el modal de edición.");
            alert("No se pudieron cargar los datos del usuario para editar. Por favor, recargue la página.");
        }
    });
}

// Función para abrir el modal de edición y rellenar el input
// ¡CORRECCIÓN CLAVE AQUÍ: Usa 'user' o 'usuario' consistentemente!
function abrirModalEditar (userObj) { // Renombré el parámetro a 'userObj' para mayor claridad
    console.log("abrirModalEditar llamada con userObj:", userObj);
    const usernameInput = document.getElementById("username");
    // Verificar que el input existe y que el objeto userObj y su propiedad userName están definidos
    if (usernameInput && userObj && userObj.userName) {
        usernameInput.value = userObj.userName; // Ahora accedemos a userObj.userName
        console.log("Input de username rellenado con:", userObj.userName);
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

    // Asegúrate de que tenemos un usuario cargado y su ID para la actualización
    if (!currentUser || !currentUser.id) {
        console.error("No hay un usuario seleccionado o no tiene ID para actualizar.");
        alert("Error: No se pudo identificar al usuario para actualizar.");
        return;
    }

    try {
        // Llamada a la API para actualizar el usuario
        const respuesta = await fetch(`${API_URL}/${currentUser.userId}`, { // Usa currentUser.id
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: newUsername }) // Envía el campo 'userName' con el nuevo valor
        });

        if (respuesta.ok) {
            alert("El registro fue actualizado correctamente");
            modalEditar.close();

            // Actualiza el nombre de usuario en el objeto currentUser (localmente)
            currentUser.userName = newUsername;
            // Vuelve a cargar los datos en la UI con el objeto currentUser actualizado
            CargarUsuario(currentUser);

            console.log("Usuario actualizado y UI refrescada.");
            // Si tenías una función global 'obtenerPersonas()' para recargar una tabla,
            // asegúrate de que esté definida en tu código o remuévela si no la usas.
            // obtenerPersonas(); // Esto probablemente necesita ser eliminado o implementado
        } else {
            const errorText = await respuesta.text(); // Intenta leer el cuerpo de la respuesta de error
            alert(`Hubo un error al actualizar: ${respuesta.status} - ${errorText}`);
            console.error('Error en la respuesta de la API:', respuesta.status, errorText);
        }
    } catch (error) {
        console.error('Error al enviar la solicitud de actualización:', error);
        alert("Hubo un error de conexión al actualizar.");
    }
});