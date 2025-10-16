// 1. Importamos la función que INCLUYE el token en la petición
import { fetchWithAuth } from '../../Login/AuthService/authService.js'; // Ajustá la ruta si es distinta

// 2. Definimos la URL base para los USUARIOS
const API_URL = "https://ptchelpdesk-a73934db2774.herokuapp.com/api";

/**
 * 🔍 Obtiene los datos de un usuario por su ID
 */
export async function getUserById(userId) {
    if (!userId) {
        throw new Error('El ID de usuario es requerido.');
    }

    const userData = await fetchWithAuth(`${API_URL}/GetUser/${userId}`);
    return userData; // ✅ Ya es JSON, no usar .json()
}

/**
 * ✏️ Actualiza el nombre de usuario
 */
export async function updateUsername(userId, data) {
    try {
        console.log('Datos que se enviarán al backend:', data);

        const result = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        return result; // ✅ Ya es JSON
    } catch (error) {
        console.error("Error en updateUsername:", error);
        throw error;
    }
}

/**
 * 📊 Obtiene el número de tickets solucionados por un técnico
 */
export async function getCompletedTicketCountByTech(techId) {
    if (!techId) {
        throw new Error('El ID del técnico es requerido.');
    }

    const count = await fetchWithAuth(`${API_URL}/tech/count/completed-by-tech/${techId}`);
    return count; // ✅ Ya es JSON (un número)
}