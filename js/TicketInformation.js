import { getTicketById } from './Dashboard/dashboardService/ticketService.js';
import { getAuthToken, getUserId } from './authService.js';

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Get the ticket ID from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get("id");

    const main = document.querySelector("main");

    // 2. Check for authentication and a valid ticket ID
    const token = getAuthToken();
    const userId = getUserId();
    if (!token || !userId || !ticketId) {
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

    try {
        // 3. Fetch the real ticket data from the API
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            throw new Error("Ticket not found.");
        }

        // 4. Populate the HTML elements with the API data
        
        // Populate the main card
        const fechaCreacion = new Date(ticket.creationDate);
        const dia = fechaCreacion.getDate().toString().padStart(2, "0");
        const mesAnio = fechaCreacion.toLocaleString("es-ES", { month: "short", year: "2-digit" });

        document.getElementById("ticket-day").textContent = dia + ",";
        document.getElementById("ticket-month-year").textContent = mesAnio;
        document.getElementById("ticket-title").textContent = ticket.title;
        document.getElementById("ticket-id").textContent = `#${ticket.ticketId}`;

        // Populate the details card
        const fechaResolucion = ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : "No resuelto";
        
        document.getElementById("ticket-description").textContent = ticket.description;
        document.getElementById("ticket-assigned-to").textContent = ticket.assignedTech?.displayName || "Sin asignar";
        document.getElementById("ticket-created").textContent = new Date(ticket.creationDate).toLocaleDateString();
        document.getElementById("ticket-closed").textContent = fechaResolucion;
        document.getElementById("ticket-observations").textContent = ticket.observations || "Sin observaciones.";

        // Update the status banner
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