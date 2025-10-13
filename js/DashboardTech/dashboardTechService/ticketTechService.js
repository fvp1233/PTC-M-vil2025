import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api'

export async function getAssignedTicketsByTech(technicianId) {
    try {
        const data = await fetchWithAuth(`${API_URL}/tech/GetAssignedTicketsByTech/${technicianId}`);
        return data;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
}


export async function acceptTicket(ticketId, technicianId) {
    try {
        //  NUEVA FUNCIÓN: Llama al endpoint para aceptar un ticket
        const response = await fetchWithAuth(`${API_URL}/tech/accept/${ticketId}/${technicianId}`, {
            method: 'PUT'
        });
        
        // El back-end devuelve 200 OK si todo fue bien.
        // fetchWithAuth ya devuelve el JSON parseado.
        return response;

    } catch (error) {
        console.error('Error al aceptar el ticket:', error);
        throw error;
    }
}

export const getAvailableTicketsForTechnician = async (technicianId) => {
    try {
        const data = await fetchWithAuth(`${API_URL}/tech/available-tickets?technicianId=${technicianId}`);
        return data;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};

export async function declineTicket(ticketId, technicianId) {
    try {
        const response = await fetchWithAuth(`${API_URL}/tech/decline-ticket/${ticketId}/${technicianId}`, {
            method: 'POST'
        });
        return response;
    } catch (error) {
        console.error('Error al declinar el ticket:', error);
        throw error;
    }
}