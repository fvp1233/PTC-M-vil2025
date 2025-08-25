// Se importan las funciones getAuthToken y getUserId desde el servicio de autenticación.
import { getAuthToken, getUserId } from '../../authService.js';

// Se importan las funciones necesarias para interactuar con el servicio de soluciones de la base de conocimiento.
import {
    getSolutions, // Función para obtener soluciones desde la API con paginación y filtros.
    saveSolution, // Función para guardar o actualizar una solución en la API.
    deleteSolution, // Función para eliminar una solución en la API.
    searchSolutionsByTitle, // Función para buscar soluciones por su título.
    categoryMap // Mapa que asocia los IDs de las categorías con sus nombres.
} from "../baseConocimientoService/baseConocimientoTechService.js";

// Se importa la función para obtener los datos de un usuario a partir de su ID.
import {
    getUserById
} from "../../Usuarios/usuarioService/usuarioService.js";

// --- Variables de estado globales ---

// Array para almacenar localmente las soluciones cargadas y manipularlas en el navegador.
let todasLasTarjetas = [];
// Variable para guardar el ID de la solución actual que está siendo visualizada, editada o eliminada.
let currentSolutionId = null;

// Variables de estado para controlar la paginación.
let currentPage = 0; // Índice de la página actual (se inicia en 0).
let currentSize = 10; // Cantidad de soluciones a mostrar por página.
let currentCategoryFilter = 0; // ID de la categoría seleccionada para filtrar (0 = todas las categorías).
let totalPages = 1; // Número total de páginas disponibles.
let currentSearchTerm = ''; // El término de búsqueda que se está usando actualmente.

// --- Referencias a elementos del DOM (Document Object Model) ---

// Contenedor donde se insertarán las tarjetas de soluciones.
const contenidoVista = document.getElementById('contenido');
// Contenedor para los controles de paginación (botones, input).
const paginationContainer = document.getElementById('pagination');
// Elemento del modal para mostrar los detalles de una solución.
const modal = document.getElementById("modal");
// Botón para cerrar el modal de detalles.
const btnCerrar = document.getElementById("flechaIzquierda");
// Título de la solución dentro del modal de detalles.
const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
// Elemento para la categoría de la solución en el modal de detalles.
const modalCategory = document.getElementById('modalCategory');
// Elemento para el autor de la solución en el modal de detalles.
const modalAuthor = document.getElementById('modalAuthor');
// Elemento para la fecha de la solución en el modal de detalles.
const modalDate = document.getElementById('modalDate');
// Párrafo que contiene la solución completa en el modal de detalles.
const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;
// Botón para editar la solución en el modal de detalles.
const btnEdit = document.getElementById("edit");
// Botón para eliminar la solución en el modal de detalles.
const btnDelete = document.getElementById("delete");

// Modal para agregar o editar una solución.
const modalAgregar = document.getElementById("modal-agregar");
// Botón que abre el modal de agregar.
const btnAgregar = document.getElementById("add");
// Botón para cerrar el modal de agregar.
const btnCerrarAgregar = document.getElementById("cerrar-agregar");
// El formulario completo dentro del modal de agregar/editar.
const frmAgregar = document.getElementById("frmAgregar");
// El título del modal de agregar/editar.
const modalAgregarTitulo = modalAgregar ? modalAgregar.querySelector('.modal-titulo h3') : null;

// Campos de entrada del formulario de agregar/editar.
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const solucionInput = document.getElementById("solucion");
const palabrasClaveInput = document.getElementById("palabrasclave");
// Botón del dropdown para seleccionar la categoría en el formulario.
const dropdownButtonForm = document.getElementById('dropdownButtonForm');
// Todos los ítems del menú desplegable del formulario.
const dropdownMenuFormItems = document.querySelectorAll('#dropdownMenuForm a.dropdown-item');

// Campo de entrada para la búsqueda en la barra superior.
const searchInput = document.getElementById('searchInput');
// Botón del dropdown para filtrar por categoría en la barra superior.
const dropdownButton = document.getElementById('dropdownButton');
// Todos los ítems del menú desplegable de la barra superior.
const dropdownMenuItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');
// Campo de entrada para el número de página.
const pageInput = document.getElementById('page-input');
// Botón para ir a la página anterior.
const prevButton = document.getElementById('prev-page');
// Botón para ir a la página siguiente.
const nextButton = document.getElementById('next-page');
// Elemento que muestra el total de páginas.
const totalPagesDisplay = document.getElementById('total-pages-display');

// --- Funciones de utilidad ---

/**
 * Formatea una cadena de fecha a 'dd/mm/aaaa'.
 * @param {string} dateString - La cadena de fecha original.
 * @returns {string} La fecha formateada.
 */
function formatFecha(dateString) {
    const rawDate = new Date(dateString);
    // Se extrae el día, mes y año, y se les añade un '0' al inicio si son menores a 10.
    return `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
}

/**
 * Limpia y recorta el texto, eliminando espacios redundantes.
 * @param {string} text - El texto a limpiar.
 * @returns {string} El texto saneado.
 */
function sanitizeText(text) {
    // Si el texto existe, se reemplazan múltiples espacios por uno solo y se eliminan los espacios al principio y al final.
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Actualiza la interfaz de usuario de paginación (botones, números de página).
 */
function updatePaginationUI() {
    // Se actualiza el texto con el número total de páginas.
    if (totalPagesDisplay) totalPagesDisplay.textContent = `de ${totalPages}`;
    if (pageInput) {
        // Se actualiza el valor del input de página.
        pageInput.value = currentPage + 1;
        // Se establece el atributo 'max' para el input de la página.
        pageInput.setAttribute('max', totalPages);
    }
    // Se desactiva el botón de página anterior si se está en la primera página.
    if (prevButton) prevButton.disabled = currentPage === 0;
    // Se desactiva el botón de página siguiente si se está en la última página.
    if (nextButton) nextButton.disabled = currentPage >= totalPages - 1;

    // Se oculta la paginación si solo hay una página.
    if (paginationContainer) {
        if (totalPages > 1) {
            paginationContainer.classList.remove('oculto');
        } else {
            paginationContainer.classList.add('oculto');
        }
    }
}

/**
 * Renderiza el contenido (tarjetas de soluciones) en el contenedor principal.
 * @param {Array<Object>} data - Un array de objetos con los datos de las soluciones.
 */
function renderContent(data) {
    // Se verifica si el contenedor 'contenido' existe.
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    // Se eliminan todas las tarjetas y mensajes anteriores para limpiar la vista.
    contenidoVista.querySelectorAll('.tarjeta, .mensaje-sin-resultados').forEach(t => t.remove());

    // Si el array de datos está vacío, se muestra un mensaje de "sin resultados".
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

        return;
    }

    // Se recorre el array de soluciones para crear una tarjeta para cada una.
    data.forEach(c => {
        const formattedDate = formatFecha(c.updateDate);
        const categoryId = c.category.id;
        // Se obtiene el nombre de la categoría del mapa, o se usa 'Sin categoría' si no se encuentra.
        const categoryName = categoryMap[categoryId] || 'Sin categoría';
        const description = sanitizeText(c.descriptionS);

        // Se crea el HTML para la descripción solo si existe para evitar un párrafo vacío.
        const descriptionHtml = description ? `<p>${description}</p>` : '';

        // Se crea el elemento div para la tarjeta.
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        // Se inserta el HTML de la tarjeta, incluyendo los atributos de datos para guardar la información.
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
        // Se añade la tarjeta al contenedor principal.
        contenidoVista.appendChild(tarjeta);
    });

    // Se asocian los eventos de clic a los nuevos botones "Leer más".
    attachLeerMasEventListeners();
}

/**
 * Asocia un evento de clic a cada botón "Leer más" para abrir el modal de detalles.
 */
function attachLeerMasEventListeners() {
    // Se seleccionan todos los elementos con la clase "leer-mas".
    document.querySelectorAll(".leer-mas").forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target;
            // Se guarda el ID de la solución seleccionada.
            currentSolutionId = currentButton.dataset.id;
            // Se actualiza el contenido del modal con los datos guardados en los atributos 'data-*'.
            if (modalTitle) modalTitle.textContent = currentButton.dataset.title;
            // Se usa innerHTML para renderizar el contenido completo de la solución.
            if (modalInfo) modalInfo.innerHTML = currentButton.dataset.fullSolution;
            if (modalCategory) modalCategory.textContent = currentButton.dataset.category;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${currentButton.dataset.author}`;
            if (modalDate) modalDate.textContent = `Fecha: ${currentButton.dataset.date}`;
            // Se muestra el modal.
            if (modal) modal.classList.remove('oculto');
        });
    });
}

/**
 * Se cargan las soluciones desde la API, usando paginación y filtro de categoría.
 * @param {number} page - El índice de la página a cargar.
 * @param {number} size - El número de elementos por página.
 * @param {number} categoryId - El ID de la categoría para filtrar.
 */
async function cargarSoluciones(page = currentPage, size = currentSize, categoryId = currentCategoryFilter) {
    try {
        // Se hace la llamada a la API.
        const solutionsResponse = await getSolutions(page, size, categoryId);

        // Se extrae el contenido y la información de la paginación.
        const solutions = solutionsResponse.content || solutionsResponse;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Se actualizan las variables globales de paginación.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Se obtienen los IDs únicos de los autores de las soluciones.
        const authorIds = [...new Set(solutions.map(s => s.userId))];
        // Se crean promesas para obtener la información de cada autor.
        const authorPromises = authorIds.map(id => getUserById(id));
        // Se espera a que todas las promesas se resuelvan.
        const authors = await Promise.all(authorPromises);
        // Se crea un mapa para acceder rápidamente al nombre del autor por su ID.
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name;
            return map;
        }, {});

        // Se añade el nombre del autor a cada objeto de solución.
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

        // Se guardan las soluciones enriquecidas en la variable global.
        todasLasTarjetas = enrichedSolutions;

        // Se renderizan las tarjetas en la vista.
        renderContent(enrichedSolutions);

        // Se actualiza la interfaz de usuario de paginación.
        updatePaginationUI();

    } catch (error) {
        // Se manejan los errores de carga.
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

/**
 * Busca soluciones por un término específico, manejando la paginación.
 * @param {number} page - El índice de la página.
 * @param {number} size - El tamaño de la página.
 */
async function searchSolutions(page = currentPage, size = currentSize) {
    try {
        // Se verifica si el término de búsqueda es válido.
        if (currentSearchTerm.length < 3) {
            cargarSoluciones(); // Si no es válido, se recargan las soluciones normales.
            return;
        }
        // Se llama a la API para buscar soluciones por título.
        const solutionsResponse = await searchSolutionsByTitle(currentSearchTerm, page, size);

        const solutions = solutionsResponse.content;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Se actualizan las variables de paginación.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Se obtienen y se añaden los nombres de los autores.
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

        todasLasTarjetas = enrichedSolutions;

        // Se renderizan los resultados de la búsqueda.
        renderContent(enrichedSolutions);

        // Se actualiza la UI de paginación.
        updatePaginationUI();

    } catch (error) {
        // Se manejan los errores de la búsqueda.
        if (error.message.includes('404')) {
            renderContent([]); // Si no se encuentran resultados (error 404), se muestra una vista vacía.
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

/**
 * Filtra las soluciones por la categoría seleccionada y reinicia la paginación.
 * @param {number} idCategoria - El ID de la categoría a filtrar.
 */
function filtrarPorCategoria(idCategoria) {
    currentCategoryFilter = idCategoria;
    currentPage = 0;
    currentSearchTerm = '';
    searchInput.value = '';
    // Se llama a la función de carga principal con los nuevos parámetros de filtro.
    cargarSoluciones(currentPage, currentSize, currentCategoryFilter);
}

/**
 * Prepara el modal de agregar/editar para la edición de una solución existente.
 */
function prepareForEdit() {
    // Si no hay una solución seleccionada (en la variable currentSolutionId), se sale.
    if (!currentSolutionId) return;
    // Se oculta el modal de detalles.
    if (modal) modal.classList.add("oculto");

    // Se busca la solución a editar en el array global 'todasLasTarjetas'.
    const articuloSeleccionado = todasLasTarjetas.find(t => t.solutionId == currentSolutionId);

    if (articuloSeleccionado) {
        // Se rellenan los campos del formulario con los datos de la solución seleccionada.
        if (tituloInput) tituloInput.value = articuloSeleccionado.solutionTitle;
        if (descripcionInput) descripcionInput.value = articuloSeleccionado.descriptionS;
        if (solucionInput) solucionInput.value = articuloSeleccionado.solutionSteps;
        if (palabrasClaveInput) palabrasClaveInput.value = articuloSeleccionado.keyWords;

        // Se actualiza el botón del dropdown del formulario con el nombre y el ID de la categoría.
        const categoryId = articuloSeleccionado.category.id;
        const selectedCategory = document.querySelector(`#dropdownMenuForm a[data-id='${categoryId}']`);
        if (selectedCategory && dropdownButtonForm) {
            dropdownButtonForm.textContent = selectedCategory.textContent;
            dropdownButtonForm.dataset.id = selectedCategory.dataset.id;
        }
    }

    // Se cambia el título del modal y se muestra.
    if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Editar solución";
    if (modalAgregar) modalAgregar.classList.remove("oculto");
}

/**
 * Maneja el envío del formulario para guardar o actualizar una solución.
 * @param {Event} e - El objeto del evento del formulario.
 */
async function handleFormSubmit(e) {
    // Se evita el comportamiento por defecto del formulario (recargar la página).
    e.preventDefault();

    // Se obtienen los valores de los campos y se limpian.
    const titulo = tituloInput.value.trim();
    const descripcion = descripcionInput.value.trim();
    const solucion = solucionInput.value.trim();
    const palabrasClave = palabrasClaveInput.value.trim();

    // Se obtiene el ID y el nombre de la categoría del botón del dropdown.
    const categoryId = parseInt(dropdownButtonForm.dataset.id || '1');
    const categoryName = dropdownButtonForm.textContent.trim();

    // Se valida que los campos requeridos no estén vacíos.
    if (!titulo || !descripcion || !solucion) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, rellena al menos el título, la descripción y la solución.',
            width: "90%"
        });
        return;
    }

    // Se crea el objeto de datos que se enviará a la API.
    const dataToSend = {
        "solutionTitle": titulo,
        "descriptionS": descripcion,
        "solutionSteps": solucion,
        "keyWords": palabrasClave,
        "category": {
            "id": categoryId,
            "displayName": categoryName
        },
        "userId": getUserId() // Se obtiene el ID del usuario actual.
    };

    try {
        // Se llama a la función para guardar o actualizar la solución.
        await saveSolution(currentSolutionId, dataToSend);

        // Se muestra una alerta de éxito.
        Swal.fire({
            position: "center",
            icon: "success",
            text: `La solución fue ${currentSolutionId ? 'actualizada' : 'agregada'} correctamente`,
            showConfirmButton: false,
            timer: 1800,
            width: "90%",
        });

        // Se limpia el formulario y se oculta el modal.
        if (frmAgregar) frmAgregar.reset();
        if (modalAgregar) modalAgregar.classList.add("oculto");

        // Se reinicia la paginación y se recargan las soluciones para ver los cambios.
        currentPage = 0;
        cargarSoluciones();
    } catch (error) {
        // Se muestra una alerta de error si la operación falla.
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
    // Si no hay una solución seleccionada, se sale de la función.
    if (!currentSolutionId) return;

    // Se muestra un cuadro de diálogo de confirmación antes de eliminar.
    const result = await Swal.fire({
        title: '¿Estás seguro que quieres eliminar la solución?',
        text: 'La acción no puede ser revertida',
        showCancelButton: true,
        confirmButtonColor: '#6b040f',
        cancelButtonColor: '#595050',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });

    // Si el usuario confirma la acción.
    if (result.isConfirmed) {
        try {
            // Se llama a la función para eliminar la solución en la API.
            await deleteSolution(currentSolutionId);

            // Se muestra un mensaje de éxito.
            Swal.fire({
                title: 'Eliminado!',
                text: 'La solución ha sido eliminada.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            });
            // Se oculta el modal y se recargan las soluciones.
            if (modal) modal.classList.add('oculto');
            cargarSoluciones();
        } catch (error) {
            // Se muestra un mensaje de error si la eliminación falla.
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Hubo un problema al eliminar la solución: ${error.message}`,
            });
            console.error("Error al eliminar:", error);
        }
    }
}

// --- Event Listeners principales ---

// Se añade un listener al evento 'DOMContentLoaded' para asegurar que el DOM esté completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    // Listener para el botón de 'página anterior'.
    if (prevButton) prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            // Se decide si se busca o se carga la página anterior.
            if (currentSearchTerm !== '') {
                searchSolutions(currentPage - 1, currentSize);
            } else {
                cargarSoluciones(currentPage - 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // Listener para el botón de 'página siguiente'.
    if (nextButton) nextButton.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            // Se decide si se busca o se carga la página siguiente.
            if (currentSearchTerm !== '') {
                searchSolutions(currentPage + 1, currentSize);
            } else {
                cargarSoluciones(currentPage + 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // Listener para el campo de entrada del número de página.
    if (pageInput) pageInput.addEventListener('change', (e) => {
        const desiredPageUI = parseInt(e.target.value, 10);
        // Se valida la entrada del usuario.
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

        // Se ajusta el número de página para que esté dentro del rango válido.
        let correctedPageUI = Math.max(1, desiredPageUI);
        correctedPageUI = Math.min(correctedPageUI, totalPages);

        e.target.value = correctedPageUI;
        const correctedPageIndex = correctedPageUI - 1;

        // Se decide si se busca o se carga la página correcta.
        if (currentSearchTerm !== '') {
            searchSolutions(correctedPageIndex, currentSize);
        } else {
            cargarSoluciones(correctedPageIndex, currentSize, currentCategoryFilter);
        }
    });

    // Listeners para los botones de los modales.
    if (btnCerrar) btnCerrar.addEventListener("click", () => modal.classList.add('oculto'));
    if (btnAgregar) btnAgregar.addEventListener("click", () => {
        // Se reinicia el estado para la nueva solución.
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

    // Listener para los ítems del dropdown de categorías de la barra superior.
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownButton.textContent = e.target.textContent;
            const categoryId = parseInt(e.target.dataset.id, 10);

            // Se limpia el campo de búsqueda y se llama a la función de filtrado.
            searchInput.value = '';
            filtrarPorCategoria(categoryId);
        });
    });

    // Listener para los ítems del dropdown de categorías del formulario.
    dropdownMenuFormItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownButtonForm.textContent = e.target.textContent;
            dropdownButtonForm.dataset.id = e.target.dataset.id;
        });
    });

    // Listener para el campo de búsqueda, se activa al presionar 'Enter'.
    searchInput.addEventListener('keydown', async (e) => {
        // Se verifica si la tecla presionada es 'Enter'.
        if (e.key === 'Enter') {
            const searchTerm = e.target.value.trim();
            currentSearchTerm = searchTerm;
            currentPage = 0;

            // Se busca si el término tiene 2 o más caracteres.
            if (searchTerm.length >= 2) {
                searchSolutions(currentPage, currentSize);
            }
        }
    });

    // Listener para el campo de búsqueda, se activa al cambiar el texto.
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm.length === 0) {
            // Si el campo se vacía, se reinicia el estado y se recargan las soluciones.
            currentSearchTerm = '';
            currentPage = 0;
            cargarSoluciones();
        }
    });

    // Se llama a la función para cargar el contenido inicial de la página.
    cargarSoluciones();
});