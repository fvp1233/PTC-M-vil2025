import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const API_URL = 'http://localhost:8080/api';

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
  const res = await fetchWithAuth(`${API_URL}/UpdateTicket/${id}`, {
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
    try {
        const response = await fetchWithAuth(`http://localhost:8080/api/DeleteTicket/${id}`, {
            method: 'DELETE'
        });

        // Verificamos si la respuesta es exitosa (código 200-299)
        if (!response.ok) {
            // Si no es exitosa, leemos el error y lo lanzamos.
            const errorText = await response.text();
            throw new Error(`Error al eliminar el ticket: ${response.status} - ${errorText}`);
        }

        // Si la respuesta es exitosa, simplemente devolvemos true sin intentar leer el cuerpo
        // Esto evita el error de "Unexpected end of JSON input"
        return true; 
    } catch (error) {
        console.error('Error en la llamada a la API para eliminar ticket:', error);
        throw error;
    }
  }