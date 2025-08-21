import { fetchWithAuth } from '../../authService.js';

const API_URL = 'http://localhost:8080/api';

// Obtiene todos los tickets de la API.
export async function getTickets() {
    try {
        const response = await fetchWithAuth(`${API_URL}/GetTickets`);
        
        if (!response.ok) {
            throw new Error(`HTTP error status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error al obtener tickets:", error);
        throw error;
    }
}

export const getRecentTicketsByUser = async (userId) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/GetRecentTicketsByUser/${userId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener los tickets: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};

export const getUserById = async (userId) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/GetUserById/${userId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener usuario: ${response.statusText}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};
