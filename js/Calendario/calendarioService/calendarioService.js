// Contiene la lógica para interactuar con la API y formatear los datos.

import { fetchWithAuth } from '../../Login/AuthService/authService.js';

// La URL de la API local
const API_URL = "http://localhost:8080/api";

/**
 * Obtiene los tickets recientes de un usuario a través de la API.
 * @param {string} userId El ID del usuario.
 * @returns {Promise<Array<Object>>} Una lista de tickets.
 * @throws {Error} Si la llamada a la API falla.
 */
export const getRecentTicketsByUser = async (userId) => {
    try {
        const data = await fetchWithAuth(`${API_URL}/client/GetRecentTicketsByUser/${userId}`);
        if (!data || !Array.isArray(data)) {
            throw new Error("La respuesta de tickets no es válida");
        }
        return data;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};

/**
 * Convierte la primera letra de una cadena a mayúscula.
 * @param {string} cadena La cadena a formatear.
 * @returns {string} La cadena con la primera letra en mayúscula.
 */
export function capitalizeFirstLetter(cadena) {
    if (!cadena) return "";
    return cadena.charAt(0).toUpperCase() + cadena.slice(1);
}

/**
 * Obtiene la fecha local en formato ISO (YYYY-MM-DD).
 * @param {Date} [date=new Date()] La fecha de la que se obtendrá el formato local.
 * @returns {string} La fecha en formato ISO.
 */
export function getLocalISODate(date = new Date()) {
    const offset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date - offset).toISOString().slice(0, 10);
    return localISO;
}

/**
 * Formatea un número de ticket para que tenga ceros iniciales.
 * @param {number} ticketId El ID del ticket.
 * @returns {string} El número de ticket formateado.
 */
export function formatTicketNumber(ticketId) {
    if (ticketId < 10) return `000${ticketId}`;
    if (ticketId < 100) return `00${ticketId}`;
    if (ticketId < 1000) return `0${ticketId}`;
    return `${ticketId}`;
}

/**
 * Formatea el día de una fecha ISO.
 * @param {string} fechaISO La fecha en formato ISO.
 * @returns {string} El día del mes formateado.
 */
export function formatDateDay(fechaISO) {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    const dia = fecha.getUTCDate().toString().padStart(2, "0");
    return `${dia}`;
}

/**
 * Formatea el mes y el año de una fecha ISO.
 * @param {string} fechaISO La fecha en formato ISO.
 * @returns {string} El mes y el año formateados (por ejemplo, "Jul, 2025").
 */
export function formatDateMonthYear(fechaISO) {
    if (!fechaISO) return "";
    const fecha = new Date(fechaISO);
    const meses = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    const mes = meses[fecha.getUTCMonth()];
    const año = fecha.getUTCFullYear();
    return `${mes}, ${año}`;
}

/**
 * Obtiene la clase CSS para el estado del ticket.
 * Ahora usa el campo `status.displayName` del JSON.
 * @param {object} ticket El objeto ticket.
 * @returns {string} La clase CSS correspondiente.
 */
export function getStatusClass(ticket) {
    const status = ticket.status?.displayName?.toLowerCase() || '';
    if (status.includes("progreso")) return "status-en-proceso";
    if (status.includes("espera")) return "status-esperando-respuesta";
    if (status.includes("cerrado") || status.includes("completado")) return "status-cerrado";
    return "";
}

/**
 * Obtiene la clase CSS para la prioridad del ticket.
 * Ahora usa el campo `priority.displayName` del JSON.
 * @param {object} ticket El objeto ticket.
 * @returns {string} La clase CSS correspondiente.
 */
export function getPriorityClass(ticket) {
    const priority = ticket.priority?.displayName?.toLowerCase() || '';
    if (priority.includes("baja")) return "priority-baja";
    if (priority.includes("media")) return "priority-media";
    if (priority.includes("alta")) return "priority-alta";
    if (priority.includes("crítica")) return "priority-critica";
    return "";
}
