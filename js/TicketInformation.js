// TicketInformation.js

import { getTicketById } from './Dashboard/dashboardService/ticketService.js';
// La siguiente línea ha sido removida para que el código no use directamente authService
// import { getAuthToken, getUserId } from './authService.js';
import { deleteTicket } from './CreateTicket/Service/CreateTicketService.js';

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get("id");

    const main = document.querySelector("main");
    const deleteButton = document.querySelector(".btn-delete");

    // Lógica adaptada para obtener el userId directamente de localStorage
    const userId = localStorage.getItem('userId');

    // Verificamos si hay token o ID de ticket antes de proceder
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
        return; // Detenemos la ejecución aquí si falta información crucial
    }
    
    // Configurar los event listeners al inicio para que estén listos
    const editButton = document.querySelector(".btn-edit-ticket");
    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href = `actualizarTicket.html?id=${ticketId}`;
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            const confirmDeletion = confirm('¿Estás seguro de que deseas eliminar este ticket? Esta acción no se puede deshacer.');
            if (confirmDeletion) {
                try {
                    await deleteTicket(ticketId);
                    
                    // Mostramos una alerta personalizada
                    alert("Ticket eliminado correctamente.");
                    
                    // Redirigimos inmediatamente después de que el usuario haga clic en OK
                    window.location.href = 'ticketsDashboard.html';
                } catch (error) {
                    console.error('Error al eliminar ticket:', error);
                    alert("Ocurrió un error al eliminar el ticket. Por favor, inténtelo de nuevo.");
                }
            }
        });
    }

    // El resto de la lógica de carga de datos se ejecuta solo si no hay una acción de eliminación pendiente
    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            // Manejamos el caso de que el ticket no exista al inicio de la carga
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