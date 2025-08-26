// Importa las funciones getAuthToken y getUserId del servicio de autenticación.
import { getAuthToken, getUserId } from '../../authService.js';
// Importa las funciones para interactuar con el servicio de soluciones de la base de conocimiento.
import {
    getSolutions,
    categoryMap,
    searchSolutionsByTitle
} from "../baseConocimientoService/baseConocimientoService.js";
// Importa la función para obtener los datos de un usuario por su ID.
import {
    getUserById
} from "../../Usuarios/usuarioService/usuarioService.js";

// Variables globales para almacenar y manipular datos de las tarjetas.
let todasLasTarjetas = [];
// Variable para guardar el ID de la solución que se está visualizando.
let currentSolutionId = null;
// Variables para referenciar elementos del DOM.
let contenidoVista = null;
let totalPagesDisplay = null;
let pageInput = null;

// Variables de estado para controlar la paginación y búsqueda.
let currentPage = 0; // El índice de la página actual, comienza en 0.
let currentSize = 10; // La cantidad de soluciones a mostrar por página.
let currentCategoryFilter = 0; // El ID de la categoría seleccionada (0 significa todas).
let totalPages = 1; // El número total de páginas disponibles.
let currentSearchTerm = ''; // El término de búsqueda actual.

// Función para formatear una cadena de fecha a 'dd/mm/aaaa'.
function formatFecha(dateString) {
    const rawDate = new Date(dateString);
    return `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
}

// Función para limpiar y recortar el texto, eliminando espacios redundantes.
function sanitizeText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

// Función para actualizar la interfaz de usuario de paginación.
function updatePaginationUI() {
    // Referencias a botones y contenedores de paginación.
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const paginationContainer = document.getElementById('pagination');

    // Actualiza el texto con el número total de páginas.
    if (totalPagesDisplay) totalPagesDisplay.textContent = `de ${totalPages}`;
    if (pageInput) {
        // Actualiza el valor del campo de entrada de la página.
        pageInput.value = currentPage + 1;
        // Establece el atributo 'max' para el campo de entrada.
        pageInput.setAttribute('max', totalPages);
    }
    // Deshabilita el botón de "anterior" si se está en la primera página.
    if (prevButton) prevButton.disabled = currentPage === 0;
    // Deshabilita el botón de "siguiente" si se está en la última página.
    if (nextButton) nextButton.disabled = currentPage >= totalPages - 1;

    // Muestra u oculta el contenedor de paginación según el número total de páginas.
    if (paginationContainer) {
        if (totalPages > 1) {
            paginationContainer.classList.remove('oculto');
        } else {
            paginationContainer.classList.add('oculto');
        }
    }
}

// Función para renderizar el contenido de las tarjetas de soluciones.
function renderContent(data) {
    // Verifica si el contenedor existe en el DOM.
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    // Limpia tarjetas y mensajes anteriores.
    contenidoVista.querySelectorAll('.tarjeta, .mensaje-sin-resultados').forEach(t => t.remove());

    const paginationContainer = document.getElementById('pagination');

    // Si no hay datos, muestra un mensaje de "sin resultados".
    if (data.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-sin-resultados';
        mensaje.style.textAlign = 'center';
        mensaje.style.padding = '20px';
        mensaje.style.color = '#888';
        mensaje.style.fontSize = '16px';
        mensaje.innerHTML = `
            <img src="img/no-results.jpg" alt="" class="busqueda-no-results">
            <h3 style="margin-top: 10px;">¡Vaya!</h3>
            <p style="margin-top: 30px;">No se encontraron resultados que coincidan con tu búsqueda.</p>
        `;
        contenidoVista.appendChild(mensaje);

        // Oculta la paginación si no hay resultados.
        if (paginationContainer) {
            paginationContainer.classList.add('oculto');
        }

        return;
    }

    // Recorre los datos para crear y renderizar una tarjeta por cada solución.
    data.forEach(c => {
        const formattedDate = formatFecha(c.updateDate);
        const categoryId = c.category.id;
        const categoryName = categoryMap[categoryId] || 'Sin categoría';
        const description = sanitizeText(c.descriptionS);
        const descriptionHtml = description ? `<p>${description}</p>` : '';

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5 style="font-size: 13px; font-weight: bold;">${c.solutionTitle}</h5>
            ${descriptionHtml}
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.solutionTitle}"
                data-description="${c.descriptionS}" data-full-solution="${c.solutionSteps}"
                data-keywords="${c.keyWords}"
                data-author="${c.authorName}"
                data-date="${formattedDate}"
                data-category="${categoryName}">
                Leer más
            </p>
        `;
        contenidoVista.appendChild(tarjeta);
    });

    // Muestra la paginación si hay resultados.
    if (paginationContainer) {
        paginationContainer.classList.remove('oculto');
    }

    // Asocia los eventos de clic a los nuevos botones "Leer más".
    attachLeerMasEventListeners();
}

// Función para asociar un evento de clic a los botones "Leer más" que abren el modal.
function attachLeerMasEventListeners() {
    // Referencias a elementos del modal.
    const modal = document.getElementById("modal");
    const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
    const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;
    const modalCategory = document.getElementById('modalCategory');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalDate = document.getElementById('modalDate');

    // Itera sobre todos los botones "Leer más" para agregar un 'event listener'.
    document.querySelectorAll(".leer-mas").forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target;
            // Almacena el ID de la solución.
            currentSolutionId = currentButton.dataset.id;
            // Actualiza el contenido del modal con los datos de la tarjeta.
            if (modalTitle) modalTitle.textContent = currentButton.dataset.title;
            if (modalInfo) modalInfo.innerHTML = currentButton.dataset.fullSolution;
            if (modalCategory) modalCategory.textContent = currentButton.dataset.category;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${currentButton.dataset.author}`;
            if (modalDate) modalDate.textContent = `Fecha: ${currentButton.dataset.date}`;
            // Muestra el modal.
            if (modal) modal.classList.remove('oculto');
        });
    });
}

// Función asincrónica para cargar soluciones desde la API.
async function cargarSoluciones(page = currentPage, size = currentSize, categoryId = currentCategoryFilter) {
    try {
        // Llama a la API para obtener las soluciones con los parámetros dados.
        const solutionsResponse = await getSolutions(page, size, categoryId);
        // Extrae el contenido y la información de la paginación.
        const solutions = solutionsResponse.content || solutionsResponse;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Actualiza las variables globales de paginación.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Obtiene los IDs de los autores para enriquecer los datos.
        const authorIds = [...new Set(solutions.map(s => s.userId))];
        const authorPromises = authorIds.map(id => getUserById(id));
        const authors = await Promise.all(authorPromises);
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name;
            return map;
        }, {});

        // Añade el nombre del autor a cada objeto de solución.
        const enrichedSolutions = solutions.map(solution => {
            const fullName = authorMap[solution.userId] || 'Usuario desconocido';
            let displayName = fullName;
            if (fullName !== 'Usuario desconocido') {
                const nameParts = fullName.split(' ');
                if (nameParts.length == 2) {
                    displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
                } else if (nameParts.length > 2) {
                    displayName = `${nameParts[0]} ${nameParts[2]}`;
                }
            }
            return { ...solution, authorName: displayName };
        });

        // Guarda las soluciones enriquecidas y las renderiza.
        todasLasTarjetas = enrichedSolutions;
        renderContent(enrichedSolutions);
        updatePaginationUI();
    } catch (error) {
        // Maneja los errores de la API, mostrando un mensaje al usuario.
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
        totalPages = 1;
        currentPage = 0;
        updatePaginationUI();
    }
}

// Función asincrónica para buscar soluciones por un término específico.
async function searchSolutions(page = currentPage, size = currentSize) {
    try {
        // Si el término de búsqueda es muy corto, regresa a la carga normal.
        if (currentSearchTerm.length < 3) {
            cargarSoluciones();
            return;
        }
        // Llama a la API para buscar soluciones por título.
        const solutionsResponse = await searchSolutionsByTitle(currentSearchTerm, page, size);
        const solutions = solutionsResponse.content;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Actualiza las variables de paginación para la búsqueda.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Obtiene los nombres de los autores.
        const authorIds = [...new Set(solutions.map(s => s.userId))];
        const authorPromises = authorIds.map(id => getUserById(id));
        const authors = await Promise.all(authorPromises);
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name;
            return map;
        }, {});

        // Enriquecimiento de datos con el nombre del autor.
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

        // Guarda y renderiza los resultados de la búsqueda.
        todasLasTarjetas = enrichedSolutions;
        renderContent(enrichedSolutions);
        updatePaginationUI();
    } catch (error) {
        // Maneja errores de búsqueda, como "no se encontraron resultados" (404).
        if (error.message.includes('404')) {
            renderContent([]);
            totalPages = 1;
            currentPage = 0;
        } else {
            console.error("Error al realizar la búsqueda:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: 'Hubo un problema al conectar con el servidor de búsqueda.',
                width: "90%"
            });
        }
        updatePaginationUI();
    }
}

// Función para filtrar soluciones por categoría y reiniciar la paginación.
function filtrarPorCategoria(idCategoria) {
    currentCategoryFilter = idCategoria;
    currentPage = 0;
    currentSearchTerm = '';
    searchInput.value = '';
    // Llama a la función de carga principal con el nuevo filtro.
    cargarSoluciones(currentPage, currentSize, currentCategoryFilter);
}

// Agrega un 'event listener' al evento 'DOMContentLoaded' para asegurar que el DOM esté listo.
document.addEventListener('DOMContentLoaded', () => {
    // Asigna las referencias a los elementos del DOM.
    contenidoVista = document.getElementById('contenido');
    const paginationContainer = document.getElementById('pagination');
    const modal = document.getElementById("modal");
    const btnCerrar = document.getElementById("flechaIzquierda");
    const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
    const modalCategory = document.getElementById('modalCategory');
    const modalAuthor = document.getElementById('modalAuthor');
    const modalDate = document.getElementById('modalDate');
    const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;

    const searchInput = document.getElementById('searchInput');
    const dropdownButton = document.getElementById('dropdownButton');
    const dropdownMenuItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');
    pageInput = document.getElementById('page-input');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    totalPagesDisplay = document.getElementById('total-pages-display');

    // 'Event listener' para el botón de cerrar el modal.
    if (btnCerrar) {
        btnCerrar.addEventListener('click', () => {
            if (modal) {
                modal.classList.add('oculto');
            }
        });
    }

    // 'Event listener' para el botón de "página anterior".
    if (prevButton) prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            if (currentSearchTerm !== '') {
                searchSolutions(currentPage - 1, currentSize);
            } else {
                cargarSoluciones(currentPage - 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // 'Event listener' para el botón de "página siguiente".
    if (nextButton) nextButton.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            if (currentSearchTerm !== '') {
                searchSolutions(currentPage + 1, currentSize);
            } else {
                cargarSoluciones(currentPage + 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // 'Event listener' para el campo de entrada de la página.
    if (pageInput) pageInput.addEventListener('change', (e) => {
        const desiredPageUI = parseInt(e.target.value, 10);
        if (isNaN(desiredPageUI)) {
            Swal.fire({
                icon: 'warning',
                title: 'Entrada no válida',
                text: 'Por favor, ingrese un número de página válido.',
                width: "90%"
            });
            e.target.value = currentPage + 1;
            return;
        }

        let correctedPageUI = Math.max(1, desiredPageUI);
        correctedPageUI = Math.min(correctedPageUI, totalPages);

        e.target.value = correctedPageUI;
        const correctedPageIndex = correctedPageUI - 1;

        if (currentSearchTerm !== '') {
            searchSolutions(correctedPageIndex, currentSize);
        } else {
            cargarSoluciones(correctedPageIndex, currentSize, currentCategoryFilter);
        }
    });

    // 'Event listener' para los ítems del menú desplegable de categorías.
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const categoryId = parseInt(e.target.dataset.id, 10);
            const dropdownButton = document.getElementById('dropdownButton');
            if (dropdownButton) {
                dropdownButton.textContent = e.target.textContent;
            }
            const searchInput = document.getElementById('searchInput');

            if (searchInput) {
                searchInput.value = '';
            }
            filtrarPorCategoria(categoryId);
        });
    });

    // 'Event listener' para la barra de búsqueda, se activa al presionar 'Enter'.
    if (searchInput) searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            currentSearchTerm = searchTerm;
            currentPage = 0;

            if (searchTerm.length >= 2) {
                searchSolutions(currentPage, currentSize);
            }
        }
    });

    // 'Event listener' para la barra de búsqueda, se activa al cambiar el texto.
    if (searchInput) searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length === 0) {
            currentSearchTerm = '';
            currentPage = 0;
            cargarSoluciones();
        }
    });

    // Carga inicial del contenido de la página.
    cargarSoluciones();
});