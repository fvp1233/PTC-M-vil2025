// NUEVO: Importamos el servicio de autenticación para la verificación inicial.
import { getAuthToken, getUserId } from '../../authService.js';

// Importamos las funciones del servicio (que ahora ya están protegidas)
import {
    getSolutions,
    saveSolution,
    deleteSolution,
    categoryMap
} from "../baseConocimientoService/baseConocimientoTechService.js";

import {
    getUserById
} from "../../Usuarios/usuarioService/usuarioService.js";

// Variables de estado global
let todasLasTarjetas = [];
let currentSolutionId = null; // ID del elemento actualmente abierto/editado

// Referencias a elementos del DOM (Lectura/Modal de info)
const contenidoVista = document.getElementById('contenido');
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

// --- Funciones de Utilidad ---

/**
 * Formatea una fecha en string "dd/mm/yyyy".
 */
function formatFecha(dateString) {
    const rawDate = new Date(dateString);
    return `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;
}

/**
 * Sanea un texto para eliminar espacios extra y saltos de línea.
 */
function sanitizeText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
}

// --- Funciones de Lógica Principal ---

/**
 * Renderiza el contenido (tarjetas) en el DOM.
 * @param {Array<Object>} data - Arreglo de soluciones a mostrar.
 */
function renderContent(data) {
    if (!contenidoVista) {
        console.error("El elemento con id 'contenido' no se encontró.");
        return;
    }

    contenidoVista.querySelectorAll('.tarjeta').forEach(t => t.remove());

    data.forEach(c => {
        // CORRECCIÓN: La API devuelve la fecha generada por el backend
        const formattedDate = formatFecha(c.updateDate);

        // CORRECCIÓN: La API devuelve el objeto 'category', no 'categoryId'
        const categoryId = c.category.id;
        const categoryName = categoryMap[categoryId] || 'Sin categoría';

        // CORRECCIÓN: Usar el nombre del DTO: descriptionS
        const description = sanitizeText(c.descriptionS);

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5 style="font-size: 13px; font-weight: bold;">${c.solutionTitle}</h5>  <p>${description}</p>
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.solutionTitle}"   data-description="${c.descriptionS}" data-full-solution="${c.solutionSteps}"
                data-keywords="${c.keyWords}"      data-author="${c.authorName}" 
                
                data-date="${formattedDate}"
                data-category="${categoryName}">
                Leer más
            </p>
        `;
        contenidoVista.appendChild(tarjeta);
    });

    attachLeerMasEventListeners();
}

/**
 * Agrega event listeners a los botones "Leer más" de las tarjetas.
 */
function attachLeerMasEventListeners() {
    document.querySelectorAll(".leer-mas").forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target;

            // Establecer el ID global para uso en Edición/Eliminación
            currentSolutionId = currentButton.dataset.id;

            // Rellenar el modal de lectura
            if (modalTitle) modalTitle.textContent = currentButton.dataset.title;
            if (modalInfo) modalInfo.innerHTML = sanitizeText(currentButton.dataset.fullSolution);
            if (modalCategory) modalCategory.textContent = currentButton.dataset.category;
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${currentButton.dataset.author}`;
            if (modalDate) modalDate.textContent = `Fecha: ${currentButton.dataset.date}`;

            // Mostrar el modal de lectura
            if (modal) modal.classList.remove('oculto');
        });
    });
}

/**
 * Obtiene los datos, los guarda localmente y renderiza el contenido.
 */
async function CargarDatosIniciales() {
    try {
        // 1. Obtenemos la respuesta paginada completa.
        // Opcional: puedes aumentar el 'size' si tienes muchos datos y quieres traerlos todos.
        const solutionsResponse = await getSolutions(0, 1000);

        // **¡SOLUCIÓN AL ERROR DE CONEXIÓN!** Extraemos el array del objeto Page.
        // Si la respuesta tiene 'content', lo usamos; si no (ej. si API cambia), usamos la respuesta completa.
        const solutions = solutionsResponse.content || solutionsResponse;

        // --- El resto del código de enriquecimiento ahora funcionará ---

        // 2. Creamos un conjunto de IDs de autor únicos. 
        // Esta línea ya no fallará porque 'solutions' es un Array válido.
        const authorIds = [...new Set(solutions.map(s => s.userId))];

        // 3. Hacemos peticiones para cada ID de autor único en paralelo.
        const authorPromises = authorIds.map(id => getUserById(id));
        const authors = await Promise.all(authorPromises);

        // 4. Creamos un "mapa" para buscar fácilmente el nombre de un autor por su ID.
        const authorMap = authors.reduce((map, author) => {
            map[author.id] = author.name; // O el campo que contenga el nombre completo
            return map;
        }, {});

        // 5. "Enriquecemos" cada solución con el nombre del autor.
        const enrichedSolutions = solutions.map(solution => {

            // Obtenemos el nombre completo que viene del authorMap (ej: "Daniela Elizabeth Villalta Sorto")
            const fullName = authorMap[solution.userId] || 'Usuario desconocido';

            let displayName = fullName; // Inicializamos con el nombre completo (en caso de que solo sea un nombre)

            if (fullName !== 'Usuario desconocido') {
                const nameParts = fullName.split(' ');

                // Verificamos que haya al menos dos partes (Nombre y Apellido)
                if (nameParts.length >= 2) {
                    // Tomamos la primera palabra (Nombre) y la última palabra (Apellido).
                    displayName = `${nameParts[0]} ${nameParts[2]}`;
                }
            }

            return {
                ...solution,
                authorName: displayName // Asignamos el nombre simplificado
            };
        });

        todasLasTarjetas = enrichedSolutions; // Guardamos las tarjetas ya enriquecidas

        // 6. Renderizamos el contenido con los datos ya completos.
        renderContent(enrichedSolutions);

        if (dropdownButton) {
            dropdownButton.textContent = "Todas las categorías";
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No se pudieron cargar los datos de la API. Por favor, asegúrate de que el enlace esté activo.',
            width: "90%"
        });
    }
}

/**
 * Filtra las tarjetas por categoría y renderiza el resultado.
 */
function filtrarPorCategoria(idCategoria) {
    const tarjetasFiltradas = idCategoria === 0 ?
        todasLasTarjetas :
        todasLasTarjetas.filter(t => t.categoryId === idCategoria);
    renderContent(tarjetasFiltradas);
}

// --- Manejo de Formularios y CRUD ---

/**
 * Prepara el formulario para el modo Editar.
 */
function prepareForEdit() {
    if (!currentSolutionId) return;

    if (modal) modal.classList.add("oculto");

    const articuloSeleccionado = todasLasTarjetas.find(t => t.solutionId == currentSolutionId);

    if (articuloSeleccionado) {
        // Rellenar campos (CORRECCIÓN DE NOMBRES)
        if (tituloInput) tituloInput.value = articuloSeleccionado.solutionTitle; // CORRECCIÓN
        if (descripcionInput) descripcionInput.value = articuloSeleccionado.descriptionS; // CORRECCIÓN
        if (solucionInput) solucionInput.value = articuloSeleccionado.solutionSteps;
        if (palabrasClaveInput) palabrasClaveInput.value = articuloSeleccionado.keyWords; // CORRECCIÓN

        // Rellenar dropdown
        // CORRECCIÓN: Obtener el ID desde el objeto 'category'
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

    // ELIMINAR LA FECHA: const date = new Date().toISOString(); 

    // Leer el ID de la categoría y el NOMBRE para construir el CategoryDTO
    const categoryId = parseInt(dropdownButtonForm.dataset.id || '1');
    const categoryName = dropdownButtonForm.textContent.trim(); // Se necesita el nombre

    if (!titulo || !descripcion || !solucion) {
        // ... (alerta)
        return;
    }

    const dataToSend = {
        // CORRECCIÓN DE NOMBRES DE CAMPOS para coincidir con el DTO
        "solutionTitle": titulo,
        "descriptionS": descripcion,
        "solutionSteps": solucion,
        "keyWords": palabrasClave,

        // CORRECCIÓN CRÍTICA: Se envía el objeto 'category' con su 'id' y 'displayName'
        "category": {
            "id": categoryId,
            "displayName": categoryName
        },

        "userId": getUserId()
        // ELIMINAR: updateDate: date, ya que el backend lo genera
    };

    try {
        await saveSolution(currentSolutionId, dataToSend); // Llama al servicio

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
        CargarDatosIniciales(); // Recarga los datos y la UI
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
            await deleteSolution(currentSolutionId); // Llama al servicio

            Swal.fire({
                title: 'Eliminado!',
                text: 'La solución ha sido eliminada.',
                icon: 'success',
                showConfirmButton: false,
                timer: 1500,
            });
            if (modal) modal.classList.add('oculto');
            CargarDatosIniciales(); // Recarga los datos y la UI
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

// --- Event Listeners Globales (Inicialización) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log("Token directo desde localStorage:", localStorage.getItem('jwt_token'));
    // NUEVO: Verificación de autenticación al cargar la página.
    // Esto es idéntico a lo que hiciste en dashboardController.
    const token = getAuthToken();
    if (!token) {
        // Si no hay token, no hacemos nada más y redirigimos al login.
        window.location.href = '../../inicioSesion.html'; // Ajusta la ruta si es necesario
        return;
    }

    // Si hay token, todo el código de inicialización se ejecuta normalmente.
    // 1. Cargar datos iniciales
    CargarDatosIniciales();

    // 2. Configurar el modal de lectura
    if (btnCerrar && modal) {
        btnCerrar.addEventListener("click", () => modal.classList.add('oculto'));
    }
    if (btnEdit) {
        btnEdit.addEventListener("click", prepareForEdit);
    }
    if (btnDelete) {
        btnDelete.addEventListener("click", handleDelete);
    }

    // 3. Configurar el modal de Agregar/Editar
    if (btnAgregar) {
        btnAgregar.addEventListener("click", () => {
            if (frmAgregar) frmAgregar.reset();
            currentSolutionId = null; // Reiniciar a modo 'Agregar'
            if (modalAgregarTitulo) modalAgregarTitulo.textContent = "Agregar solución";
            if (modalAgregar) modalAgregar.classList.remove("oculto");
            // Reiniciar el dropdown del formulario
            if (dropdownButtonForm) {
                dropdownButtonForm.textContent = "Categoría";
                dropdownButtonForm.dataset.id = '';
                dropdownButtonForm.style.color = '#877575';
            }
        });
    }
    if (btnCerrarAgregar) {
        btnCerrarAgregar.addEventListener("click", () => modalAgregar.classList.add("oculto"));
    }
    if (frmAgregar) {
        frmAgregar.addEventListener("submit", handleFormSubmit);
    }

    // 4. Configurar el dropdown de Filtro
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

    // 5. Configurar el dropdown del Formulario
    if (dropdownMenuFormItems) {
        dropdownMenuFormItems.forEach(item => {
            item.addEventListener('click', function (e) {
                e.preventDefault();
                const selectedText = this.textContent;
                const selectedId = this.dataset.id;
                if (dropdownButtonForm) {
                    dropdownButtonForm.textContent = selectedText;
                    dropdownButtonForm.dataset.id = selectedId;
                    dropdownButtonForm.style.setProperty('color', '#000', 'important');
                }
            });
        });
    }

    // 6. Configurar la Búsqueda
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const filteredData = todasLasTarjetas.filter(item => {
                const searchFields = [item.title, item.description, item.solutionSteps, item.keywords, item.userId];
                return searchFields.some(field => field && field.toLowerCase().includes(searchTerm));
            });
            renderContent(filteredData);
        });
    }
});