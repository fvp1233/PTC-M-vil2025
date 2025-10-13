import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

/**
 * Obtiene los tickets asignados a un técnico específico
 * @param {number} technicianId - ID del técnico
 * @returns {Promise<Array>} Lista de tickets asignados al técnico
 */
export async function getAssignedTicketsByTech(technicianId) {
    try {
        const data = await fetchWithAuth(`${API_URL}/tech/GetAssignedTicketsByTech/${technicianId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener tickets asignados del técnico:', error);
        throw error;
    }
}

/**
 * Obtiene un ticket específico por su ID
 * @param {number} ticketId - ID del ticket
 * @returns {Promise<Object>} Datos del ticket
 */
export async function getTicketById(ticketId) {
    try {
        const data = await fetchWithAuth(`${API_URL}/client/GetTicketById/${ticketId}`);
        return data;
    } catch (error) {
        console.error('Error al obtener el ticket por ID:', error);
        throw error;
    }
}