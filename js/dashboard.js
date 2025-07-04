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

    // Función para cargar los tickets desde un archivo JSON
        // Función para cargar los tickets desde un archivo JSON
    async function loadTickets() {
        try {
            const response = await fetch('js/tickets.json');
            const tickets = await response.json();
            const ticketsContainer = document.querySelector('.white-content-section');

            const staticTickets = ticketsContainer.querySelectorAll('.card.ticket-item');
            staticTickets.forEach(ticket => ticket.remove());


            tickets.forEach(ticket => {
                const ticketCard = document.createElement('div');
                ticketCard.classList.add('card', 'mt-3', 'ticket-item', 'mb-3');

                let buttonTextColor = '#FFFFFF';
                const hexToRgb = hex => {
                    if (!hex || hex.length < 7 || hex.charAt(0) !== '#') {
                        return { r: 0, g: 0, b: 0 };
                    }
                    const r = parseInt(hex.slice(1, 3), 16);
                    const g = parseInt(hex.slice(3, 5), 16);
                    const b = parseInt(hex.slice(5, 7), 16);
                    return { r, g, b };
                };

                if (ticket.buttonColor) {
                    const rgb = hexToRgb(ticket.buttonColor);
                    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
                    if (luminance > 0.5) {
                        buttonTextColor = '#000000';
                    }
                }

                const buttonBorderStyle = `2px solid ${ticket.buttonBorder || '#000000'}`;

                ticketCard.innerHTML = `
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
                                <small>Asignado a:</small><br />
                                <span class="assigned-person">${ticket.assignedTo}</span>
                            </p>
                        </div>
                        <div class="d-flex flex-column justify-content-between align-items-end ps-3 flex-grow-1">
                            <div id="chart-${ticket.id}" class="chargeValue"></div>
                            <button class="btn btn-sm ticket-status-btn" style="background-color: ${ticket.buttonColor || '#6c757d'}; color: ${buttonTextColor}; border: ${buttonBorderStyle};">${ticket.status}</button>
                        </div>
                    </div>
                `;

                ticketsContainer.appendChild(ticketCard);

                // Configuración de ApexCharts
                var options = {
                    series: [ticket.ticketProgress || 0],
                    chart: {
                        height: 70,
                        type: 'radialBar',
                    },
                    plotOptions: {
                        radialBar: {
                            hollow: {
                                size: '30%',
                            },
                            dataLabels: {
                                show: true,
                                name: {
                                    show: false,
                                },
                                value: {
                                    show: true,
                                    fontSize: '12px',
                                    offsetY: 5,
                                    formatter: function (val) {
                                        return val + '%';
                                    }
                                }
                            }
                        },
                    },
                    labels: [''],
                    // ¡DESCOMENTA ESTA LÍNEA PARA APLICAR EL COLOR!
                    colors: [ticket.statusBarColor || '#00E396'], // Usa el color de la barra de estado o un verde por defecto
                };

                var chartElement = ticketCard.querySelector(`#chart-${ticket.id}`);
                if (chartElement) {
                    var chart = new ApexCharts(chartElement, options);
                    chart.render();
                } else {
                    console.warn(`Elemento de gráfico con ID chart-${ticket.id} no encontrado para el ticket ${ticket.id}.`);
                }
            });
        } catch (error) {
            console.error('Error al cargar los tickets:', error);
        }
    }

    loadTickets();
});