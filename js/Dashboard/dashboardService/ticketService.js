import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

// Obtiene todos los tickets de la API.
export async function getTickets() {
    try {
        // ✅ fetchWithAuth ahora devuelve el JSON directamente
        const data = await fetchWithAuth(`${API_URL}/admin/GetTickets`);
        return data;
        
    } catch (error) {
        console.error("Error al obtener tickets:", error);
        throw error;
    }
}

export const getRecentTicketsByUser = async (userId) => {
    try {
        // ✅ fetchWithAuth devuelve datos, no response
        const data = await fetchWithAuth(`${API_URL}/client/GetRecentTicketsByUser/${userId}`);
        return data;
        
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        // ✅ Directamente obtenemos los datos
        const user = await fetchWithAuth(`${API_URL}/GetUser/${userId}`);
        return user;
        
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};

export const getTicketById = async (ticketId) => {
    try {
        // ✅ Sin .json(), sin .ok
        const data = await fetchWithAuth(`${API_URL}/client/GetTicketById/${ticketId}`);
        return data;
        
    } catch (error) {
        console.error('Error en la llamada a la API para el ticket:', error);
        throw error;
    }
};

export const getPrioridades = async () => {
    try {
        // ✅ Para requests con configuración especial
        const data = await fetchWithAuth(`${API_URL}/priority`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        return data;
        
    } catch (error) {
        console.error("Error fetching priorities:", error);
        throw error;
    }
};

