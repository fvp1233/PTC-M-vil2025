
import { getAssignedTicketsByTech, getUserById } from "../js/DashboardTech/dashboardTechService/ticketTechService.js";

import { getUserId } from "./authService.js";

// Funciones de utilidad que se mantienen
function truncateDescriptions(maxChars = 23) {
  document.querySelectorAll('.description p').forEach(desc => {
    if (!desc.dataset.fullText) desc.dataset.fullText = desc.textContent.trim();
    const original = desc.dataset.fullText;
    if (window.innerWidth <= 768 && original.length > maxChars) {
      let truncated = '',
        words = original.split(' ');
      for (let w of words) {
        if ((truncated + w).length <= maxChars) truncated += w + ' ';
        else break;
      }
      desc.textContent = truncated.trim() + '...';
    } else {
      desc.textContent = original;
    }
  });
}

function renderTickets(tickets) {
  const container = document.querySelector('.row.gx-0 .col-12');
  container.innerHTML = '';

  if (tickets.length === 0) {
    const main = document.querySelector('main');
    if (!document.querySelector('.noTickets')) {
      main.insertAdjacentHTML('beforeend', `
        <div class="row text-center g-0 noTickets">
          <div class="col">
            <img src="img/gigapixel-image_23-removebg-preview (1).png" alt="No hay Tickets">
            <div class="Ntext">
              <strong><p>No tienes Tickets</p></strong>
              <p>Parece que no tienes ningún ticket en proceso. Por favor crea uno para reportar un problema</p>
            </div>
          </div>
        </div>
      `);
    }
    return;
  }

  document.querySelectorAll('.noTickets').forEach(el => el.remove());

  tickets.forEach((ticket, idx) => {
    const isLast = idx === tickets.length - 1;
    const prio = ticket.prioridad?.toLowerCase() || 'baja';
    const badgeClass = {
      baja: 'bg-success',
      media: 'bg-warning',
      alta: 'bg-orange',
      critica: 'bg-danger'
    }[prio] || 'bg-secondary';
    const prioText = prio.charAt(0).toUpperCase() + prio.slice(1);

    const fecha = new Date(ticket.creationDate);
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
    const año = fecha.getFullYear().toString().slice(-2);

    const card = document.createElement('div');
    card.className = 'card mx-auto';
    card.style.width = '97%';
    if (isLast) card.style.marginBottom = '90px';

    card.innerHTML = `
      <div class="card-body">
        <div class="d-flex flex-wrap align-items-start ticket-row">
          <div class="ticket-col1">
            <div class="idText"><strong><p>${dia}</p></strong></div>
            <div class="date"><strong><p>${mes},${año}</p></strong></div>
          </div>
          <div class="ticket-col2">
            <div class="description"><p>${ticket.description || ticket.title}</p></div>
            <div class="id"><p>#${ticket.id || ticket.ticketId}</p></div>
            <div class="TicketStatus">
              <span class="badge ${badgeClass}">${prioText}</span>
            </div>
          </div>
          <div class="ticket-col3">
            <button class="btn-icon1" type="button">
              <svg class="iconSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 21q-3.15 0-5.575-1.912T3.275 14.2q-.1-.375.15-.687t.675-.363q.4-.05.725.15t.45.6q.6 2.25 2.475 3.675T12 19q2.925 0 4.963-2.037T19 12t-2.037-4.962T12 5q-1.725 0-3.225.8T6.25 8H8q.425 0 .713.288T9 9t-.288.713T8 10H4q-.425 0-.712-.288T3 9V5q0-.425.288-.712T4 4t.713.288T5 5v1.35q1.275-1.6 3.113-2.475T12 3q1.875 0 3.513.713t2.85 1.924t1.925 2.85T21 12t-.712 3.513t-1.925 2.85t-2.85 1.925T12 21m1-9.4l2.5 2.5q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-2.8-2.8q-.15-.15-.225-.337T11 11.975V8q0-.425.288-.712T12 7t.713.288T13 8z"/>
              </svg>
            </button>
            <div class="AnotherDiv">
              <p class="TicketTech">Técnico: <span>${ticket.tech}</span></p>
              <svg class="iconSVG svg2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path fill="#989494" d="M2 22V4q0-.825.588-1.412T4 2h16q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18H6zm4-8h8v-2H6zm0-3h12V9H6zm0-3h12V6H6z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  truncateDescriptions();
}

// Variables globales para la data y el estado de filtrado
let allTickets = [];

document.addEventListener('DOMContentLoaded', async () => {
  const loggedInUserId = getUserId();
  if (!loggedInUserId) {
    console.error('No se encontró el ID de usuario. Redirigiendo al inicio de sesión.');
    window.location.href = 'inicioSesion.html';
    return;
  }

  async function loadAndRenderTickets() {
    try {
      const ticketsFromAPI = await getAssignedTicketsByTech(loggedInUserId);
      
      const ticketsWithTechName = await Promise.all(ticketsFromAPI.map(async (t) => {
          let techName = 'N/A';
          if (t.assignedTech) {
              try {
                  const techUser = await getUserById(t.assignedTech);
                  techName = techUser.displayName || techUser.name || 'N/A';
              } catch (userError) {
                  console.error(`Error al obtener el técnico con ID ${t.assignedTech}:`, userError);
              }
          }
          
          return {
              id: t.ticketId,
              creationDate: t.creationDate,
              description: t.description || t.title,
              prioridad: t.priority?.displayName || 'Baja',
              tech: techName
          };
      }));
      
      allTickets = ticketsWithTechName;
      renderTickets(allTickets);
    } catch (error) {
      console.error('Error al cargar los tickets:', error);
      const container = document.querySelector('.row.gx-0 .col-12');
      if (container) {
        container.innerHTML = '<p class="text-center text-danger mt-5">Ocurrió un error al cargar los tickets.</p>';
      }
    }
  }

  await loadAndRenderTickets();

  window.addEventListener('resize', truncateDescriptions);

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filtro = btn.textContent.trim().toLowerCase();
      if (filtro === 'todo') {
        renderTickets(allTickets);
      } else {
        const filtrados = allTickets.filter(t => t.prioridad?.toLowerCase() === filtro);
        renderTickets(filtrados);
      }
    });
  });

  document.addEventListener('click', e => {
    const iconBtn1 = e.target.closest('.btn-icon1');
    if (iconBtn1) {
      const card = iconBtn1.closest('.card');
      const idNum = card.querySelector('.id p').textContent.replace('#', '').trim();
      localStorage.setItem('ticketAuditoriaID', idNum);
      return window.location.href = 'TicketApplication.html';
    }

    const iconBtn2 = e.target.closest('.svg2');
    if (iconBtn2) {
      const card = iconBtn2.closest('.card');
      const idNum = card.querySelector('.id p').textContent.replace('#', '').trim();
      return window.location.href = `TicketInformationTech.html?id=${idNum}`;
    }

    const tarjeta = e.target.closest('.card');
    if (tarjeta && !iconBtn1 && !iconBtn2) {
      const idNum = tarjeta.querySelector('.id p')?.textContent.replace('#', '').trim();
      if (idNum) {
        window.location.href = `TicketInformationTech.html?id=${idNum}`;
      }
    }
  });
});