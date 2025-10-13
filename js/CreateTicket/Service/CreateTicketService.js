import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

export async function getCategorias() {
  const response = await fetchWithAuth(`${API_URL}/categories`)
 
  
  return await response;
}

export const getPrioridades = async () => {
    try {
        // ✅ Para requests con configuración especial
        const data = await fetchWithAuth(`${API_URL}/priority`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
              },
        });

        return data;
        
    } catch (error) {
        console.error("Error fetching priorities:", error);
        throw error;
    }
  }

export async function getTecnicosDisponibles() {
  const response = await fetchWithAuth(`${API_URL}/GetTech`)
  
  return response;
}


export async function createTicket(ticketData, imageUrl) {
  const payload = {...ticketData, imageUrl};
  const res = await fetchWithAuth(`${API_URL}/client/PostTicket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return res;
}

export async function updateTicket(id, ticketData) {
  const res = await fetchWithAuth(`${API_URL}/client/UpdateTicket/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  return res.text(); // Devuelve el toString del ticket
}

export const getTicketById = async (ticketId) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/GetTicketById/${ticketId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener el ticket: ${response.statusText}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error en la llamada a la API para el ticket:', error);
        throw error;
    }
};

export async function deleteTicket(id) {
    const url = `${API_URL}/client/DeleteTicket/${id}`;

    try {
        const response = await fetchWithAuth(url, { method: 'DELETE' });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error al eliminar ticket ${id}:`, errorText);
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        console.log(`🗑️ Ticket ${id} eliminado exitosamente.`);
        return true;
    } catch (error) {
        console.error('❌ Error en la llamada a la API para eliminar ticket:', error);
        throw error;
    }
}