// NUEVO: Importamos el servicio de autenticación para la verificación inicial.
import { getAuthToken, getUserId } from '../../authService.js';

// Importamos las funciones del servicio (que ahora ya están protegidas)
import {
    getSolutions,
    saveSolution,
    deleteSolution,
    searchSolutionsByTitle, // <--- AÑADIDO: Función de búsqueda
    categoryMap
} from "../baseConocimientoService/baseConocimientoTechService.js";

import {
    getUserById
} from "../../Usuarios/usuarioService/usuarioService.js";

// --- Variables de estado global para PAGINACIÓN y CACHÉ ---
let todasLasTarjetas = [];
let currentSolutionId = null; 

// Variables para Paginación
let currentPage = 0; // Índice de página (0-base)
let currentSize = 10; 
let currentCategoryFilter = 0; // 0 = Todas las categorías
let totalPages = 1; // <--- CORRECCIÓN: Variable global para el total de páginas

// Referencias a elementos del DOM (Lectura/Modal de info)
const contenidoVista = document.getElementById('contenido');
const paginationContainer = document.getElementById('pagination'); // <-- Contenedor de la paginación
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");
const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
const modalCategory = document.getElementById('modalCategory');
const modalAuthor = document.getElementById('modalAuthor');
const modalDate = document.getElementById('modalDate');
const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;
const btnEdit = document.getElementById("edit");
const btnDelete = document.getElementById("delete");

// Referencias a elementos del DOM (Formulario/Modal de Agregar/Editar)
const modalAgregar = document.getElementById("modal-agregar");
const btnAgregar = document.getElementById("add");
const btnCerrarAgregar = document.getElementById("cerrar-agregar");
const frmAgregar = document.getElementById("frmAgregar");
const modalAgregarTitulo = modalAgregar ? modalAgregar.querySelector('.modal-titulo h3') : null;

// Campos del formulario
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const solucionInput = document.getElementById("solucion");
const palabrasClaveInput = document.getElementById("palabrasclave");
const dropdownButtonForm = document.getElementById('dropdownButtonForm');
const dropdownMenuFormItems = document.querySelectorAll('#dropdownMenuForm a.dropdown-item');

// Referencias a elementos del DOM (Filtros y Búsqueda)
const searchInput = document.getElementById('searchInput');
const dropdownButton = document.getElementById('dropdownButton');
const dropdownMenuItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');
const pageInput = document.getElementById('page-input');
const prevButton = document.getElementById('prev-page');
const nextButton = document.getElementById('next-page');
const totalPagesDisplay = document.getElementById('total-pages-display');

// --- Funciones de Utilidad ---

function formatFecha(dateString) {
    const rawDate = new Date(dateString);
    return `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
}

function sanitizeText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

// --- Funciones de Lógica Principal ---

function renderContent(data) {
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    contenidoVista.querySelectorAll('.tarjeta, .mensaje-sin-resultados').forEach(t => t.remove());

    if (data.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-sin-resultados';
        mensaje.style.textAlign = 'center';
        mensaje.style.padding = '20px';
        mensaje.style.color = '#888';
        mensaje.style.fontSize = '16px';
        mensaje.innerHTML = `
            <img src="img/no-results.jpg" alt="" class="busqueda-no-results">
            <h3>¡Vaya!</h3>
            <p>No se encontraron resultados que coincidan con tu búsqueda.</p>
        `;
        contenidoVista.appendChild(mensaje);
        return;
    }

    data.forEach(c => {
        const formattedDate = formatFecha(c.updateDate);
        const categoryId = c.category.id;
        const categoryName = categoryMap[categoryId] || 'Sin categoría';
        const description = sanitizeText(c.descriptionS);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5 style="font-size: 13px; font-weight: bold;">${c.solutionTitle}</h5>  <p>${description}</p>
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.solutionTitle}"   data-description="${c.descriptionS}" data-full-solution="${c.solutionSteps}"
                data-keywords="${c.keyWords}"      data-author="${c.authorName}" 
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
    document.querySelectorAll(".leer-mas").forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target;
            currentSolutionId = currentButton.dataset.id;
            if (modalTitle) modalTitle.textContent = currentButton.dataset.title;
            if (modalInfo) modalInfo.innerHTML = sanitizeText(currentButton.dataset.fullSolution);
            if (modalCategory) modalCategory.textContent = currentButton.dataset.category;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${currentButton.dataset.author}`;
            if (modalDate) modalDate.textContent = `Fecha: ${currentButton.dataset.date}`;
            if (modal) modal.classList.remove('oculto');
        });
    });
}

/**
 * FUNCIÓN CLAVE: Carga soluciones, maneja enriquecimiento de autor y renderiza la paginación.
 */
async function cargarSoluciones(page = currentPage, size = currentSize, categoryId = currentCategoryFilter) {
    try {
        const solutionsResponse = await getSolutions(page, size, categoryId);
        
        const solutions = solutionsResponse.content || solutionsResponse;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;
        
        // Sincronizar las variables globales con la respuesta (para el próximo clic/llamada)
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi; // <-- Aquí se actualiza la variable global

        // --- Lógica de Enriquecimiento ---
        const authorIds = [...new Set(solutions.map(s => s.userId))];
        const authorPromises = authorIds.map(id => getUserById(id));
        const authors = await Promise.all(authorPromises);
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name; 
            return map;
        }, {});

        const enrichedSolutions = solutions.map(solution => {
            const fullName = authorMap[solution.userId] || 'Usuario desconocido';
            let displayName = fullName; 

            if (fullName !== 'Usuario desconocido') {
                const nameParts = fullName.split(' ');
                if (nameParts.length >= 2) {
                    displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
                }
            }
            return { ...solution, authorName: displayName };
        });

        todasLasTarjetas = enrichedSolutions; // Guardamos SOLO la página actual

        // 1. Renderizamos las tarjetas de la página actual.
        renderContent(enrichedSolutions);
        
        // 2. ACTUALIZACIÓN DE LA PAGINACIÓN
        if (totalPagesDisplay) totalPagesDisplay.textContent = `de ${totalPagesFromApi}`;
        if (pageInput) {
             pageInput.value = currentPageIndex + 1; // UI es 1-base
             pageInput.setAttribute('max', totalPagesFromApi);
        }
        if (prevButton) prevButton.disabled = currentPageIndex === 0;
        if (nextButton) nextButton.disabled = currentPageIndex >= totalPagesFromApi - 1;
        if (paginationContainer) paginationContainer.style.display = 'flex'; // Aseguramos que se muestre

    } catch (error) {
        if (contenidoVista) {
             contenidoVista.innerHTML = '<div>Error al cargar las soluciones. Por favor, intente de nuevo más tarde.</div>';
        }
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron cargar los datos de la API. Por favor, asegúrate de que el enlace esté activo.',
            width: "90%"
        });
        console.error("Error al cargar soluciones:", error);
    }
}

/**
 * Filtra las tarjetas por categoría y renderiza el resultado.
 */
function filtrarPorCategoria(idCategoria) {
    currentCategoryFilter = idCategoria; 
    currentPage = 0; 
    
    // CORRECCIÓN CRÍTICA: Llamar a la función principal con el filtro
    cargarSoluciones(currentPage, currentSize, currentCategoryFilter);
}

// --- MANEJO DE FORMULARIOS Y CRUD ---

/**
 * Prepara el formulario para el modo Editar.
 */
function prepareForEdit() {
    if (!currentSolutionId) return;
    if (modal) modal.classList.add("oculto");

    const articuloSeleccionado = todasLasTarjetas.find(t => t.solutionId == currentSolutionId);

    if (articuloSeleccionado) {
        if (tituloInput) tituloInput.value = articuloSeleccionado.solutionTitle; 
        if (descripcionInput) descripcionInput.value = articuloSeleccionado.descriptionS;
        if (solucionInput) solucionInput.value = articuloSeleccionado.solutionSteps;
        if (palabrasClaveInput) palabrasClaveInput.value = articuloSeleccionado.keyWords; 

        const categoryId = articuloSeleccionado.category.id;
        const selectedCategory = document.querySelector(`#dropdownMenuForm a[data-id='${categoryId}']`);
        if (selectedCategory && dropdownButtonForm) {
            dropdownButtonForm.textContent = selectedCategory.textContent;
            dropdownButtonForm.dataset.id = selectedCategory.dataset.id;
        }
    }

    if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Editar solución";
    if (modalAgregar) modalAgregar.classList.remove("oculto");
}

/**
 * Maneja el envío del formulario (Crear/Actualizar).
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const titulo = tituloInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const solucion = solucionInput.value.trim();
    const palabrasClave = palabrasClaveInput.value.trim();

    const categoryId = parseInt(dropdownButtonForm.dataset.id || '1');
    const categoryName = dropdownButtonForm.textContent.trim(); 

    if (!titulo || !descripcion || !solucion) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, rellena al menos el título, la descripción y la solución.',
            width: "90%"
        });
        return;
    }

    const dataToSend = {
        "solutionTitle": titulo,
        "descriptionS": descripcion,
        "solutionSteps": solucion,
        "keyWords": palabrasClave,
        "category": {
            "id": categoryId,
            "displayName": categoryName
        },
        "userId": getUserId()
    };

    try {
        await saveSolution(currentSolutionId, dataToSend); 

        Swal.fire({
            position: "center",
            icon: "success",
            text: `La solución fue ${currentSolutionId ? 'actualizada' : 'agregada'} correctamente`,
            showConfirmButton: false,
            timer: 1800,
            width: "90%",
        });

        if (frmAgregar) frmAgregar.reset();
        if (modalAgregar) modalAgregar.classList.add("oculto");
        
        currentPage = 0; 
        cargarSoluciones(); 
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `Hubo un error al guardar la solución: ${error.message}`,
            width: "90%"
        });
        console.error("Error al guardar la solución:", error);
    }
}

/**
 * Maneja la eliminación de una solución.
 */
async function handleDelete() {
    if (!currentSolutionId) return;

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
            await deleteSolution(currentSolutionId); 

            Swal.fire({
                title: 'Eliminado!',
                text: 'La solución ha sido eliminada.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            });
            if (modal) modal.classList.add('oculto');
            cargarSoluciones();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Hubo un problema al eliminar la solución: ${error.message}`,
            });
            console.error("Error al eliminar:", error);
        }
    }
}

// ------------------------------------------------------------------
// --- Event Listeners Globales (Inicialización) ---
// ------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejadores de Eventos de Paginación
    if (prevButton) prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            cargarSoluciones(currentPage - 1, currentSize, currentCategoryFilter);
        }
    });

    if (nextButton) nextButton.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            cargarSoluciones(currentPage + 1, currentSize, currentCategoryFilter);
        }
    });

    if (pageInput) pageInput.addEventListener('change', (e) => {
        const desiredPageUI = parseInt(e.target.value, 10);
        const desiredPageIndex = desiredPageUI - 1; 

        if (isNaN(desiredPageIndex) || desiredPageIndex < 0 || desiredPageIndex >= totalPages) {
            e.target.value = currentPage + 1;
            alert(`Por favor, ingrese un número de página entre 1 y ${totalPages}.`);
            return;
        }

        cargarSoluciones(desiredPageIndex, currentSize, currentCategoryFilter);
    });
    
    // 2. Otros Listeners
    if (btnCerrar) btnCerrar.addEventListener("click", () => modal.classList.add('oculto'));
    if (btnAgregar) btnAgregar.addEventListener("click", () => {
        currentSolutionId = null;
        if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Agregar solución";
        if (frmAgregar) frmAgregar.reset();
        if (dropdownButtonForm) {
            dropdownButtonForm.textContent = 'Categoría';
            dropdownButtonForm.dataset.id = '';
        }
        if (modalAgregar) modalAgregar.classList.remove("oculto");
    });
    if (btnCerrarAgregar) btnCerrarAgregar.addEventListener("click", () => modalAgregar.classList.add('oculto'));
    if (frmAgregar) frmAgregar.addEventListener('submit', handleFormSubmit);
    if (btnEdit) btnEdit.addEventListener("click", prepareForEdit);
    if (btnDelete) btnDelete.addEventListener("click", handleDelete);
    
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownButton.textContent = e.target.textContent;
            const categoryId = parseInt(e.target.dataset.id, 10);
            
            // CRÍTICO: Limpia el campo de búsqueda cuando se selecciona un filtro de categoría
            searchInput.value = '';
            
            filtrarPorCategoria(categoryId);
        });
    });

    dropdownMenuFormItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownButtonForm.textContent = e.target.textContent;
            dropdownButtonForm.dataset.id = e.target.dataset.id;
        });
    });
    
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length >= 3) {
            const searchResults = await searchSolutionsByTitle(searchTerm);
            renderContent(searchResults);
            if (paginationContainer) paginationContainer.style.display = 'none';
        } else if (searchTerm.length === 0) {
            if (paginationContainer) paginationContainer.style.display = 'flex';
            cargarSoluciones();
        }
    });

    // 3. Inicialización: Cargar la primera página al iniciar
    cargarSoluciones();
});
