import { getRecentTicketsByUser } from '../dashboardService/ticketService.js';
import { getAuthToken } from '../../authService.js';

document.addEventListener('DOMContentLoaded', async () => {
    const token = getAuthToken();
    const loggedInUserId = localStorage.getItem('userId');
    if (!token || !loggedInUserId) return;

    function updateDate() {
        const dateElement = document.querySelector('.date p');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('es-ES', options);
        }
    }
    updateDate();

    function hexToRgb(hex) {
        if (!hex || hex.length < 7 || hex.charAt(0) !== '#') return { r: 0, g: 0, b: 0 };
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    function createTicketCard(ticket, container) {
        const id = ticket.ticketId || ticket.id;
        const date = ticket.creationDate?.split('T')[0] || ticket.date || 'Sin fecha';
        const title = ticket.title || 'Sin título';
        const description = ticket.description || 'Sin descripción';
        const assignedTo = ticket.assignedTech?.displayName || ticket.assignedTo || 'Sin asignar';
        const statusDisplayName = ticket.status?.displayName || ticket.status || 'Desconocido';
        const priorityRaw = ticket.priority?.displayName;
        const priority = typeof priorityRaw === 'string' ? priorityRaw.toLowerCase() : 'desconocida';
        const progress = ticket.percentage ?? ticket.ticketProgress ?? 0;

        let statusBarColor = '#6c757d'; 
        let buttonColor = '#6c757d';
        let buttonBorder = '#000000';

        console.log(`Ticket #${id} - Prioridad recibida:`, ticket.priority);

        switch (priority) {
            case 'crítica':
                statusBarColor = '#DC2F02';     // rojo
                buttonColor = '#F88A8A';
                buttonBorder = '#DC2F02';
                break;
            case 'alta':
                statusBarColor = '#F48C06';     // naranja
                buttonColor = '#F9B48B';
                buttonBorder = '#F48C06';
                break;
            case 'media':
                statusBarColor = '#ffc107';     // amarillo
                buttonColor = '#FFE297';
                buttonBorder = '#ffc107';
                break;
            case 'baja':
                statusBarColor = '#198754';     // verde
                buttonColor = '#28A745';
                buttonBorder = '#198754';
                break;
            default:
                statusBarColor = '#6c757d';     // gris
                buttonColor = '#6c757d';
                buttonBorder = '#6c757d';
                break;
        }

        const rgb = hexToRgb(buttonColor);
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        const buttonTextColor = luminance > 0.5 ? '#000000' : '#FFFFFF';
        const buttonBorderStyle = `1.5px solid ${buttonBorder}`;

        const ticketCard = document.createElement('div');
        ticketCard.classList.add('card', 'mt-2', 'ticket-item', 'mb-4');
        ticketCard.innerHTML = `
      <div class="card-body d-flex p-2">
        <div class="ticket-status-bar" style="background-color: ${statusBarColor};"></div>
        <div class="ticket-content flex-grow-1 ms-2">
          <p class="ticket-code mb-1">#${id}</p>
          <p class="text-muted mb-1"><small>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/></svg> ${date}
          </small></p>
          <h6 class="ticket-title mb-2">${title}</h6>
          <p class="ticket-description mb-0">${description}</p>
          <p class="assignedTotxt">Asignado a:</p>
          <p><span class="assigned-person">${assignedTo}</span> </p>
        </div>
        <div class="d-flex flex-column justify-content-center align-items-end ps-2">   
          <div id="chart-${id}" class="chargeValue"></div>
          <button class="btn btn-sm ticket-status-btn mt-5" style="background-color: ${buttonColor}; color: ${buttonTextColor}; border: ${buttonBorderStyle}; font-size:0.85rem; padding:.3vh 1vh; border-radius:20px">${statusDisplayName}</button>
        </div>
      </div>
    `;

        container.appendChild(ticketCard);

        const chart = new ApexCharts(ticketCard.querySelector(`#chart-${id}`), {
            series: [progress],
            chart: {
                height: 150,
                type: 'radialBar',
                sparkline: { enabled: true }
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '55%',
                        background: 'transparent'
                    },
                    track: {
                        background: '#e7e7e7',
                        strokeWidth: '100%',
                        margin: 0
                    },
                    dataLabels: {
                        show: true,
                        name: { show: false },
                        value: {
                            show: true,
                            fontSize: '14px',
                            fontWeight: 600,
                            offsetY: 5,
                            formatter: val => val + '%'
                        }
                    }
                }
            },
            labels: [''],
            colors: [statusBarColor]
        });

        chart.render();
    }

    async function loadTickets() {
        try {
            const tickets = await getRecentTicketsByUser(loggedInUserId);
            const container = document.querySelector('#tickets-container');
            if (!container) {
                console.error("No se encontró el contenedor '#tickets-container'");
                return;
            }

            container.innerHTML = '';
            if (tickets.length === 0) {
                container.innerHTML = '<p class="text-muted text-center">No se encontraron tickets recientes.</p>';
                return;
            }

            //IMPORTANTE para dar vuelta al orden y se vea el mas reciente de primero 
            tickets.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate))
            const recentTickets = tickets.slice(0,4)
            recentTickets.forEach(ticket => createTicketCard(ticket, container));
        } catch (error) {
            console.error('Error al cargar los tickets:', error);
            const container = document.querySelector('.white-content-section');
            if (container) {
                container.innerHTML = '<p class="text-danger text-center">Ocurrió un error al cargar los tickets.</p>';
            }
        }
    }

    loadTickets();
});
