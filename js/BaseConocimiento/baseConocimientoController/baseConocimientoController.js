import {
    CargarDatos
} from "../service/baseConocimientoService.js";

// Mapeo para traducir categoryId a nombres de categoría
const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

let todasLasTarjetas = []; // Aquí guardaremos los datos completos

// Variables globales para los elementos del modal
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");

// Elementos dentro del modal que vamos a rellenar dinámicamente
const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
const modalCategory = document.getElementById('modalCategory'); 
const modalAuthor = document.getElementById('modalAuthor');
const modalDate = document.getElementById('modalDate'); 
const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;

// CORRECCIÓN: Hacemos esta función asíncrona para poder esperar los datos
async function CargarContenido(data) {
    if (!data) { // Si no se pasan datos, los cargamos
        data = await CargarDatos();
        todasLasTarjetas = data;
        crearDropdown();
    }
    
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
            const currentSolutionId = currentButton.dataset.id;
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

// Listener para el botón de cerrar modal (flechaIzquierda)
if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        if (modal) modal.classList.add('oculto');
    });
} else {
    console.error("El botón para cerrar el modal (flechaIzquierda) no se encontró.");
}

function filtrarPorCategoria(idCategoria) {
    const tarjetasFiltradas = idCategoria === 0
        ? todasLasTarjetas
        : todasLasTarjetas.filter(t => t.categoryId === idCategoria);

    CargarContenido(tarjetasFiltradas);
}

// Lógica del dropdown
function crearDropdown() {
    const contenidoVista = document.getElementById('contenido');
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró para el dropdown.");
        return;
    }

    if (document.getElementById('dropdownButton')) return;

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown w-100 mb-3';
    dropdown.innerHTML = `
        <button class="btn btn-custom dropdown-toggle w-100" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" id="dropdownButton">
            Todas las categorías
        </button>
        <ul class="dropdown-menu w-100">
            <li><a class="dropdown-item" href="#" data-id="0">Todas las categorías</a></li>
            <li><a class="dropdown-item" href="#" data-id="1">Soporte técnico</a></li>
            <li><a class="dropdown-item" href="#" data-id="2">Consultas</a></li>
            <li><a class="dropdown-item" href="#" data-id="3">Gestión de usuarios</a></li>
            <li><a class="dropdown-item" href="#" data-id="4">Redes</a></li>
            <li><a class="dropdown-item" href="#" data-id="5">Incidentes críticos</a></li>
        </ul>
    `;

    contenidoVista.insertBefore(dropdown, contenidoVista.firstChild);

    dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const selectedText = this.textContent;
            const selectedId = parseInt(this.dataset.id);
            const dropdownButton = document.getElementById('dropdownButton');
            dropdownButton.textContent = selectedText;

            filtrarPorCategoria(selectedId);
        });
    });
}

// Lógica de búsqueda
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
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

// CORRECCIÓN: Llamamos a la función asíncrona usando 'DOMContentLoaded'
window.addEventListener('DOMContentLoaded', () => {
    CargarContenido();
});
