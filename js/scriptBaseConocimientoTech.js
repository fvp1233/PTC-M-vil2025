const API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Mapeo para traducir categoryId a nombres de categoría
const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

// Variables globales para los elementos del modal y menú
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");
const menu = document.querySelector(".menu");

// Elementos dentro del modal de "Leer más"
const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
const modalCategory = document.getElementById('modalCategory');
const modalAuthor = document.getElementById('modalAuthor');
const modalDate = document.getElementById('modalDate');
const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;

// Variables globales para la lógica de edición y el modal de formulario
let currentSolutionId = null;
const modalAgregar = document.getElementById("modal-agregar");
const btnAgregar = document.getElementById("add");
const btnCerrarAgregar = document.getElementById("cerrar-agregar");
const frmAgregar = document.getElementById("frmAgregar");
const modalAgregarTitulo = modalAgregar ? modalAgregar.querySelector('.modal-titulo h3') : null;

// Campos del formulario (Agregar/Editar)
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const solucionInput = document.getElementById("solucion");
const palabrasClaveInput = document.getElementById("palabrasclave");

// Dropdown del formulario
const dropdownButtonForm = document.getElementById('dropdownButtonForm');
const dropdownMenuFormItems = document.querySelectorAll('#dropdownMenuForm a.dropdown-item');

let todasLasTarjetas = []; // Variable global para almacenar los datos completos

// Solicitud GET para cargar el contenido
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        todasLasTarjetas = data; // Guardamos los datos completos
        CargarContenido(data); // Mostramos todas al inicio
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron cargar los datos de la API. Por favor, asegúrate de que el enlace esté activo.',
            width: "90%"
        });
    }
}

function CargarContenido(data) {
    const contenidoVista = document.getElementById('contenido');
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    // Elimina solo las tarjetas, no el dropdown
    const tarjetasExistentes = contenidoVista.querySelectorAll('.tarjeta');
    tarjetasExistentes.forEach(t => t.remove());

    data.forEach(c => {
        // Formatear la fecha para que se vea bien en el modal
        const rawDate = new Date(c.updateDate);
        const formattedDate = `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
        const categoryName = categoryMap[c.categoryId] || 'Sin categoría';

        // Sanitizar el texto para eliminar espacios extra y saltos de línea
        const sanitizedDescription = c.description.replace(/\s+/g, ' ').trim();

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5 style="font-size: 13px; font-weight: bold;">${c.title}</h5>
            <p>${sanitizedDescription}</p>
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.title}"
                data-description="${c.description}"
                data-full-solution="${c.solutionSteps}"
                data-author="${c.userId}"
                data-date="${formattedDate}"
                data-category="${categoryName}">
                Leer más
            </p>
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
            // Obtener los datos de los data-attributes
            currentSolutionId = currentButton.dataset.id;
            const articleTitle = currentButton.dataset.title;
            const articleFullSolution = currentButton.dataset.fullSolution;
            const articleAuthor = currentButton.dataset.author;
            const articleDate = currentButton.dataset.date;
            const articleCategory = currentButton.dataset.category;

            // Sanitizar la solución completa para eliminar espacios extra y saltos de línea
            const sanitizedFullSolution = articleFullSolution.replace(/\s+/g, ' ').trim();

            // Rellenar el contenido del modal con los datos obtenidos
            if (modalTitle) modalTitle.textContent = articleTitle;
            if (modalInfo) modalInfo.innerHTML = sanitizedFullSolution;
            if (modalCategory) modalCategory.textContent = articleCategory;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${articleAuthor}`;
            if (modalDate) modalDate.textContent = `Fecha: ${articleDate}`;

            // Mostrar el modal
            if (modal) modal.classList.remove('oculto');
        });
    });
}

// Listener para el botón de cerrar modal (flechaIzquierda) del modal de lectura
if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        if (modal) modal.classList.add('oculto');
    });
}

function filtrarPorCategoria(idCategoria) {
    const tarjetasFiltradas = idCategoria === 0 ?
        todasLasTarjetas :
        todasLasTarjetas.filter(t => t.categoryId === idCategoria);
    CargarContenido(tarjetasFiltradas);
}

// Listener para el botón de abrir el modal de agregar (+)
if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
        if (frmAgregar) frmAgregar.reset();
        currentSolutionId = null;
        if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Agregar solución";
        if (modalAgregar) modalAgregar.classList.remove("oculto");
        // Reiniciar el color del dropdown del formulario y su texto al abrir el modal
        if (dropdownButtonForm) {
            dropdownButtonForm.textContent = "Categoría";
            dropdownButtonForm.style.color = '#877575';
            dropdownButtonForm.dataset.id = ''; // Limpiar el ID seleccionado
        }
    });
}

// Listener para el botón de cerrar modal de agregar
if (btnCerrarAgregar) {
    btnCerrarAgregar.addEventListener("click", () => {
        if (modalAgregar) modalAgregar.classList.add("oculto");
    });
}

// Listener para el envío del formulario (funciona para agregar y editar)
if (frmAgregar) {
    frmAgregar.addEventListener("submit", async e => {
        e.preventDefault();

        const titulo = tituloInput.value.trim();
        const descripcion = descripcionInput.value.trim();
        const solucion = solucionInput.value.trim();
        const palabrasClave = palabrasClaveInput.value.trim();
        const date = new Date().toISOString();
        const categoryId = parseInt(dropdownButtonForm.dataset.id || '1');

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
            categoryId: categoryId,
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

                if (frmAgregar) frmAgregar.reset();
                if (modalAgregar) modalAgregar.classList.add("oculto");
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
}

// Lógica para el botón de editar
const btnEdit = document.getElementById("edit");
if (btnEdit) {
    btnEdit.addEventListener("click", () => {
        if (!currentSolutionId) {
            console.error("No hay una solución seleccionada para editar.");
            return;
        }

        if (modal) modal.classList.add("oculto");

        const articuloSeleccionado = todasLasTarjetas.find(t => t.solutionId == currentSolutionId);
        if (articuloSeleccionado) {
            if (tituloInput) tituloInput.value = articuloSeleccionado.title;
            if (descripcionInput) descripcionInput.value = articuloSeleccionado.description;
            if (solucionInput) solucionInput.value = articuloSeleccionado.solutionSteps;
            if (palabrasClaveInput) palabrasClaveInput.value = articuloSeleccionado.keywords;
            const selectedCategory = document.querySelector(`#dropdownMenuForm a[data-id='${articuloSeleccionado.categoryId}']`);
            if (selectedCategory && dropdownButtonForm) {
                dropdownButtonForm.textContent = selectedCategory.textContent;
                dropdownButtonForm.dataset.id = selectedCategory.dataset.id;
            }
        }

        if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Editar solución";
        if (modalAgregar) modalAgregar.classList.remove("oculto");
    });
}

// Lógica para el botón de eliminar
const btnDelete = document.getElementById("delete");
if (btnDelete) {
    btnDelete.addEventListener("click", async () => {
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
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 1500,
                    });
                    if (modal) modal.classList.add('oculto');
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
}

// Evento para cambiar texto del dropdown principal y filtrar
const dropdownButton = document.getElementById('dropdownButton');
const dropdownMenuItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');

if (dropdownMenuItems) {
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedText = this.textContent;
            const selectedId = parseInt(this.dataset.id);
            if (dropdownButton) dropdownButton.textContent = selectedText;
            filtrarPorCategoria(selectedId);
        });
    });
}

// Evento para el dropdown del formulario de agregar
if (dropdownMenuFormItems) {
    dropdownMenuFormItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedText = this.textContent;
            const selectedId = this.dataset.id;
            const targetButton = document.getElementById('dropdownButtonForm');
            if (targetButton) {
                targetButton.textContent = selectedText;
                targetButton.dataset.id = selectedId;
                // Código añadido para cambiar el color del texto
                targetButton.style.setProperty('color', '#000', 'important');
            }
        });
    });
}


const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        // Para la búsqueda se necesita una copia de los datos originales
        const filteredData = todasLasTarjetas.filter(item => {
            return (
                (item.title && item.title.toLowerCase().includes(searchTerm)) ||
                (item.description && item.description.toLowerCase().includes(searchTerm)) ||
                (item.solutionSteps && item.solutionSteps.toLowerCase().includes(searchTerm)) ||
                (item.keywords && item.keywords.toLowerCase().includes(searchTerm)) ||
                (item.userId && item.userId.toLowerCase().includes(searchTerm))
            );
        });
        CargarContenido(filteredData);
    });
}

window.addEventListener('DOMContentLoaded', CargarDatos);