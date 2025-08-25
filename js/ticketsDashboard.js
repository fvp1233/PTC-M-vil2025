import { fetchWithAuth, getUserId } from './auth.js';

const API_URL  = 'https://api.tuservidor.com/tickets';  // Ajusta a tu endpoint real
let ticketData = [];

/**
 * Trunca el texto de las descripciones en pantallas ≤768px
 */
function truncateDescriptions(maxChars = 23) {
  const descriptions = document.querySelectorAll('.description p');
  descriptions.forEach(desc => {
    if (!desc.dataset.fullText) {
      desc.dataset.fullText = desc.textContent.trim();
    }
    const originalText = desc.dataset.fullText;

    if (window.innerWidth <= 768) {
      if (originalText.length > maxChars) {
        let truncated = '';
        const words = originalText.split(' ');
        for (let word of words) {
          if ((truncated + word).length <= maxChars) {
            truncated += word + ' ';
          } else {
            break;
          }
        }
        desc.textContent = truncated.trim()
          ? truncated.trim() + '...'
          : originalText.slice(0, maxChars) + '...';
      } else {
        desc.textContent = originalText;
      }
    } else {
      desc.textContent = originalText;
    }
  });
}

/**
 * Renderiza las tarjetas de tickets en el DOM
 */
function renderTickets(tickets) {
  const container = document.querySelector('.row.gx-0 .col-12');
  container.innerHTML = '';

  if (tickets.length === 0) {
    const main = document.querySelector('main');
    if (!document.querySelector('.noTickets')) {
      const noTicketsHTML =
        `<div class="row text-center g-0 noTickets">
           <div class="col">
             <img src="img/gigapixel-image_23-removebg-preview (1).png"
                  alt="No hay Tickets" />
             <div class="Ntext">
               <strong><p>No tienes Tickets</p></strong>
               <p>Parece que no tienes ningún ticket en proceso.
                  Por favor crea uno para reportar un problema</p>
             </div>
           </div>
         </div>`;
      main.insertAdjacentHTML('beforeend', noTicketsHTML);
    }
    return;
  }

  const noTicketsDiv = document.querySelector('.noTickets');
  if (noTicketsDiv) noTicketsDiv.remove();

  tickets.forEach((ticket, index) => {
    const isLast      = index === tickets.length - 1;
    const estadoClase = {
      'pendiente': 'bg-danger',
      'en espera': 'bg-warning',
      'en proceso': 'bg-orange',
      'completado': 'bg-success'
    }[ticket.estado.toLowerCase()] || 'bg-secondary';

    const prioridadClase       = ticket.prioridad.toLowerCase();
    const prioridadCapitalizada = ticket.prioridad.charAt(0).toUpperCase()
                                + ticket.prioridad.slice(1);
    const dia   = ticket.fecha.dia;
    const mes   = ticket.fecha.mes.slice(0, 3);
    const año   = ticket.fecha.año.toString().slice(-2);

    const card = document.createElement('div');
    card.className   = 'card mx-auto';
    card.style.width = '97%';
    if (isLast) card.style.marginBottom = '90px';

    card.innerHTML =
      `<div class="card-body">
         <div class="d-flex flex-wrap align-items-start ticket-row">
           <div class="ticket-col1">
             <div class="idText"><strong><p>${dia}</p></strong></div>
             <div class="date"><strong><p>${mes},${año}</p></strong></div>
           </div>
           <div class="ticket-col2">
             <div class="description"><p>${ticket.descripcion}</p></div>
             <div class="id"><p>#${ticket.id}</p></div>
             <div class="TicketStatus">
               <span class="badge ${estadoClase}">
                 ${ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)}
               </span>
             </div>
           </div>
           <div class="ticket-col3">
             <button class="btn-icon1" type="button">
               <svg class="iconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                 <path fill="currentColor" d="M12 21q-3.15 0-5.575-1.912T3.275 14.2q-.1-.375.
                   . . (ruta SVG completa)"/>
               </svg>
             </button>
             <div class="AnotherDiv">
               <p class="TicketPriority">
                 Prioridad: <span class="${prioridadClase}">
                   ${prioridadCapitalizada}
                 </span>
               </p>
               <svg class="iconSVG svg2" xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24">
                 <path fill="#989494"
                       d="M2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825
                         -.587 1.413T20 18H6zm4-8h8v-2H6zm0-3h12V9H6zm0-3h12V6H6z"/>
               </svg>
             </div>
           </div>
         </div>
       </div>`;
    container.appendChild(card);
  });

  truncateDescriptions();
}

/**
 * Carga los tickets desde la API usando fetchWithAuth y filtra por userId
 */
async function loadTicketsFromAPI() {
  const userId = getUserId();
  if (!userId) {
    console.error('No se encontró userId. Redirigiendo al inicio de sesión.');
    window.location.href = 'inicioSesion.html';
    return;
  }

  const url = `${API_URL}?userId=${encodeURIComponent(userId)}`;

  try {
    const response = await fetchWithAuth(url, { method: 'GET' });

    if (!response.ok) {
      console.error(`Error ${response.status}: ${response.statusText}`);
      throw new Error('La API devolvió un estado no OK');
    }

    const data = await response.json();
    ticketData  = Array.isArray(data) ? data : [];
    renderTickets(ticketData);

  } catch (err) {
    console.error('No se pudieron cargar los tickets:', err);
    const main = document.querySelector('main');
    main.insertAdjacentHTML('beforeend', `
      <div class="alert alert-danger" role="alert">
        Ocurrió un error al cargar tus tickets.
        Por favor, inténtalo de nuevo más tarde.
      </div>
    `);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadTicketsFromAPI();
  window.addEventListener('resize', truncateDescriptions);

  // Configura los filtros
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn')
              .forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filtro = button.textContent.trim().toLowerCase();
      const dataFiltrada = filtro === 'todo'
        ? ticketData
        : ticketData.filter(t => t.estado.toLowerCase() === filtro);

      renderTickets(dataFiltrada);
    });
  });

  // Maneja clics en iconos de auditoría y tarjetas
  document.addEventListener('click', e => {
    const iconBtn = e.target.closest('.btn-icon1');
    if (iconBtn) {
      const tarjeta = iconBtn.closest('.card');
      const idNum   = tarjeta.querySelector('.id p')
                         .textContent.replace('#', '').trim();
      localStorage.setItem('ticketAuditoriaID', idNum);
      window.location.href = 'TicketAuditory.html';
      return;
    }

    const tarjeta = e.target.closest('.card');
    if (tarjeta) {
      const idNum = tarjeta.querySelector('.id p')
                         .textContent.replace('#', '').trim();
      window.location.href = `TicketInformation.html?id=${idNum}`;
    }
  });
});