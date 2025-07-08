let currentDate = new Date();

const API_URL = 'https://6864654f5b5d8d03397d1e12.mockapi.io/Daniela/tbTickets';
let tickets = [];

const creacion = document.getElementById("creacion");
const cierre = document.getElementById("cierre");

// Cargar los tickets desde la API
async function CargarTickets() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    tickets = data;
    renderCalendar();
  } catch (error) {
    console.error('Error al cargar los tickets:', error);
    document.getElementById("ticket-info").innerHTML = '<p>Error al cargar los tickets.</p>';
  }
}

function primeraLetraMayuscula(cadena) {
  return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}

function obtenerFechaLocalISO(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000; // en milisegundos
  const localISO = new Date(date - offset).toISOString().slice(0, 10);
  return localISO;
}

// Renderizar el calendario
function renderCalendar() {
  const mesAno = document.getElementById("mes-ano");
  const datesEl = document.getElementById("cal-dates");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  mesAno.textContent = `${primeraLetraMayuscula(currentDate.toLocaleString('es', { month: 'long' }))} ${year}`;
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

    const div = document.createElement("div");
    div.textContent = d;

    if (str === obtenerFechaLocalISO()) {
      div.classList.add("today");
    }

    if (tickets.some(t => t.creationDate.slice(0, 10) === str || t.closeDate.slice(0, 10) === str)) {
      div.classList.add("has-ticket");
    }

    div.addEventListener("click", () => showTickets(str));

    datesEl.appendChild(div);
  }
}

function FormatearFechaDia(fechaISO) {
  const fecha = new Date(fechaISO);

  const dia = fecha.getDate().toString().padStart(2, '0');

  return `${dia}`;
}

function FormatearFechaMesAnio(fechaISO) {
  const fecha = new Date(fechaISO);
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const mes = meses[fecha.getMonth()];
  const año = fecha.getFullYear();

  return `${mes}, ${año}`;
}

// Muestra los tickets de una fecha
function showTicketsCreacion(fecha) {
  const lista = tickets.filter(t =>
    t.creationDate.slice(0, 10) === fecha || t.closeDate.slice(0, 10) === fecha
  );

  const cont = document.getElementById("ticket-info");
  cont.innerHTML = `<h3>Tickets en ${fecha}:</h3>`;

  if (lista.length === 0) {
    cont.innerHTML += "<p>No hay tickets.</p>";
    return;
  } else {
    const ul = document.createElement("ul");
    lista.forEach(t => {

      const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta';
            tarjeta.innerHTML = `
            <div class="fecha">
                <p class="dia">${FormatearFechaDia(t.creationDate)}</p>
                <p class="mesanio">${FormatearFechaMesAnio(t.creationDate)}</p>
            </div>
            <div class="info">
                <p>${t.title}</p>
                <p class="ticket-number">#${t.ticketId}</p>
                <span class="ticket-status">
                    <p>${t.status}</p>
                </span>
            </div> 
            <div class="prioridad">
                <p>Prioridad:</p>
                <p class="prioridad-color">${t.ticketPriority}</p>
            </div>
            <div class="iconos">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 21C9.7 21 7.696 20.2377 5.988 18.713C4.28 17.1883 3.30067 15.284 3.05 13H5.1C5.33333 14.7333 6.10433 16.1667 7.413 17.3C8.72167 18.4333 10.2507 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H9V10H3V4H5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM14.8 16.2L11 12.4V7H13V11.6L16.2 14.8L14.8 16.2Z"
                        fill="black" />
                </svg>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M9.20841 20.4707V17.3333H6.50008C6.21276 17.3333 5.93721 17.2192 5.73405 17.016C5.53088 16.8129 5.41675 16.5373 5.41675 16.25V7.58333C5.41675 7.29602 5.53088 7.02047 5.73405 6.8173C5.93721 6.61414 6.21276 6.5 6.50008 6.5H19.5001C19.7874 6.5 20.063 6.61414 20.2661 6.8173C20.4693 7.02047 20.5834 7.29602 20.5834 7.58333V16.25C20.5834 16.5373 20.4693 16.8129 20.2661 17.016C20.063 17.2192 19.7874 17.3333 19.5001 17.3333H13.0001L9.671 20.6624C9.63312 20.7004 9.58482 20.7263 9.53222 20.7368C9.47962 20.7472 9.42509 20.7419 9.37554 20.7213C9.32599 20.7008 9.28366 20.666 9.2539 20.6214C9.22415 20.5768 9.20832 20.5243 9.20841 20.4707ZM8.66675 13.5417C8.66675 13.398 8.72382 13.2602 8.8254 13.1587C8.92698 13.0571 9.06476 13 9.20841 13H16.7917C16.9354 13 17.0732 13.0571 17.1748 13.1587C17.2763 13.2602 17.3334 13.398 17.3334 13.5417C17.3334 13.6853 17.2763 13.8231 17.1748 13.9247C17.0732 14.0263 16.9354 14.0833 16.7917 14.0833H9.20841C9.06476 14.0833 8.92698 14.0263 8.8254 13.9247C8.72382 13.8231 8.66675 13.6853 8.66675 13.5417ZM9.20841 9.75C9.06476 9.75 8.92698 9.80707 8.8254 9.90865C8.72382 10.0102 8.66675 10.148 8.66675 10.2917C8.66675 10.4353 8.72382 10.5731 8.8254 10.6747C8.92698 10.7763 9.06476 10.8333 9.20841 10.8333H16.7917C16.9354 10.8333 17.0732 10.7763 17.1748 10.6747C17.2763 10.5731 17.3334 10.4353 17.3334 10.2917C17.3334 10.148 17.2763 10.0102 17.1748 9.90865C17.0732 9.80707 16.9354 9.75 16.7917 9.75H9.20841Z"
                        fill="black" />
                </svg>

            </div>
        `;
            notificaciones.appendChild(tarjeta);
    });
    cont.appendChild(ul);
  }
}

function showTicketsCierre(fecha) {
  const lista = tickets.filter(t =>
    t.creationDate.slice(0, 10) === fecha || t.closeDate.slice(0, 10) === fecha
  );

  const cont = document.getElementById("ticket-info");
  cont.innerHTML = `<h3>Tickets en ${fecha}:</h3>`;

  if (lista.length === 0) {
    cont.innerHTML += "<p>No hay tickets.</p>";
    return;
  } else {
    const ul = document.createElement("ul");
    lista.forEach(t => {

      const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta';
            tarjeta.innerHTML = `
            <div class="fecha">
                <p class="dia">01</p>
                <p class="mesanio">May, 25</p>
            </div>
            <div class="info">
                <p>No funcionan los filtros</p>
                <p class="ticket-number">#0001</p>
                <span class="ticket-status">
                    <p>En proceso</p>
                </span>
            </div> 
            <div class="prioridad">
                <p>Prioridad:</p>
                <p class="prioridad-color">Media</p>
            </div>
            <div class="iconos">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M12 21C9.7 21 7.696 20.2377 5.988 18.713C4.28 17.1883 3.30067 15.284 3.05 13H5.1C5.33333 14.7333 6.10433 16.1667 7.413 17.3C8.72167 18.4333 10.2507 19 12 19C13.95 19 15.6043 18.321 16.963 16.963C18.3217 15.605 19.0007 13.9507 19 12C18.9993 10.0493 18.3203 8.39533 16.963 7.038C15.6057 5.68067 13.9513 5.00133 12 5C10.85 5 9.775 5.26667 8.775 5.8C7.775 6.33333 6.93333 7.06667 6.25 8H9V10H3V4H5V6.35C5.85 5.28333 6.88767 4.45833 8.113 3.875C9.33833 3.29167 10.634 3 12 3C13.25 3 14.421 3.23767 15.513 3.713C16.605 4.18833 17.555 4.82967 18.363 5.637C19.171 6.44433 19.8127 7.39433 20.288 8.487C20.7633 9.57967 21.0007 10.7507 21 12C20.9993 13.2493 20.762 14.4203 20.288 15.513C19.814 16.6057 19.1723 17.5557 18.363 18.363C17.5537 19.1703 16.6037 19.812 15.513 20.288C14.4223 20.764 13.2513 21.0013 12 21ZM14.8 16.2L11 12.4V7H13V11.6L16.2 14.8L14.8 16.2Z"
                        fill="black" />
                </svg>
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                        d="M9.20841 20.4707V17.3333H6.50008C6.21276 17.3333 5.93721 17.2192 5.73405 17.016C5.53088 16.8129 5.41675 16.5373 5.41675 16.25V7.58333C5.41675 7.29602 5.53088 7.02047 5.73405 6.8173C5.93721 6.61414 6.21276 6.5 6.50008 6.5H19.5001C19.7874 6.5 20.063 6.61414 20.2661 6.8173C20.4693 7.02047 20.5834 7.29602 20.5834 7.58333V16.25C20.5834 16.5373 20.4693 16.8129 20.2661 17.016C20.063 17.2192 19.7874 17.3333 19.5001 17.3333H13.0001L9.671 20.6624C9.63312 20.7004 9.58482 20.7263 9.53222 20.7368C9.47962 20.7472 9.42509 20.7419 9.37554 20.7213C9.32599 20.7008 9.28366 20.666 9.2539 20.6214C9.22415 20.5768 9.20832 20.5243 9.20841 20.4707ZM8.66675 13.5417C8.66675 13.398 8.72382 13.2602 8.8254 13.1587C8.92698 13.0571 9.06476 13 9.20841 13H16.7917C16.9354 13 17.0732 13.0571 17.1748 13.1587C17.2763 13.2602 17.3334 13.398 17.3334 13.5417C17.3334 13.6853 17.2763 13.8231 17.1748 13.9247C17.0732 14.0263 16.9354 14.0833 16.7917 14.0833H9.20841C9.06476 14.0833 8.92698 14.0263 8.8254 13.9247C8.72382 13.8231 8.66675 13.6853 8.66675 13.5417ZM9.20841 9.75C9.06476 9.75 8.92698 9.80707 8.8254 9.90865C8.72382 10.0102 8.66675 10.148 8.66675 10.2917C8.66675 10.4353 8.72382 10.5731 8.8254 10.6747C8.92698 10.7763 9.06476 10.8333 9.20841 10.8333H16.7917C16.9354 10.8333 17.0732 10.7763 17.1748 10.6747C17.2763 10.5731 17.3334 10.4353 17.3334 10.2917C17.3334 10.148 17.2763 10.0102 17.1748 9.90865C17.0732 9.80707 16.9354 9.75 16.7917 9.75H9.20841Z"
                        fill="black" />
                </svg>

            </div>
        `;
            notificaciones.appendChild(tarjeta);
    });
    cont.appendChild(ul);
  }
}

// Botones de navegación
document.getElementById("prev").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
});

document.getElementById("next").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
});

// Espera a que cargue el HTML y luego carga los tickets
window.addEventListener('DOMContentLoaded', CargarTickets);

//Menu dropdown
const dropdown = document.querySelector('.dropdown');

const select = dropdown.querySelector('.select');
const caret = dropdown.querySelector('.caret');
const menu = dropdown.querySelector('.menudropdown');
const options = dropdown.querySelectorAll('.menudropdown li');
const selected = dropdown.querySelector('.selected');

select.addEventListener('click', () => {
  select.classList.toggle('select-clicked');
  caret.classList.toggle('caret-rotate');
  menu.classList.toggle('menudropdown-open');
})

options.forEach(option => {
  option.addEventListener('click', () => {
    selected.innerText = option.innerText;
    select.classList.remove('select-clicked');
    caret.classList.remove('caret-rotate');
    menu.classList.remove('menudropdown-open');
    options.forEach(option => {
      option.classList.remove('active');
    });
    option.classList.add('active');
  })
})