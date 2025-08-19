document.addEventListener('DOMContentLoaded', () => {
    // Función para obtener la fecha actual y mostrarla
    function updateDate() {
        const dateElement = document.querySelector('.date p');
        if (dateElement) {
            const today = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateElement.textContent = today.toLocaleDateString('es-ES', options);
        }
    }

    updateDate(); // Llama la función al cargar la página

    const Json_Ticket = '/js/ticket2.json';

    // Función para cargar los tickets desde un archivo JSON
    async function loadTickets() {
        try {
            const response = await fetch(Json_Ticket);
            const tickets = await response.json();
            const ticketsContainer = document.querySelector('.white-content-section');

            //Elimina cualquier ticket que exista antes de cargar los nuevos
            const staticTickets = ticketsContainer.querySelectorAll('.card.ticket-item');
            staticTickets.forEach(ticket => ticket.remove());

            // Define los colores que asigne en el json
            const severityColors = {
                'Crítico': '#FF0000', // Rojo
                'Alto': '#F48C06',    // Naranja
                'Medio': '#FFBA08',   // Amarrillo
                'Bajo': '#67D947',    // Verde
                'Info': '#ADD8E6'     // Azul
            };

            tickets.forEach(ticket => {
                const ticketCard = document.createElement('div');
                ticketCard.classList.add('card', 'mt-3', 'ticket-item', 'mb-3');
                // añade una posicion relativa a la tarjeta para poder colocar el ribbon(banner a la derecha)
                ticketCard.style.position = 'relative';
                ticketCard.style.overflow = 'hidden'; 

                const ribbonColor = severityColors[ticket.severity] || '#6c757d'; // color del ticket sera verde por default
                const ribbonTextColor = '#FFFFFF'; // defino el color blanco para el texto que va dentro del ribbon

                ticketCard.innerHTML = `
                    <div class="ribbon" style="background-color: ${ribbonColor}; color: ${ribbonTextColor};">
                        ${ticket.severity || 'N/A'}
                    </div>
                    <div class="card-body d-flex">
                        <div class="ticket-status-bar" style="background-color: ${ticket.statusBarColor || '#ccc'};"></div>
                        <div class="col-8 d-flex flex-column pe-3 ms-3">
                            <h6 class="ticket-code">#${ticket.id}</h6>
                            <div class="ticket-info-group">
                                <p class="text-muted"><small><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                stroke-linecap="round" stroke-linejoin="round"
                                                class="lucide lucide-clock-icon lucide-clock">
                                                <path d="M12 6v6l4 2" />
                                                <circle cx="12" cy="12" r="10" />
                                            </svg> ${ticket.date}</small></p>
                                <p class="ticket-description">${ticket.description}</p>
                            </div>
                            <p class="mb-0 mt-1">
                                <small>Creado por:</small><br />
                                <span class="assigned-person">${ticket.assignedTo}</span>
                            </p>
                        </div>
                        <div class="d-flex flex-column justify-content-end align-items-end ps-3 flex-grow-1">
                            <div class="d-flex align-items-center">
                                <p class="mb-0" style="font-size: 0.8rem;">Ver ticket</p>
                                <a href="#" class="btn btn-link p-0" style="color: inherit; text-decoration: none;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right">
                                        <path d="m9 18 6-6-6-6"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                ticketsContainer.appendChild(ticketCard);
            });
        } catch (error) {
            console.error('Error al cargar los tickets:', error);
        }
    }

    loadTickets();
});