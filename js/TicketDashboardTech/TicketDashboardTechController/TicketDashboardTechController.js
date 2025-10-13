import { getAssignedTicketsByTech } from '../TicketDashboardTechService/TicketDashboardTechService.js';
import { me } from '../../Login/AuthService/authService.js';

// Variable para almacenar los tickets cargados
let allTickets = [];

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
        desc.textContent = truncated.trim() ? truncated.trim() + '...' : originalText.slice(0, maxChars) + '...';
      } else {
        desc.textContent = originalText;
      }
    } else {
      desc.textContent = originalText;
    }
  });
}

function renderTickets(tickets) {
  const container = document.querySelector('#ticketsContainer');
  
  if (!container) {
    console.error('ERROR: No se encontró el contenedor #ticketsContainer en el DOM');
    return;
  }
  
  container.innerHTML = '';

  if (tickets.length === 0) {
    const main = document.querySelector('main');
    if (!document.querySelector('.noTickets')) {
      const noTicketsHTML =
        `<div class="row text-center g-0 noTickets">
          <div class="col">
            <img class="" src="img/gigapixel-image_23-removebg-preview (1).png" alt="No hay Tickets">
            <div class="Ntext">
              <strong><p>No tienes Tickets Asignados</p></strong>
              <p>Los tickets que aceptes desde el dashboard aparecerán aquí para que puedas darles seguimiento</p>
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
    const isLast = index === tickets.length - 1;

    const estadoClase = {
      'En espera': 'bg-warning',
      'En progreso': 'bg-orange',
      'Completado': 'bg-success'
    }[ticket.status.displayName] || 'bg-secondary';

    const prioridadClase = ticket.priority.displayName.toLowerCase();
    const prioridadCapitalizada = ticket.priority.displayName.charAt(0).toUpperCase() + ticket.priority.displayName.slice(1);

    const creationDate = new Date(ticket.creationDate);
    const dia = creationDate.getDate();
    const mes = creationDate.toLocaleString('es-ES', { month: 'long' }).slice(0, 3);
    const año = creationDate.getFullYear().toString().slice(-2);

    const card = document.createElement('div');
    card.className = 'card mx-auto';
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
            <div class="description"><p>${ticket.title}</p></div>
            <div class="id"><p>#${ticket.ticketId}</p></div>
            <div class="TicketStatus">
              <span class="badge ${estadoClase}">${ticket.status.displayName.charAt(0).toUpperCase() + ticket.status.displayName.slice(1)}</span>
            </div>
          </div>
          <div class="ticket-col3">
            <button class="btn-icon1" type="button">
              <svg class="iconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 21q-3.15 0-5.575-1.912T3.275 14.2q-.1-.375.15-.687t.675-.363q.4-.05.725.15t.45.6q.6 2.25 2.475 3.675T12 19q2.925 0 4.963-2.037T19 12t-2.037-4.962T12 5q-1.725 0-3.225.8T6.25 8H8q.425 0 .713.288T9 9t-.288.713T8 10H4q-.425 0-.712-.288T3 9V5q0-.425.288-.712T4 4t.713.288T5 5v1.35q1.275-1.6 3.113-2.475T12 3q1.875 0 3.513.713t2.85 1.924t1.925 2.85T21 12t-.712 3.513t-1.925 2.85t-2.85 1.925T12 21m1-9.4l2.5 2.5q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.8-2.8q-.15-.15-.225-.337T11 11.975V8q0-.425.288-.712T12 7t.713.288T13 8z"/>
              </svg>
            </button>
            <div class="AnotherDiv">
              <p class="TicketPriority">Prioridad: <span class="${prioridadClase}">${prioridadCapitalizada}</span></p>
              <svg class="iconSVG svg2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="#989494" d="M2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18H6zm4-8h8v-2H6zm0-3h12V9H6zm0-3h12V6H6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
  truncateDescriptions();
}

document.addEventListener('DOMContentLoaded', async () => {
  // Obtener el userId desde el token/authme
  let loggedInUserId = null;
  
  try {
    const userData = await me();
    loggedInUserId = userData.userId;
    
    if (!loggedInUserId) {
      console.error('No se encontró el ID de usuario.');
      return;
    }
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return;
  }

  try {
    // Cargar los tickets ASIGNADOS al técnico
    allTickets = await getAssignedTicketsByTech(loggedInUserId);
    renderTickets(allTickets);
  } catch (error) {
    console.error('Error al cargar los tickets asignados:', error);
    const container = document.querySelector('#ticketsContainer');
    if (container) {
      container.innerHTML = `<p class="text-danger text-center">Ocurrió un error al cargar los tickets.</p>`;
    }
  }

  window.addEventListener('resize', truncateDescriptions);

  // ✅ CAMBIO: Filtros por PRIORIDAD en lugar de estado
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      let filtro = button.textContent.trim().toLowerCase();

      // Normalizar el filtro para que coincida con los displayName
      const filtroNormalizado = filtro.charAt(0).toUpperCase() + filtro.slice(1);

      const dataFiltrada = (filtro === 'todo')
        ? allTickets
        : allTickets.filter(t => t.priority.displayName.toLowerCase() === filtro);
      
      renderTickets(dataFiltrada);
    });
  });

  // Navegación al hacer clic en un ticket
  document.addEventListener('click', e => {
    const iconBtn = e.target.closest('.btn-icon1');
    const tarjeta = e.target.closest('.card');

    if (tarjeta) {
      const idElemento = tarjeta.querySelector('.id p');
      if (idElemento) {
        const idNum = idElemento.textContent.replace('#', '').trim();
        if (idNum) {
          if (iconBtn) {
            // Navegación para el historial (si tienes esta funcionalidad)
            localStorage.setItem('ticketAuditoriaID', idNum);
            window.location.href = 'TicketAuditoryTech.html';
          } else {
            // Navegación para ver detalles del ticket
            window.location.href = `ticketInformationTech.html?id=${idNum}`;
          }
        }
      }
    }
  });
});