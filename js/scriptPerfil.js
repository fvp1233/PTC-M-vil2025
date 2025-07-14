API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbUsers";

const nombre = document.getElementById('nombre');
const rol = document.getElementById('rol');
const usuario = document.getElementById('usuario');
const nombreCompleto = document.getElementById('nombre-completo');
const correo = document.getElementById('correo');
const telefono = document.getElementById('telefono');

//Solicitud GET para cargar las notificaciones
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data && data.length > 0) {
            const user = data[0]; // Tomamos el primer usuario del array
            CargarUsuario(user);
        } else {
            console.warn('No se encontraron usuarios en la API.');
        }
    } catch (error) {
        console.error('Error al cargar el usuario:', error);
        document.innerHTML = '<p>Error al cargar el usuario.</p>';
    }
}

function CargarUsuario(user) {
    nombre.textContent = user.fullName.split(' ')[0] + ' ' + user.fullName.split(' ')[2];
    rol.textContent = user.rol;
    usuario.textContent = user.userName;
    nombreCompleto.textContent = user.fullName;
    correo.textContent = user.email;
    telefono.textContent = user.phone;
}

//Modal para cerrar sesión
const modalLogout = document.getElementById("modal-logout"); //Cuadro de diálogo
const btnAbrirModalLogout = document.getElementById("btnAbrirModalLogout");
const btnCerrarModalLogout = document.getElementById("btnCerrarModalLogout");

btnAbrirModalLogout.addEventListener("click", () => {
    modalLogout.showModal(); //Abrir el modal al hacer clic en el botón
});

btnCerrarModalLogout.addEventListener("click", () => {
    modalLogout.close();
});

window.addEventListener('DOMContentLoaded', CargarDatos);

//Modal para editar usuario
const modalEditar = document.getElementById("modal-username");
const btnCerrarEditar = document.getElementById("btnCancelar");
const btnAbrirModalEditar = document.getElementById("edit");

btnAbrirModalEditar.addEventListener("click", () => {
    modalEditar.showModal(); //Abrir el modal al hacer clic en el botón
});

btnCerrarEditar.addEventListener("click", () => {
    modalEditar.close(); //Cerrar modal
});

function abrirModalEditar (usuario) {
    //Se agregan los valores del registro en los input
    document.getElementById("username").value = usuario;

    //Modal se abre después de agregar los valores a los input
    modalEditar.showModal();
}

document.getElementById("frmEditarUsuario").addEventListener("submit", async e => {
    e.preventDefault(); //e representa a "submit" - Evita que el formulario se envíe
    //Capturar los valores del formulario
    const username = document.getElementById("username").value.trim();

    //Validación básica
    if(!username) {
        alert("Complete el campo");
        return; //Evitar que el formulario se envíe
    }

    //Llamar a la API
    const respuesta = await fetch(`${API_URL}/${usuario.id}`, {
        method: "PUT",
        headers: {'Content-Type': 'application/json'}, //Indicar a la API que el contenido que recibe es un JSON
        body: JSON.stringify({username})
    });

    if (respuesta.ok) {
        alert("El registro fue actualizado correctamente");
        modalEditar.close();
        
        //Recargar la tabla
        obtenerPersonas();
    } else {
        alert("Hubo un error al actualizar");
    }
});