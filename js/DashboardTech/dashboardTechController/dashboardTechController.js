import { getAssignedTicketsByTech,  getAvailableTicketsForTechnician, acceptTicket, declineTicket} from "../dashboardTechService/ticketTechService.js";
import { me } from "../../Login/AuthService/authService.js";

console.log("holaaaa");

let loggedInUserId = null;
document.addEventListener('DOMContentLoaded', async () => {

    const loggedInUserId = await me();
    if (!loggedInUserId || !loggedInUserId.userId) {
        console.error('No se encontró el token o el ID de usuario.');
        return;
    }

    // Funciones de utilidad (las que ya tienes para la fecha y la creación de la tarjeta)
    function updateDate() {
        const dateElement = document.querySelector('.date p');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('es-ES', options);
        }
    }
    updateDate();

    // Función para crear la tarjeta del ticket con tu diseño
    function createTicketCard(ticket, container) {
        // Los colores y la lógica para el ribbon
        const severityColors = {
            'Crítica': '#DC2F02', 
            'Alta': '#F48C06', 
            'Media': '#FFBA08', 
            'Baja': '#67D947', 
            'Info': '#ADD8E6' 
        };

        const createdBy = ticket.userName || 'Desconocido'; 
        
        const ribbonColor = severityColors[ticket.priority?.displayName] || severityColors['Info'] || '#6c757d';
        const ribbonTextColor = '#FFFFFF'; 

        const ticketCard = document.createElement('div');
        ticketCard.classList.add('card', 'mt-3', 'ticket-item', 'mb-3');
        ticketCard.style.position = 'relative';
        ticketCard.style.overflow = 'hidden'; 

 ticketCard.innerHTML = `
        <div class="ribbon" style="background-color: ${ribbonColor}; color: ${ribbonTextColor};">
            ${ticket.priority?.displayName || 'N/A'}
        </div>
        <div class="card-body d-flex">
            <div class="ticket-status-bar" style="background-color: ${ribbonColor};"></div>
            <div class="col-8 d-flex flex-column pe-3 ms-3">
                <h6 class="ticket-code">#${ticket.ticketId}</h6>
                <div class="ticket-info-group">
                    <p class="text-muted"><small><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round"
                            class="lucide lucide-clock-icon lucide-clock">
                            <path d="M12 6v6l4 2" />
                            <circle cx="12" cy="12" r="10" />
                        </svg> ${new Date(ticket.creationDate).toLocaleDateString('es-ES')}</small></p>
                    <p class="ticket-description">${ticket.title}</p>
                </div>
                <p class="mb-0 mt-1">
                    <small>Creado por:</small><br />
                    <span class="assigned-person">${createdBy}</span>
                </p>
            </div>
            <div class="d-flex flex-column justify-content-end align-items-end ps-3 flex-grow-1">
                <div class="d-flex align-items-center">
                    <p class="mb-0" style="font-size: 0.8rem;">Ver ticket</p>
                    <a href="detallesTicket.html?id=${ticket.ticketId}" class="btn btn-link p-0" style="color: inherit; text-decoration: none;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </a>
                </div>
                <div class="actions-container d-flex mt-2"></div>
            </div>
        </div>
    `;

    // ✅ Lógica de los botones de acción para tickets en espera
    if (ticket.status?.displayName === 'En espera') {
        const actionsContainer = ticketCard.querySelector('.actions-container');
        
        // Botón de Aceptar
        const acceptButtonHtml = `
            <button class="btn btn-primary rounded-circle accept-ticket-btn" data-ticket-id="${ticket.ticketId}" 
                    style="width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; padding: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check">
                    <path d="M20 6 9 17l-5-5"/>
                </svg>
            </button>
        `;
        actionsContainer.innerHTML += acceptButtonHtml;

        // Botón de Declinar
        const declineButtonHtml = `
            <button class="btn btn-danger rounded-circle decline-ticket-btn ms-2" data-ticket-id="${ticket.ticketId}" 
                    style="width: 35px; height: 35px; display: flex; justify-content: center; align-items: center; padding: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            </button>
        `;
        actionsContainer.innerHTML += declineButtonHtml;

 // Event listener para el botón de Aceptar
        ticketCard.querySelector('.accept-ticket-btn').addEventListener('click', async (event) => {
            event.stopPropagation();
            const ticketId = event.currentTarget.dataset.ticketId;
            try {
                await acceptTicket(ticketId, loggedInUserId.userId);
                Swal.fire({
                    icon: 'success',
                        title: '¡Ticket aceptado!',
                        text: 'El ticket ha sido asignado a tu nombre. Puedes verlo en tu sección de tickets en progreso.',
                        showConfirmButton: false,
                        timer: 2000
                });
                await loadTickets(); // Recargar la vista
            } catch (error) {
                console.error('Error al aceptar el ticket:', error);
                alert('Hubo un error al aceptar el ticket.');
            }
        });

        // Event listener para el botón de Declinar
        ticketCard.querySelector('.decline-ticket-btn').addEventListener('click', async (event) => {
            event.stopPropagation();
            const ticketId = event.currentTarget.dataset.ticketId;
            try {
                await declineTicket(ticketId, loggedInUserId.userId);
                Swal.fire({
                        icon: 'info',
                        title: 'Ticket declinado',
                        text: 'El ticket ya no se mostrará en tu lista de tickets disponibles.',
                        showConfirmButton: false,
                        timer: 2000
                });
                await loadTickets(); // Recargar la vista
            } catch (error) {
                console.error('Error al declinar el ticket:', error);
                alert('Hubo un error al declinar el ticket.');
            }
        });
    }

    container.appendChild(ticketCard);
    }
    
    // Función para cargar los tickets, ahora desde la API
    async function loadTickets() {
        try {

            const availableTickets = await getAvailableTicketsForTechnician(loggedInUserId.userId);
            
            const ticketsContainer = document.querySelector('.white-content-section');
            if (!ticketsContainer) {
                console.error("Contenedor de tickets no encontrado.");
                return;
            }

               // Limpiar el contenedor antes de renderizar los nuevos tickets
            ticketsContainer.innerHTML = '';


            if (availableTickets.length === 0) {
                ticketsContainer.innerHTML = '<p class="text-center text-muted">No tienes tickets asignados.</p>';
                return;
            }

            availableTickets.forEach(ticket => createTicketCard(ticket,ticketsContainer));

        } catch (error) {
            console.error('Error al cargar los tickets:', error);
            const ticketsContainer = document.querySelector('.white-content-section');
            if(ticketsContainer) {
                ticketsContainer.innerHTML = '<p class="text-center text-danger">Ocurrió un error al cargar los tickets.</p>';
            }
        }
    }

    // Iniciar el proceso
    loadTickets();
});
