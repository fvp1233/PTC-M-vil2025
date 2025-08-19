API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Variables globales para los elementos del modal y menú
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");
const menu = document.querySelector(".menu");

// Elementos dentro del modal de "Leer más"
const modalTitle = modal.querySelector('.modal-content .modal-titulo h3');
const modalAuthor = modal.querySelector('.modal-content .modal-datos p:first-child');
const modalDate = modal.querySelector('.modal-content .modal-datos p:last-child');
const modalInfo = modal.querySelector('.modal-content .modal-info p');

// Variables globales para la lógica de edición y el modal de formulario
let currentSolutionId = null; 
const modalAgregar = document.getElementById("modal-agregar");
const btnAgregar = document.getElementById("add");
const btnCerrarAgregar = document.getElementById("cerrar-agregar");
const frmAgregar = document.getElementById("frmAgregar");
const modalAgregarTitulo = modalAgregar.querySelector('.modal-titulo h3');

// Campos del formulario (Agregar/Editar)
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const solucionInput = document.getElementById("solucion");
const palabrasClaveInput = document.getElementById("palabrasclave");

// Solicitud GET para cargar el contenido
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        CargarContenido(data);
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
    }
}

function CargarContenido(data) {
    const contenidoVista = document.getElementById('contenido');
    contenidoVista.innerHTML = ''; 

    data.forEach(c => {
        const rawDate = new Date(c.updateDate);
        const formattedDate = `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5>${c.title}</h5>
            <p>${c.description}</p>
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.title}"
                data-description="${c.description}"
                data-full-solution="${c.solutionSteps}"
                data-keywords="${c.keywords || ''}" 
                data-author="${c.userId}" data-date="${formattedDate}">Leer más</p>
        `;
        contenidoVista.appendChild(tarjeta);
    });

    attachLeerMasEventListeners();
}

function attachLeerMasEventListeners() {
    const btnAbrirModalLeerMasList = document.querySelectorAll(".leer-mas");

    btnAbrirModalLeerMasList.forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target;
            const articleId = currentButton.dataset.id;
            
            currentSolutionId = articleId;

            const articleTitle = currentButton.dataset.title;
            const articleFullSolution = currentButton.dataset.fullSolution;
            const articleAuthor = currentButton.dataset.author;
            const articleDate = currentButton.dataset.date;

            if (modalTitle) modalTitle.textContent = articleTitle;
            if (modalInfo) modalInfo.innerHTML = articleFullSolution;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${articleAuthor}`;
            if (modalDate) modalDate.textContent = `Fecha: ${articleDate}`;

            modal.classList.remove("oculto");
        });
    });
}

// Listener para el botón de cerrar modal (flechaIzquierda) del modal de lectura
if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        modal.classList.add("oculto");
    });
} else {
    console.error("El botón para cerrar el modal (flechaIzquierda) no se encontró.");
}

// Listener para el botón de abrir el modal de agregar (+)
btnAgregar.addEventListener("click", () => {
    frmAgregar.reset();
    currentSolutionId = null;
    modalAgregarTitulo.textContent = "Agregar solución";
    modalAgregar.classList.remove("oculto");
});

// Listener para el botón de cerrar modal de agregar
btnCerrarAgregar.addEventListener("click", () => {
    modalAgregar.classList.add("oculto");
});

// Listener para el envío del formulario (funciona para agregar y editar)
frmAgregar.addEventListener("submit", async e => {
    e.preventDefault(); 

    const titulo = tituloInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const solucion = solucionInput.value.trim();
    const palabrasClave = palabrasClaveInput.value.trim();
    const date = new Date().toISOString();

    if (!titulo || !descripcion || !solucion) {
        Swal.fire({
            icon: 'error',
            title: 'Campos incompletos',
            text: 'Por favor, complete todos los campos obligatorios.',
            width: "90%"
        });
        return;
    }

    const dataToSend = {
        title: titulo,
        description: descripcion,
        solutionSteps: solucion,
        keywords: palabrasClave,
        updateDate: date,
        // userId: '1' // Si tienes el userId, agrégalo aquí
    };

    let method = 'POST';
    let url = API_URL;

    if (currentSolutionId) {
        method = 'PUT';
        url = `${API_URL}/${currentSolutionId}`;
    }

    try {
        const respuesta = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToSend)
        });

        if (respuesta.ok) {
            Swal.fire({
                position: "center",
                icon: "success",
                text: `La solución fue ${method === 'POST' ? 'agregada' : 'actualizada'} correctamente`,
                showConfirmButton: false,
                timer: 1800,
                width: "90%",
            });

            frmAgregar.reset();
            modalAgregar.classList.add("oculto");
            CargarDatos();
        } else {
            throw new Error(`Error en la API: ${respuesta.status}`);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Hubo un error al guardar la solución: ${error.message}`,
            width: "90%"
        });
        console.error("Error al guardar la solución:", error);
    }
});

// Lógica para el botón de editar
document.getElementById("edit").addEventListener("click", () => {
    if (!currentSolutionId) {
        console.error("No hay una solución seleccionada para editar.");
        return;
    }

    modal.classList.add("oculto");

    const articuloSeleccionado = document.querySelector(`.leer-mas[data-id="${currentSolutionId}"]`);
    if (articuloSeleccionado) {
        tituloInput.value = articuloSeleccionado.dataset.title;
        descripcionInput.value = articuloSeleccionado.dataset.description;
        solucionInput.value = articuloSeleccionado.dataset.fullSolution;
        palabrasClaveInput.value = articuloSeleccionado.dataset.keywords;
    }

    modalAgregarTitulo.textContent = "Editar solución";

    modalAgregar.classList.remove("oculto");
});

// Lógica para el botón de eliminar
document.getElementById("delete").addEventListener("click", async () => {
    if (!currentSolutionId) {
        console.error("No hay una solución seleccionada para eliminar.");
        return;
    }

    const result = await Swal.fire({
        title: '¿Estás seguro que quieres eliminar la solución?',
        text: 'La acción no puede ser revertida',
        showCancelButton: true,
        confirmButtonColor: '#6b040f',
        cancelButtonColor: '#595050',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const res = await fetch(`${API_URL}/${currentSolutionId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                Swal.fire({
                    title: 'Eliminado!',
                    text: 'La solución ha sido eliminada.',
                    icon: 'success'
                });
                modal.classList.add('oculto');
                CargarDatos();
            } else {
                throw new Error(`Error al eliminar: ${res.status}`);
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Hubo un problema al eliminar la solución: ${error.message}`,
            });
            console.error("Error al eliminar:", error);
        }
    }
});

window.addEventListener('DOMContentLoaded', CargarDatos);