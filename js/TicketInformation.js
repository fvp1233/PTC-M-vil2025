// TicketInformation.js

import { getTicketById } from './Dashboard/dashboardService/ticketService.js';
import { deleteTicket } from './CreateTicket/Service/CreateTicketService.js';

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get("id");

    const main = document.querySelector("main");
    const deleteButton = document.querySelector(".btn-delete");

    const userId = localStorage.getItem('userId');

    if (!userId || !ticketId) {
        console.error("Authentication or Ticket ID missing.");
        main.innerHTML = `
            <div class="row text-center g-0 noTickets">
                <div class="col">
                    <img src="img/gigapixel-image_23-removebg-preview (1).png" alt="No se encontró la información del ticket">
                    <div class="Ntext">
                        <strong><p>No se encontró la información del Ticket</p></strong>
                        <p>Parece que la información del ticket se ha perdido, estamos trabajando para solucionarlo</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const editButton = document.querySelector(".btn-edit-ticket");
    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href = `ActualizarTicket.html?id=${ticketId}`;
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            // 🎨 Modal de confirmación con SweetAlert2
            const result = await Swal.fire({
                title: '¿Eliminar ticket?',
                html: `
                    <p style="color: #666; margin: 10px 0;">Esta acción no se puede deshacer.</p>
                    <p style="color: #666;">¿Estás seguro de que deseas eliminar el ticket <strong>#${ticketId}</strong>?</p>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                focusCancel: true,
                customClass: {
                    popup: 'animated-popup',
                    confirmButton: 'btn-delete-confirm',
                    cancelButton: 'btn-cancel'
                }
            });

            // Si el usuario confirmó la eliminación
            if (result.isConfirmed) {
                // Mostrar loading mientras se elimina
                Swal.fire({
                    title: 'Eliminando ticket...',
                    html: 'Por favor espera un momento',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                try {
                    await deleteTicket(ticketId);
                    
                    // ✅ Éxito
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Ticket eliminado!',
                        text: 'El ticket ha sido eliminado correctamente.',
                        confirmButtonColor: '#28a745',
                        timer: 2000,
                        timerProgressBar: true
                    });
                    
                    // Redirigir al dashboard
                    window.location.href = 'ticketsDashboard.html';
                    
                } catch (error) {
                    console.error('Error al eliminar ticket:', error);
                    
                    // ❌ Error específico según el tipo
                    let errorTitle = 'Error al eliminar';
                    let errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
                    let errorIcon = 'error';

                    if (error.message.includes('permisos')) {
                        errorTitle = 'Sin permisos';
                        errorMessage = 'No tienes permisos para eliminar este ticket. Solo puedes eliminar tus propios tickets.';
                        errorIcon = 'warning';
                    } else if (error.message.includes('Sesión')) {
                        errorTitle = 'Sesión expirada';
                        errorMessage = 'Tu sesión ha expirado. Serás redirigido al inicio de sesión.';
                        errorIcon = 'warning';
                    }

                    await Swal.fire({
                        icon: errorIcon,
                        title: errorTitle,
                        text: errorMessage,
                        confirmButtonColor: '#3085d6'
                    });

                    // Si la sesión expiró, redirigir al login
                    if (error.message.includes('Sesión')) {
                        window.location.href = 'inicioSesion.html';
                    }
                }
            }
        });
    }

    // Cargar información del ticket
    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            throw new Error("Ticket not found.");
        }
        
        // Populate the HTML elements with the API data
        const fechaCreacion = new Date(ticket.creationDate);
        const dia = fechaCreacion.getDate().toString().padStart(2, "0");
        const mesAnio = fechaCreacion.toLocaleString("es-ES", { month: "short", year: "2-digit" });

        document.getElementById("ticket-day").textContent = dia + ",";
        document.getElementById("ticket-month-year").textContent = mesAnio;
        document.getElementById("ticket-title").textContent = ticket.title;
        document.getElementById("ticket-id").textContent = `#${ticket.ticketId}`;

        const fechaResolucion = ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : "No resuelto";
        
        document.getElementById("ticket-description").textContent = ticket.description;
        document.getElementById("ticket-assigned-to").textContent = ticket.assignedTech?.displayName || "Sin asignar";
        document.getElementById("ticket-created").textContent = new Date(ticket.creationDate).toLocaleDateString();
        document.getElementById("ticket-closed").textContent = fechaResolucion;
        
        const ticketPriorityElement = document.getElementById("ticket-priority");
        const priorityText = ticket.priority.displayName.toLowerCase();
        ticketPriorityElement.textContent = ticket.priority.displayName;

        switch (priorityText) {
            case 'baja':
                ticketPriorityElement.classList.add('baja');
                break;
            case 'media':
                ticketPriorityElement.classList.add('media');
                break;
            case 'alta':
                ticketPriorityElement.classList.add('alta');
                break;
            case 'critica':
                ticketPriorityElement.classList.add('critico');
                break;
            default:
                ticketPriorityElement.classList.add('default');
                break;
        }

        const ticketImgContainer = document.getElementById("ticket-img");
        ticketImgContainer.innerHTML = '';
        const imageUrl = ticket.imageUrl; 
        
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl; 
            img.alt = "Imagen adjunta al ticket";
            img.classList.add('ticket-image');

            const link = document.createElement('a');
            link.href = imageUrl;
            link.target = "_blank";
            link.appendChild(img);

            ticketImgContainer.appendChild(link);
        } else {
            ticketImgContainer.textContent = 'No hay imágenes adjuntas.';
        }

        const statusBanner = document.getElementById("ticket-status");
        const estado = ticket.status.displayName.toLowerCase().replace(/\s/g, "-");
        
        statusBanner.textContent = ticket.status.displayName;
        statusBanner.className = `ticket-status-banner status-${estado}`;

    } catch (error) {
        console.error("Error al cargar la información del ticket:", error);
        main.innerHTML = `
            <div class="row text-center g-0 noTickets">
                <div class="col">
                    <img src="img/gigapixel-image_23-removebg-preview (1).png" alt="Error de carga">
                    <div class="Ntext">
                        <strong><p>Error al cargar el Ticket</p></strong>
                        <p>Hubo un problema de conexión o el ticket no existe.</p>
                    </div>
                </div>
            </div>
        `;
    }
});