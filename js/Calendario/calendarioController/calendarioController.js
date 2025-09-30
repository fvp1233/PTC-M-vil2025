// Archivo: calendarioController.js
// Contiene la lógica para manipular el DOM y manejar los eventos.

// Importa las funciones del servicio de autenticación
import { getUserId } from '../../Login/AuthService/authService.js';

// Importa las funciones del servicio del calendario
import {
    getRecentTicketsByUser,
    capitalizeFirstLetter,
    getLocalISODate,
    formatTicketNumber,
    formatDateDay,
    formatDateMonthYear,
    getStatusClass,
    getPriorityClass
} from '../calendarioService/calendarioService.js';

// Variables de estado del calendario
let currentDate = new Date();
let selectedDate = getLocalISODate();
let tickets = [];
let opcion = "creacion";

// Referencias a elementos del DOM
const creacion = document.getElementById("creacion");
const cierre = document.getElementById("cierre");
const mesAno = document.getElementById("mes-ano");
const datesEl = document.getElementById("cal-dates");
const contTickets = document.getElementById("ticket-info");

/**
 * Función principal para cargar los tickets y renderizar el calendario.
 * Asegura que los datos se carguen antes de renderizar la vista.
 */
async function loadTicketsAndRender() {
    console.log("Iniciando la carga de tickets...");
    try {
        const userId = await getUserId();
        
        // 🚨 CAMBIO CLAVE: Verificamos si se obtuvo un userId válido.
        if (!userId) {
            console.error("Error: No se pudo obtener el ID del usuario. Es posible que no esté autenticado.");
            if (contTickets) {
                contTickets.innerHTML = "<p>No se pudo cargar el calendario. Por favor, inicia sesión de nuevo.</p>";
            }
            renderCalendar(); // Renderiza el calendario vacío para que la interfaz se vea bien
            return;
        }

        console.log(`Usuario autenticado con ID: ${userId}`);

        // Carga los tickets usando la API. Ya no necesitamos llamar a getAuthToken()
        // ya que fetchWithAuth ya maneja la autenticación por medio de cookies.
        tickets = await getRecentTicketsByUser(userId);
        console.log("Tickets cargados desde la API:", tickets);

        // Si no hay tickets, mostramos un mensaje y terminamos.
        if (tickets.length === 0) {
            console.log("No se encontraron tickets. La lista de tickets está vacía.");
            if (contTickets) {
                contTickets.innerHTML = "<p>No hay tickets para mostrar.</p>";
            }
            // También podemos renderizar el calendario para que la interfaz se vea bien
            renderCalendar();
            return;
        }

        // Si hay tickets, continuamos con el renderizado
        renderAll();
    } catch (error) {
        console.error("Error al cargar los tickets:", error);
        if (contTickets) {
            contTickets.innerHTML = "<p>Error al cargar los tickets. Por favor, asegúrate de que tu servidor está en funcionamiento y la API es accesible.</p>";
        }
    }
}

/**
 * Renderiza el calendario y la lista de tickets.
 */
function renderAll() {
    renderCalendar();
    console.log("Fecha seleccionada:", selectedDate);
    if (opcion === "creacion") {
        showTicketsCreacion(selectedDate);
    } else if (opcion === "cierre") {
        showTicketsCierre(selectedDate);
    }
}

/**
 * Renderiza la cuadrícula del calendario con las fechas.
 */
function renderCalendar() {
    if (!mesAno || !datesEl) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    mesAno.textContent = `${capitalizeFirstLetter(
        currentDate.toLocaleString("es", { month: "long" })
    )} ${year}`;
    datesEl.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const offset = (firstDay + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        datesEl.appendChild(empty);
    }

    for (let d = 1; d <= totalDays; d++) {
        const dt = new Date(year, month, d);
        const str = dt.toISOString().slice(0, 10);
        
        // Log para cada fecha del calendario y si coincide con un ticket
        const hasCreationTicket = tickets.some((t) => t.creationDate && t.creationDate.slice(0, 10) === str);
        const hasCloseTicket = tickets.some((t) => t.closeDate && t.closeDate.slice(0, 10) === str);
        
        // Console log para ver si alguna fecha del calendario tiene un ticket
        if (opcion === "creacion" && hasCreationTicket) {
             console.log(`Ticket de creación encontrado para el día ${str}`);
        }
        if (opcion === "cierre" && hasCloseTicket) {
             console.log(`Ticket de cierre encontrado para el día ${str}`);
        }

        const div = document.createElement("div");
        div.textContent = d;
        div.setAttribute("data-date", str);

        if (str === getLocalISODate()) {
            div.classList.add("today");
        }

        if (opcion === "creacion") {
            if (hasCreationTicket) {
                div.classList.add("has-ticket");
            }
        } else if (opcion === "cierre") {
            if (hasCloseTicket) {
                div.classList.add("has-ticket");
            }
        }

        if (str === selectedDate) {
            div.classList.add("selected-date");
        }

        div.addEventListener("click", () => {
            const previouslySelected = document.querySelector(".cal-dates .selected-date");
            if (previouslySelected) {
                previouslySelected.classList.remove("selected-date");
            }
            div.classList.add("selected-date");
            selectedDate = str;
            if (opcion === "creacion") {
                showTicketsCreacion(selectedDate);
            } else if (opcion === "cierre") {
                showTicketsCierre(selectedDate);
            }
        });
        datesEl.appendChild(div);
    }
}

/**
 * Muestra los tickets creados en la fecha específica.
 * @param {string} fecha La fecha en formato ISO (YYYY-MM-DD).
 */
function showTicketsCreacion(fecha) {
    if (!contTickets) return;

    // Log para ver si la fecha del ticket coincide con la fecha del calendario
    console.log(`Filtrando tickets para la fecha de creación: ${fecha}`);

    const lista = tickets.filter((t) => {
        const creationDate = t.creationDate ? t.creationDate.slice(0, 10) : null;
        console.log(`Ticket ID: ${t.ticketId}, Fecha de creación: ${creationDate}, ¿Coincide?: ${creationDate === fecha}`);
        return creationDate === fecha;
    });

    contTickets.innerHTML = `<h3 class="ticketsen">Tickets creados en ${fecha}:</h3>`;

    if (lista.length === 0) {
        contTickets.innerHTML += "<p>No hay tickets.</p>";
        return;
    }

    lista.forEach((t) => {
        const tarjeta = createTicketCard(t, t.creationDate);
        contTickets.appendChild(tarjeta);
    });
}

/**
 * Muestra los tickets que se cierran en la fecha específica.
 * @param {string} fecha La fecha en formato ISO (YYYY-MM-DD).
 */
function showTicketsCierre(fecha) {
    if (!contTickets) return;

    // Log para ver si la fecha del ticket coincide con la fecha del calendario
    console.log(`Filtrando tickets para la fecha de cierre: ${fecha}`);

    const lista = tickets.filter((t) => {
        const closeDate = t.closeDate ? t.closeDate.slice(0, 10) : null;
        console.log(`Ticket ID: ${t.ticketId}, Fecha de cierre: ${closeDate}, ¿Coincide?: ${closeDate === fecha}`);
        return closeDate === fecha;
    });

    contTickets.innerHTML = `<h3 class="ticketsen">Tickets que se cierran en ${fecha}:</h3>`;

    if (lista.length === 0) {
        contTickets.innerHTML += "<p>No hay tickets.</p>";
        return;
    }

    lista.forEach((t) => {
        const tarjeta = createTicketCard(t, t.closeDate);
        contTickets.appendChild(tarjeta);
    });
}

/**
 * Crea la tarjeta de ticket (elemento de DOM).
 * @param {object} t El objeto ticket.
 * @param {string} dateString La cadena de fecha para mostrar.
 * @returns {HTMLDivElement} El elemento de la tarjeta.
 */
function createTicketCard(t, dateString) {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    const ticketNumber = formatTicketNumber(t.ticketId);
    const statusClass = getStatusClass(t);
    const priorityClass = getPriorityClass(t);

    tarjeta.innerHTML = `
        <div class="fecha">
            <p class="dia">${formatDateDay(dateString)}</p>
            <p class="mesanio">${formatDateMonthYear(dateString)}</p>
        </div>
        <div class="info">
            <p class="ticket-title">${t.title}</p>
            <div class="descripcion">
                <p class="ticket-number">#${ticketNumber}</p>
                <div class="prioridad">
                    <p>Prioridad:</p>
                    <p class="${priorityClass}">${t.priority?.displayName || ''}</p>
                </div>
            </div>
            <span class="ticket-status">
                <p class="${statusClass}">${t.status?.displayName || ''}</p>
            </span>
        </div>
        <div class="iconos">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C9.7 21 7.696 20.2377 5.988 18.713C4.28 17.1883 3.30067 15.284 3.05 13H5.1C5.33333 14.7333 6.10433 16.1667 7.413 17.3C8.72167 18.4333 10.2507 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H9V10H3V4H5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM14.8 16.2L11 12.4V7H13V11.6L16.2 14.8L14.8 16.2Z" fill="black" />
            </svg>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.20841 20.4707V17.3333H6.50008C6.21276 17.3333 5.93721 17.2192 5.73405 17.016C5.53088 16.8129 5.41675 16.5373 5.41675 16.25V7.58333C5.41675 7.29602 5.53088 7.02047 5.73405 6.8173C5.93721 6.61414 6.21276 6.5 6.50008 6.5H19.5001C19.7874 6.5 20.063 6.61414 20.2661 6.8173C20.4693 7.02047 20.5834 7.29602 20.5834 7.58333V16.25C20.5834 16.5373 20.4693 16.8129 20.2661 17.016C20.063 17.2192 19.7874 17.3333 19.5001 17.3333H13.0001L9.671 20.6624C9.63312 20.7004 9.58482 20.7263 9.53222 20.7368C9.47962 20.7472 9.42509 20.7419 9.37554 20.7213C9.32599 20.7008 9.28366 20.666 9.2539 20.6214C9.22415 20.5768 9.20832 20.5243 9.20841 20.4707ZM8.66675 13.5417C8.66675 13.398 8.72382 13.2602 8.8254 13.1587C8.92698 13.0571 9.06476 13 9.20841 13H16.7917C16.9354 13 17.0732 13.0571 17.1748 13.1587C17.2763 13.2602 17.3334 13.398 17.3334 13.5417C17.3334 13.6853 17.2763 13.8231 17.1748 13.9247C17.0732 14.0263 16.9354 14.0833 16.7917 14.0833H9.20841C9.06476 14.0833 8.92698 14.0263 8.8254 13.9247C8.72382 13.8231 8.66675 13.6853 8.66675 13.5417ZM9.20841 9.75C9.06476 9.75 8.92698 9.80707 8.8254 9.90865C8.72382 10.0102 8.66675 10.148 8.66675 10.2917C8.66675 10.4353 8.72382 10.5731 8.8254 10.6747C8.92698 10.7763 9.06476 10.8333 9.20841 10.8333H16.7917C16.9354 10.8333 17.0732 10.7763 17.1748 10.6747C17.2763 10.5731 17.3334 10.4353 17.3334 10.2917C17.3334 10.148 17.2763 10.0102 17.1748 9.90865C17.0732 9.80707 16.9354 9.75 16.7917 9.75H9.20841Z" fill="black" />
            </svg>
        </div>
    `;
    return tarjeta;
}


// Navegación del calendario
document.getElementById("prev").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderAll();
});

document.getElementById("next").addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderAll();
});

// Lógica del menú desplegable
const dropdown = document.querySelector(".dropdown");
const select = dropdown.querySelector(".select");
const caret = dropdown.querySelector(".caret");
const menu = dropdown.querySelector(".menudropdown");
const options = dropdown.querySelectorAll(".menudropdown li");
const selectedText = dropdown.querySelector(".selected");

if (select) {
    select.addEventListener("click", () => {
        select.classList.toggle("select-clicked");
        caret.classList.toggle("caret-rotate");
        menu.classList.toggle("menudropdown-open");
    });
}

options.forEach((option) => {
    option.addEventListener("click", () => {
        selectedText.innerText = option.innerText;
        select.classList.remove("select-clicked");
        caret.classList.remove("caret-rotate");
        menu.classList.remove("menudropdown-open");

        options.forEach((opt) => opt.classList.remove("active"));
        option.classList.add("active");

        if (option.innerText.toLowerCase() === "creación") {
            opcion = "creacion";
        } else if (option.innerText.toLowerCase() === "cierre") {
            opcion = "cierre";
        }
        renderAll();
    });
});

// Cargar datos al iniciar la página
window.addEventListener("DOMContentLoaded", loadTicketsAndRender);
