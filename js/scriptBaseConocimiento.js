API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

let todasLasTarjetas = []; // Aquí guardaremos los datos completos

// Variables globales para los elementos del modal
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");

// Elementos dentro del modal que vamos a rellenar dinámicamente
const modalTitle = modal.querySelector('.modal-content .modal-titulo h3'); // Selecciona el h3 dentro del modal
const modalAuthor = modal.querySelector('.modal-content .modal-datos p:first-child'); // El primer p en modal-datos (autor)
const modalDate = modal.querySelector('.modal-content .modal-datos p:last-child'); // El segundo p en modal-datos (fecha)
const modalInfo = modal.querySelector('.modal-content .modal-info p'); // El párrafo con la información completa


// Solicitud GET para cargar el contenido
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        todasLasTarjetas = data; // Guardamos los datos completos
        crearDropdown(); // Crear el dropdown una sola vez
        CargarContenido(data);  // Mostramos todas al inicio
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
    }
}

function CargarContenido(data) {
    const contenidoVista = document.getElementById('contenido');
    // Elimina solo las tarjetas, no el dropdown
    const tarjetasExistentes = contenidoVista.querySelectorAll('.tarjeta');
    tarjetasExistentes.forEach(t => t.remove());

    data.forEach(c => {
        // Formatear la fecha para que se vea bien en el modal
        const rawDate = new Date(c.updateDate); // Crea un objeto Date
        // Formato DD/MM/YYYY
        const formattedDate = `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;

        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5 style="font-size: 13px; font-weight: bold;">${c.title}</h5>
            <p>${c.description}</p>
            <p class="leer-mas"
                data-id="${c.solutionId}"
                data-title="${c.title}"
                data-description="${c.description}"
                data-full-solution="${c.solutionSteps}"
                data-author="${c.userId}"  data-date="${formattedDate}" >Leer más</p>
        `;
        contenidoVista.appendChild(tarjeta);
    });

    attachLeerMasEventListeners();
}

function attachLeerMasEventListeners() {
    const btnAbrirModalLeerMasList = document.querySelectorAll(".leer-mas");

    btnAbrirModalLeerMasList.forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target; // El botón "Leer más" que fue clickeado

            // Obtener los datos de los data-attributes
            const articleTitle = currentButton.dataset.title;
            const articleFullSolution = currentButton.dataset.fullSolution;
            const articleAuthor = currentButton.dataset.author;
            const articleDate = currentButton.dataset.date;

            // Rellenar el contenido del modal con los datos obtenidos
            if (modalTitle) modalTitle.textContent = articleTitle;
            if (modalInfo) modalInfo.innerHTML = articleFullSolution; // Usar innerHTML si solutionSteps tiene tags HTML

            // Rellenar los datos de autor y fecha
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${articleAuthor}`;
            if (modalDate) modalDate.textContent = `Fecha: ${articleDate}`;

            // Mostrar el modal
            modal.style.display = 'block'; // CAMBIO A display: block
        });
    });
}

// Listener para el botón de cerrar modal (flechaIzquierda)
if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        modal.style.display = 'none'; // CAMBIO A display: none
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

function crearDropdown() {
    const contenidoVista = document.getElementById('contenido');

    // Verifica si ya existe el dropdown
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

    // Lo agregamos al principio del .contenido para que esté encima de las tarjetas
    contenidoVista.insertBefore(dropdown, contenidoVista.firstChild);


    // Evento para cambiar texto y filtrar
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

window.addEventListener('DOMContentLoaded', CargarDatos);
