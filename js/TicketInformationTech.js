import { fetchWithAuth } from './Login/AuthService/authService.js';
import { getUserId } from './Login/AuthService/authService.js';

// URL de la API base, se puede centralizar en un archivo de configuración
const API_BASE_URL = "http://localhost:8080/api";

// Variables globales para elementos del DOM
let finalizeButton;
let updateProgressBtn;
let ticketPercentageInput;
let ticketPercentageValue;
let observationsInput;
let progressSection; // <--- Nueva variable para el contenedor de progreso

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ticketId = urlParams.get("id");

    const main = document.querySelector("main");
    const backButton = document.querySelector(".back");

    // Asignación de elementos interactivos usando los IDs correctos del HTML
    finalizeButton = document.getElementById("finalize-ticket-btn");
    updateProgressBtn = document.getElementById("update-progress-btn");
    ticketPercentageInput = document.getElementById("ticket-percentage-input");
    ticketPercentageValue = document.getElementById("ticket-percentage-value");
    observationsInput = document.getElementById("ticket-observations");
    progressSection = document.getElementById("progress-section"); // <--- Asignación del contenedor
    
    // Obtenemos el ID del técnico logueado
    const userId = await getUserId();

    // Verificamos si hay usuario y ID de ticket antes de proceder
    if (!userId || !ticketId) {
        showErrorMessage(main, "Autenticación o ID de ticket faltante.");
        return;
    }

    // --- Listeners de Eventos ---

    // Listener para el deslizador de porcentaje
    if (ticketPercentageInput) {
        ticketPercentageInput.addEventListener('input', () => {
            ticketPercentageValue.textContent = `${ticketPercentageInput.value}%`;
        });
    }

    // Listener principal del botón Finalizar/Abrir
    if (finalizeButton) {
        finalizeButton.addEventListener('click', async () => {
            if (finalizeButton.classList.contains('btn-reopen')) {
                // Si el ticket está cerrado, lo reabrimos
                await handleReopenTicket(ticketId);
            } else {
                // Si está en progreso, lo finalizamos
                await handleFinalizeTicket(ticketId);
            }
        });
    }

    // Listener para el botón "Actualizar Progreso"
    if (updateProgressBtn) {
        updateProgressBtn.addEventListener('click', async () => {
            const notes = observationsInput.value;
            const percentage = parseInt(ticketPercentageInput.value, 10);
            await handleUpdateProgress(ticketId, notes, percentage);
        });
    }

    // Configurar el botón de volver
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'ticketsDashboardTech.html';
        });
    }

    // Lógica para cargar los datos del ticket
    try {
        const ticket = await getTicketById(ticketId);

        if (!ticket) {
            throw new Error("Ticket no encontrado.");
        }
        
        populateTicketInformation(ticket);

    } catch (error) {
        console.error("Error al cargar la información del ticket:", error);
        showErrorMessage(main, "Hubo un problema de conexión o el ticket no existe.");
    }
});

// =========================================================================
// Funciones de Manejo de Lógica de la API
// =========================================================================

/**
 * Llama al endpoint de PATCH para actualizar el progreso (notas y porcentaje).
 */
async function updateTicketData(ticketId, payload, endpoint) {
    const url = `${API_BASE_URL}/tech/${endpoint}/${ticketId}`;
    await fetchWithAuth(url, {
        method: 'PATCH',
        body: JSON.stringify(payload)
    });
}


/**
 * Maneja la actualización de progreso del ticket (porcentaje y notas).
 * Llama al endpoint PATCH /api/tech/UpdateTicketProgress/{ticketId}
 */
async function handleUpdateProgress(ticketId, notes, percentage) {
    if (percentage === 100) {
        Swal.fire({
            icon: 'warning',
            title: '¡Atención!',
            text: 'Si el progreso es 100%, por favor usa el botón "FINALIZAR TICKET" para cerrar formalmente el caso.',
            confirmButtonColor: '#007bff'
        });
        return;
    }

    try {
        const payload = {
            description: notes,
            percentage: percentage
            // El estado se actualiza en el backend (probablemente a EN_PROGRESO)
        };
        
        await updateTicketData(ticketId, payload, 'UpdateTicketProgress');

        Swal.fire({
            icon: 'success',
            title: '¡Progreso Actualizado!',
            text: `El ticket #${ticketId} ahora tiene un ${percentage}% de avance.`,
            showConfirmButton: false,
            timer: 2000
        });

    } catch (error) {
        console.error('Error al actualizar el progreso:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Actualización',
            text: `No se pudo actualizar el progreso: ${error.message}`,
            confirmButtonColor: '#bc3233'
        });
    }
}

/**
 * Maneja la finalización del ticket usando SweetAlert.
 * Llama al endpoint PATCH /api/tech/FinalizeTicket/{ticketId}
 */
async function handleFinalizeTicket(ticketId) {
    const notes = observationsInput.value;

    const result = await Swal.fire({
        title: '¿Finalizar Ticket?',
        text: `El ticket se cerrará al 100%. ¿Confirmas el informe: "${notes.substring(0, 50)}..."?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#28a745', // Verde para Confirmar
        cancelButtonColor: '#bc3233', // Rojo para Cancelar
        confirmButtonText: 'Sí, ¡Finalizar!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const payload = {
                description: notes
                // Nota: El porcentaje (100) y el estado (COMPLETADO) se fijan en el controlador del backend.
            };
        
            await updateTicketData(ticketId, payload, 'FinalizeTicket');

            Swal.fire({
                icon: 'success',
                title: '¡Ticket Finalizado!',
                text: `El ticket #${ticketId} se ha cerrado correctamente.`,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                window.location.href = 'ticketsDashboardTech.html';
            });

        } catch (error) {
            console.error('Error al finalizar el ticket:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error de Finalización',
                text: `No se pudo finalizar el ticket: ${error.message}`,
                confirmButtonColor: '#bc3233'
            });
        }
    }
}

/**
 * Maneja la reapertura de un ticket cerrado.
 */
async function handleReopenTicket(ticketId) {
    const result = await Swal.fire({
        title: '¿Reabrir Ticket?',
        text: 'Esto cambiará el estado a "EN PROGRESO" y te permitirá actualizar el porcentaje y las notas nuevamente.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#007bff', // Azul para Abrir
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, ¡Abrir Ticket!',
        cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
        try {
            const payload = {
                // Asumiendo que el ID 2 es EN_PROGRESO / EN_PROCESO, que es el estado que permite trabajar
                status: { id: 2, displayName: "EN_PROGRESO" }, 
                percentage: 50, // Se reinicia el porcentaje a un valor intermedio
            };
            
            // Usamos el endpoint de progreso para hacer el cambio de estado
            await updateTicketData(ticketId, payload, 'UpdateTicketProgress');

            Swal.fire({
                icon: 'info',
                title: 'Ticket Reabierto',
                text: `El ticket #${ticketId} ha vuelto al estado "EN PROGRESO".`,
                showConfirmButton: false,
                timer: 2000
            }).then(() => {
                // Recargar la página para que la UI se actualice con los campos habilitados
                window.location.reload(); 
            });

        } catch (error) {
            console.error('Error al reabrir el ticket:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al Reabrir',
                text: `No se pudo reabrir el ticket: ${error.message}`,
                confirmButtonColor: '#bc3233'
            });
        }
    }
}


// =========================================================================
// Funciones de Lectura y UI
// =========================================================================

// Función para obtener los datos de un ticket por su ID
async function getTicketById(ticketId) {
    const url = `${API_BASE_URL}/client/GetTicketById/${ticketId}`;
    // Usamos fetchWithAuth para hacer una petición segura
    return await fetchWithAuth(url);
}

// Función para poblar los elementos HTML con los datos del ticket
function populateTicketInformation(ticket) {
    const fechaCreacion = new Date(ticket.creationDate);
    const dia = fechaCreacion.getDate().toString().padStart(2, "0");
    const mesAnio = fechaCreacion.toLocaleString("es-ES", { month: "short", year: "2-digit" });

    document.getElementById("ticket-day").textContent = dia + ",";
    document.getElementById("ticket-month-year").textContent = mesAnio;
    document.getElementById("ticket-title").textContent = ticket.title;
    document.getElementById("ticket-id").textContent = `#${ticket.ticketId}`;
    document.getElementById("ticket-description").textContent = ticket.description;

    document.getElementById("ticket-creado-por").textContent = ticket.userName || "No especificado";
    document.getElementById("ticket-categoria").textContent = ticket.category?.displayName || "No especificado";

    document.getElementById("ticket-created").textContent = new Date(ticket.creationDate).toLocaleDateString();
    
    const fechaResolucion = ticket.closeDate ? new Date(ticket.closeDate).toLocaleDateString() : "No resuelto";
    document.getElementById("ticket-closed").textContent = fechaResolucion;
    
    // --- Lógica para la Imagen ---
    const ticketImgContainer = document.getElementById("ticket-img-container"); 
    if (ticketImgContainer) {
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
    }
    
    // Lógica para mostrar el estado (omitiendo prioridad por brevedad)
    const statusBanner = document.getElementById("ticket-status");
    if (ticket.status && statusBanner) {
        // FIX: Reemplazar espacios y guiones bajos por guiones
        const estado = ticket.status.displayName.toLowerCase().replace(/[\s_]/g, "-"); 
        statusBanner.textContent = ticket.status.displayName;
        statusBanner.className = `ticket-status-banner status-${estado}`;
    }

    // --- Lógica de Progreso y Observaciones ---
    const currentPercentage = ticket.percentage || 0;
    
    if (ticketPercentageInput) {
        ticketPercentageInput.value = currentPercentage;
        // Dispara el evento 'input' para actualizar el valor visual
        ticketPercentageInput.dispatchEvent(new Event('input')); 
    }

    // Manejo del campo de observaciones: lo rellenamos con la descripción actual
    if (observationsInput) {
        // La descripción es lo que se usa como informe técnico en el backend
        observationsInput.value = ticket.description || '';
    }
    
    // Si el ticket ya está FINALIZADO, controlamos los botones de acción
    if (ticket.status?.displayName === "COMPLETADO") {
        // DESHABILITAR CAMPOS
        if (observationsInput) observationsInput.disabled = true;
        
        // Ocultar la sección de progreso y el botón de actualización
        if (progressSection) progressSection.style.display = 'none';
        if (updateProgressBtn) updateProgressBtn.style.display = 'none';

        // 2. Transformar el botón Finalizar en Abrir
        if (finalizeButton) {
            finalizeButton.textContent = "ABRIR TICKET";
            // Usamos esta clase para identificar la acción en el Listener
            finalizeButton.classList.add('btn-reopen'); 
            // Quitamos las clases de finalización/deshabilitación
            finalizeButton.classList.remove('btn-finalize-ticket');
            // Opcional: Si tienes una clase visual para ticket finalizado, puedes agregarla
            // finalizeButton.classList.add('btn-finalized');
            finalizeButton.disabled = false;
        } 
    } else {
        // Aseguramos que todo esté habilitado y visible si no está completado
        if (observationsInput) observationsInput.disabled = false;
        
        // Asegurar que la sección de progreso y el botón de actualización estén visibles
        if (progressSection) progressSection.style.display = ''; // Mostrar
        if (updateProgressBtn) updateProgressBtn.style.display = ''; // Mostrar
        
        if (finalizeButton) {
            finalizeButton.textContent = "FINALIZAR TICKET";
            finalizeButton.classList.remove('btn-reopen'); 
            finalizeButton.classList.add('btn-finalize-ticket');
            finalizeButton.disabled = false;
        }
    }
}

// Función para mostrar mensajes de error
function showErrorMessage(container, message) {
    container.innerHTML = `
        <div class="row text-center g-0 noTickets">
            <div class="col">
                <img src="img/gigapixel-image_23-removebg-preview (1).png" alt="Error de carga">
                <div class="Ntext">
                    <strong><p>Error</p></strong>
                    <p>${message}</p>
                </div>
            </div>
        </div>
    `;
}
