// Se importan las funciones getAuthToken y getUserId desde el servicio de autenticación.
import { getAuthToken, getUserId } from '../../authService.js';

// Se importan las funciones necesarias para interactuar con el servicio de soluciones.
import {
    getSolutions, // Para obtener soluciones de la API con paginación y filtro.
    saveSolution, // Para guardar o actualizar una solución.
    deleteSolution, // Para eliminar una solución.
    searchSolutionsByTitle, // Para buscar soluciones por título.
    categoryMap // El mapa de categorías para asociar IDs a nombres.
} from "../baseConocimientoService/baseConocimientoTechService.js";

// Se importa la función para obtener la información de un usuario por su ID.
import {
    getUserById
} from "../../Usuarios/usuarioService/usuarioService.js";

// --- Variables de estado globales ---

// Array para almacenar todas las soluciones cargadas y manipularlas en el frontend.
let todasLasTarjetas = [];
// Variable para guardar el ID de la solución que se está visualizando, editando o eliminando.
let currentSolutionId = null;

// Variables de estado para la paginación.
let currentPage = 0; // El índice de la página actual (basado en 0).
let currentSize = 10; // El número de soluciones a mostrar por página.
let currentCategoryFilter = 0; // El ID de la categoría actual para filtrar. 0 significa "Todas las categorías".
let totalPages = 1; // El número total de páginas disponibles.
let currentSearchTerm = ''; // El término de búsqueda actual.

// --- Referencias a elementos del DOM ---

// El contenedor principal donde se renderizarán las tarjetas de soluciones.
const contenidoVista = document.getElementById('contenido');
// El contenedor de los controles de paginación (botones, input de página).
const paginationContainer = document.getElementById('pagination');
// El modal para mostrar los detalles de una solución.
const modal = document.getElementById("modal");
// El botón para cerrar el modal de detalles.
const btnCerrar = document.getElementById("flechaIzquierda");
// El elemento h3 dentro del modal para el título de la solución.
const modalTitle = modal ? modal.querySelector('.modal-content .modal-titulo h3') : null;
// El elemento para la categoría en el modal de detalles.
const modalCategory = document.getElementById('modalCategory');
// El elemento para el autor en el modal de detalles.
const modalAuthor = document.getElementById('modalAuthor');
// El elemento para la fecha en el modal de detalles.
const modalDate = document.getElementById('modalDate');
// El párrafo para la solución completa en el modal de detalles.
const modalInfo = modal ? modal.querySelector('.modal-content .modal-info p') : null;
// El botón de editar en el modal de detalles.
const btnEdit = document.getElementById("edit");
// El botón de eliminar en el modal de detalles.
const btnDelete = document.getElementById("delete");

// El modal para agregar o editar una solución.
const modalAgregar = document.getElementById("modal-agregar");
// El botón que abre el modal de agregar.
const btnAgregar = document.getElementById("add");
// El botón para cerrar el modal de agregar.
const btnCerrarAgregar = document.getElementById("cerrar-agregar");
// El formulario para agregar/editar.
const frmAgregar = document.getElementById("frmAgregar");
// El título dentro del modal de agregar.
const modalAgregarTitulo = modalAgregar ? modalAgregar.querySelector('.modal-titulo h3') : null;

// Los campos de entrada del formulario de agregar/editar.
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const solucionInput = document.getElementById("solucion");
const palabrasClaveInput = document.getElementById("palabrasclave");
// El botón del dropdown para seleccionar la categoría en el formulario.
const dropdownButtonForm = document.getElementById('dropdownButtonForm');
// Todos los elementos de los ítems del dropdown del formulario.
const dropdownMenuFormItems = document.querySelectorAll('#dropdownMenuForm a.dropdown-item');

// El campo de entrada para la búsqueda en la barra superior.
const searchInput = document.getElementById('searchInput');
// El botón del dropdown para filtrar por categoría en la barra superior.
const dropdownButton = document.getElementById('dropdownButton');
// Todos los elementos de los ítems del dropdown de categorías de la barra superior.
const dropdownMenuItems = document.querySelectorAll('.dropdown-menu a.dropdown-item');
// El campo de entrada para el número de página.
const pageInput = document.getElementById('page-input');
// El botón para ir a la página anterior.
const prevButton = document.getElementById('prev-page');
// El botón para ir a la página siguiente.
const nextButton = document.getElementById('next-page');
// El elemento para mostrar el total de páginas.
const totalPagesDisplay = document.getElementById('total-pages-display');

// --- Funciones de utilidad ---

/**
 * Formatea una cadena de fecha a un formato más legible (dd/mm/aaaa).
 * @param {string} dateString - La cadena de fecha de entrada.
 * @returns {string} La fecha formateada.
 */
function formatFecha(dateString) {
    const rawDate = new Date(dateString);
    // Se extrae el día, mes y año, y se asegura que tengan 2 dígitos con padStart.
    return `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
}

/**
 * Limpia y recorta el texto, eliminando espacios extra.
 * @param {string} text - El texto a sanear.
 * @returns {string} El texto saneado.
 */
function sanitizeText(text) {
    // Si el texto existe, se reemplazan múltiples espacios con uno solo y se eliminan los espacios en blanco de los extremos.
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

/**
 * Renderiza el contenido (tarjetas de soluciones) en el DOM.
 * @param {Array<Object>} data - Un array de objetos de soluciones.
 */
function renderContent(data) {
    // Se verifica si el contenedor principal existe. Si no, se muestra un error.
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    // Se eliminan todas las tarjetas y mensajes de "sin resultados" existentes para limpiar la vista.
    contenidoVista.querySelectorAll('.tarjeta, .mensaje-sin-resultados').forEach(t => t.remove());

    // Si no hay datos, se muestra un mensaje de "no hay resultados" con una imagen.
    if (data.length === 0) {
        const mensaje = document.createElement('div');
        mensaje.className = 'mensaje-sin-resultados';
        // Se establecen estilos en línea para el mensaje.
        mensaje.style.textAlign = 'center';
        mensaje.style.padding = '20px';
        mensaje.style.color = '#888';
        mensaje.style.fontSize = '16px';
        // Se inserta el HTML con la imagen y el texto.
        mensaje.innerHTML = `
            <img src="img/no-results.jpg" alt="" class="busqueda-no-results">
            <h3>¡Vaya!</h3>
            <p>No se encontraron resultados que coincidan con tu búsqueda.</p>
        `;
        contenidoVista.appendChild(mensaje);
        // Se oculta la paginación.
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        return;
    }

    // Si hay datos, se muestra el contenedor de paginación.
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }

    // Se recorren los datos y se crea una tarjeta HTML para cada solución.
    data.forEach(c => {
        const formattedDate = formatFecha(c.updateDate);
        const categoryId = c.category.id;
        // Se busca el nombre de la categoría usando el mapa. Si no se encuentra, se usa 'Sin categoría'.
        const categoryName = categoryMap[categoryId] || 'Sin categoría';
        const description = sanitizeText(c.descriptionS);

        // Se crea el HTML para la descripción solo si existe para evitar un párrafo vacío.
        const descriptionHtml = description ? `<p>${description}</p>` : '';

        // Se crea la tarjeta y se le asigna la clase.
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        // Se inserta el HTML de la tarjeta con los datos de la solución.
        // Los atributos `data-*` se usan para guardar los datos de la solución y recuperarlos al hacer clic en "Leer más".
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

    // Se asocian los eventos de clic a los botones "Leer más" que se acaban de crear.
    attachLeerMasEventListeners();
}

/**
 * Asocia un event listener de clic a cada botón "Leer más" para abrir el modal de detalles.
 */
function attachLeerMasEventListeners() {
    // Se seleccionan todos los elementos con la clase "leer-mas".
    document.querySelectorAll(".leer-mas").forEach(button => {
        // Se agrega un event listener para el clic.
        button.addEventListener("click", (event) => {
            const currentButton = event.target;
            // Se guarda el ID de la solución.
            currentSolutionId = currentButton.dataset.id;
            // Se actualiza el contenido del modal con los datos del botón.
            if (modalTitle) modalTitle.textContent = currentButton.dataset.title;
            // Se usa innerHTML para mostrar el contenido completo.
            if (modalInfo) modalInfo.innerHTML = currentButton.dataset.fullSolution;
            if (modalCategory) modalCategory.textContent = currentButton.dataset.category;
            // Se usa el nombre del autor y la fecha formateada.
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${currentButton.dataset.author}`;
            if (modalDate) modalDate.textContent = `Fecha: ${currentButton.dataset.date}`;
            // Se muestra el modal eliminando la clase 'oculto'.
            if (modal) modal.classList.remove('oculto');
        });
    });
}

/**
 * Se cargan las soluciones desde la API, manejando la paginación y el filtro de categoría.
 * @param {number} page - El índice de la página.
 * @param {number} size - El tamaño de la página.
 * @param {number} categoryId - El ID de la categoría a filtrar.
 */
async function cargarSoluciones(page = currentPage, size = currentSize, categoryId = currentCategoryFilter) {
    try {
        // Se llama a la API para obtener las soluciones.
        const solutionsResponse = await getSolutions(page, size, categoryId);

        // Se extrae el contenido y la información de paginación de la respuesta.
        const solutions = solutionsResponse.content || solutionsResponse;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Se actualizan las variables de estado globales.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Se obtienen los IDs únicos de los autores para obtener sus nombres.
        const authorIds = [...new Set(solutions.map(s => s.userId))];
        // Se crean promesas para obtener la información de cada autor.
        const authorPromises = authorIds.map(id => getUserById(id));
        // Se espera a que todas las promesas se resuelvan.
        const authors = await Promise.all(authorPromises);
        // Se crea un mapa de autores para un acceso rápido por ID.
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name;
            return map;
        }, {});

        // Se añaden los nombres de los autores a cada objeto de solución.
        const enrichedSolutions = solutions.map(solution => {
            const fullName = authorMap[solution.userId] || 'Usuario desconocido';
            let displayName = fullName;
            if (fullName !== 'Usuario desconocido') {
                const nameParts = fullName.split(' ');
                // Se muestra solo el primer y último nombre si el nombre es compuesto.
                if (nameParts.length >= 2) {
                    displayName = `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
                }
            }
            return { ...solution, authorName: displayName };
        });

        // Se guardan las soluciones enriquecidas.
        todasLasTarjetas = enrichedSolutions;

        // Se renderiza el contenido en la vista.
        renderContent(enrichedSolutions);

        // Se actualizan los elementos de la interfaz de usuario de paginación.
        if (totalPagesDisplay) totalPagesDisplay.textContent = `de ${totalPagesFromApi}`;
        if (pageInput) {
             pageInput.value = currentPageIndex + 1; // La UI muestra la página 1-base.
             pageInput.setAttribute('max', totalPagesFromApi);
        }
        if (prevButton) prevButton.disabled = currentPageIndex === 0;
        if (nextButton) nextButton.disabled = currentPageIndex >= totalPagesFromApi - 1;
        if (paginationContainer) paginationContainer.style.display = 'flex';

    } catch (error) {
        // Si hay un error, se muestra un mensaje en la vista y una alerta.
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
 * Se buscan soluciones por término, manejando la paginación.
 * @param {number} page - El índice de la página.
 * @param {number} size - El tamaño de la página.
 */
async function searchSolutions(page = currentPage, size = currentSize) {
    try {
        // Si el término de búsqueda es menor a 3 caracteres, no se hace nada.
        if (currentSearchTerm.length < 3) return;
        // Se llama a la API para buscar soluciones.
        const solutionsResponse = await searchSolutionsByTitle(currentSearchTerm, page, size);

        const solutions = solutionsResponse.content;
        let totalPagesFromApi = solutionsResponse.totalPages || 1;
        let currentPageIndex = solutionsResponse.number || 0;

        // Se actualizan las variables de paginación.
        currentPage = currentPageIndex;
        totalPages = totalPagesFromApi;

        // Se obtienen y se añaden los nombres de los autores a las soluciones.
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

        renderContent(enrichedSolutions);

        // Se oculta la paginación si no hay resultados.
        if (solutions.length === 0) {
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
        } else {
            // Se actualiza la UI de paginación.
            if (totalPagesDisplay) totalPagesDisplay.textContent = `de ${totalPagesFromApi}`;
            if (pageInput) {
                pageInput.value = currentPageIndex + 1;
                pageInput.setAttribute('max', totalPagesFromApi);
            }
            if (prevButton) prevButton.disabled = currentPageIndex === 0;
            if (nextButton) nextButton.disabled = currentPageIndex >= totalPagesFromApi - 1;
            if (paginationContainer) paginationContainer.style.display = 'flex';
        }
    } catch (error) {
        // Se manejan los errores de búsqueda, especialmente el error 404 (no encontrado).
        if (error.message.includes('404')) {
            renderContent([]); // Se muestra una vista de 'sin resultados'.
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
        } else {
             console.error("Error al realizar la búsqueda:", error);
             Swal.fire({
                 icon: 'error',
                 title: 'Error de conexión',
                 text: 'Hubo un problema al conectar con el servidor de búsqueda.',
                 width: "90%"
             });
        }
    }
}

/**
 * Filtra las soluciones por la categoría seleccionada y reinicia la paginación.
 * @param {number} idCategoria - El ID de la categoría.
 */
function filtrarPorCategoria(idCategoria) {
    currentCategoryFilter = idCategoria;
    currentPage = 0;
    currentSearchTerm = '';
    searchInput.value = '';
    cargarSoluciones(currentPage, currentSize, currentCategoryFilter);
}

/**
 * Prepara el modal de agregar/editar para la edición de una solución existente.
 */
function prepareForEdit() {
    // Si no hay una solución seleccionada, se sale.
    if (!currentSolutionId) return;
    // Se oculta el modal de detalles.
    if (modal) modal.classList.add("oculto");

    // Se busca la solución a editar en el array global.
    const articuloSeleccionado = todasLasTarjetas.find(t => t.solutionId == currentSolutionId);

    if (articuloSeleccionado) {
        // Se rellenan los campos del formulario con los datos de la solución.
        if (tituloInput) tituloInput.value = articuloSeleccionado.solutionTitle;
        if (descripcionInput) descripcionInput.value = articuloSeleccionado.descriptionS;
        if (solucionInput) solucionInput.value = articuloSeleccionado.solutionSteps;
        if (palabrasClaveInput) palabrasClaveInput.value = articuloSeleccionado.keyWords;

        // Se actualiza el botón del dropdown del formulario con la categoría correcta.
        const categoryId = articuloSeleccionado.category.id;
        const selectedCategory = document.querySelector(`#dropdownMenuForm a[data-id='${categoryId}']`);
        if (selectedCategory && dropdownButtonForm) {
            dropdownButtonForm.textContent = selectedCategory.textContent;
            dropdownButtonForm.dataset.id = selectedCategory.dataset.id;
        }
    }

    // Se cambia el título del modal a "Editar" y se muestra.
    if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Editar solución";
    if (modalAgregar) modalAgregar.classList.remove("oculto");
}

/**
 * Maneja el envío del formulario para guardar o actualizar una solución.
 * @param {Event} e - El objeto del evento.
 */
async function handleFormSubmit(e) {
    // Se evita el envío del formulario por defecto.
    e.preventDefault();

    // Se obtienen y se limpian los valores de los campos.
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

    // Se crea el objeto de datos para enviar a la API.
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
        // Se llama a la API para guardar o actualizar la solución.
        await saveSolution(currentSolutionId, dataToSend);

        // Se muestra un mensaje de éxito.
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

        // Se reinicia la paginación y se recargan las soluciones.
        currentPage = 0;
        cargarSoluciones();
    } catch (error) {
        // Si hay un error, se muestra un mensaje de alerta.
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
    // Si no hay solución seleccionada, se sale.
    if (!currentSolutionId) return;

    // Se muestra un cuadro de diálogo de confirmación.
    const result = await Swal.fire({
        title: '¿Estás seguro que quieres eliminar la solución?',
        text: 'La acción no puede ser revertida',
        showCancelButton: true,
        confirmButtonColor: '#6b040f',
        cancelButtonColor: '#595050',
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
    });

    // Si el usuario confirma, se procede a eliminar.
    if (result.isConfirmed) {
        try {
            await deleteSolution(currentSolutionId);

            // Se muestra un mensaje de éxito.
            Swal.fire({
                title: 'Eliminado!',
                text: 'La solución ha sido eliminada.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            });
            // Se oculta el modal de detalles y se recargan las soluciones.
            if (modal) modal.classList.add('oculto');
            cargarSoluciones();
        } catch (error) {
            // Se muestra un mensaje de error si falla la eliminación.
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

// Se ejecuta una vez que el DOM ha sido completamente cargado.
document.addEventListener('DOMContentLoaded', () => {

    // Listener para el botón de 'página anterior'.
    if (prevButton) prevButton.addEventListener('click', () => {
        if (currentPage > 0) {
            if (currentSearchTerm !== '') {
                // Si hay un término de búsqueda, se busca la página anterior.
                searchSolutions(currentPage - 1, currentSize);
            } else {
                // Si no, se carga la página anterior.
                cargarSoluciones(currentPage - 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // Listener para el botón de 'página siguiente'.
    if (nextButton) nextButton.addEventListener('click', () => {
        if (currentPage < totalPages - 1) {
            if (currentSearchTerm !== '') {
                // Se busca la página siguiente.
                searchSolutions(currentPage + 1, currentSize);
            } else {
                // Se carga la página siguiente.
                cargarSoluciones(currentPage + 1, currentSize, currentCategoryFilter);
            }
        }
    });

    // Listener para el campo de entrada del número de página.
    if (pageInput) pageInput.addEventListener('change', (e) => {
        const desiredPageUI = parseInt(e.target.value, 10);
        // Se valida si la entrada es un número.
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

        // Se asegura que la página esté dentro del rango válido.
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

    // Listeners para los botones de los modales.
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

    // Listener para los ítems del dropdown de categorías de la barra superior.
    dropdownMenuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownButton.textContent = e.target.textContent;
            const categoryId = parseInt(e.target.dataset.id, 10);

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

    // Listener para el campo de búsqueda.
    searchInput.addEventListener('input', async (e) => {
        const searchTerm = e.target.value.trim();
        currentSearchTerm = searchTerm;
        currentPage = 0;

        // Se busca si el término tiene 3 o más caracteres.
        if (searchTerm.length >= 3) {
            searchSolutions(currentPage, currentSize);
        } else if (searchTerm.length === 0) {
            // Se vuelve a cargar las soluciones normales si el campo se vacía.
            cargarSoluciones();
        }
    });

    // Se carga el contenido inicial de la página al inicio.
    cargarSoluciones();
});