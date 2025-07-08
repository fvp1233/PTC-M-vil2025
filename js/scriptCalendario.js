let currentDate = new Date();

const API_URL = 'https://6864654f5b5d8d03397d1e12.mockapi.io/Daniela/tbTickets';
let tickets = [];

// Carga los tickets desde la API
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

// Renderiza el calendario
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

// Muestra los tickets de una fecha
function showTickets(fecha) {
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
      const li = document.createElement("li");
      li.innerHTML = `<strong>${t.title}</strong> (${t.ticketId})<br>${t.description}`;
      ul.appendChild(li);
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