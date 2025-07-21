const ticketData = [
  {
    id: 1001,
    fecha: { dia: 14, mes: "Julio", año: 2025 },
    descripcion: "Error en la base de datos de clientes",
    estado: "pendiente",
    prioridad: "alta"
  },
  {
    id: 1002,
    fecha: { dia: 12, mes: "Julio", año: 2025 },
    descripcion: "Solicitud de cambio de contraseña",
    estado: "en proceso",
    prioridad: "media"
  },
  {
    id: 1003,
    fecha: { dia: 10, mes: "Julio", año: 2025 },
    descripcion: "Actualización de sistema completada",
    estado: "completado",
    prioridad: "baja"
  },
  {
    id: 1004,
    fecha: { dia: 13, mes: "Julio", año: 2025 },
    descripcion: "Problema con inicio de sesión",
    estado: "en espera",
    prioridad: "alta"
  }
];

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
  const container = document.querySelector('.row.gx-0 .col-12');
  container.innerHTML = '';

  if (tickets.length === 0) {
    const main = document.querySelector('main');

    // Evita duplicados si ya está el mensaje mostrado
    if (!document.querySelector('.noTickets')) {
      const noTicketsHTML =
        `<div class="row text-center g-0 noTickets">
          <div class="col">
            <img class="" src="img/gigapixel-image_23-removebg-preview (1).png" alt="No hay Tickets">
            <div class="Ntext">
              <strong><p>No tienes Tickets</p></strong>
              <p>Parece que no tienes ningún ticket en proceso. Por favor crea uno para reportar un problema</p>
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
      'pendiente': 'bg-danger',
      'en espera': 'bg-warning',
      'en proceso': 'bg-orange',
      'completado': 'bg-success'
    }[ticket.estado.toLowerCase()] || 'bg-secondary';

    const prioridadClase = ticket.prioridad.toLowerCase();
    const prioridadCapitalizada = ticket.prioridad.charAt(0).toUpperCase() + ticket.prioridad.slice(1);
    const dia = ticket.fecha.dia;
    const mes = ticket.fecha.mes.slice(0, 3);
    const año = ticket.fecha.año.toString().slice(-2);

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
            <div class="description"><p>${ticket.descripcion}</p></div>
            <div class="id"><p>#${ticket.id}</p></div>
            <div class="TicketStatus">
              <span class="badge ${estadoClase}">${ticket.estado.charAt(0).toUpperCase() + ticket.estado.slice(1)}</span>
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


document.addEventListener('DOMContentLoaded', () => {
  renderTickets(ticketData);
  window.addEventListener('resize', truncateDescriptions);

  // Filtros
  document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filtro = button.textContent.trim().toLowerCase();
      const dataFiltrada = (filtro === 'todo')
        ? ticketData
        : ticketData.filter(t => t.estado.toLowerCase() === filtro);
      renderTickets(dataFiltrada);
    });
  });

  // Manejador de clics para iconos de auditoría y tarjetas
  document.addEventListener('click', e => {
    const iconBtn = e.target.closest('.btn-icon1');
    if (iconBtn) {
      const tarjeta = iconBtn.closest('.card');
      const idNum = tarjeta.querySelector('.id p')?.textContent.replace('#', '').trim();
      localStorage.setItem('ticketAuditoriaID', idNum);
      window.location.href = 'TicketAuditory.html';
      return; // Salir para no disparar la otra redirección
    }

    // Click en cualquier otra parte de la card → abrir TicketInformation
    const tarjeta = e.target.closest('.card');
    if (tarjeta) {
      const idNum = tarjeta.querySelector('.id p')?.textContent.replace('#', '').trim();
      if (idNum) {
        // Navegamos pasando el ID como query param
        window.location.href = `TicketInformation.html?id=${idNum}`;
      }
    }
  });
});