// 1. Importamos la función que INCLUYE el token en la petición
import { fetchWithAuth } from "../../Login/AuthService/authService.js";

// 2. Definimos la URL base para los USUARIOS, coincidiendo con el @RequestMapping del backend
const API_URL = "http://localhost:8080/api";

// 3. Obtener usuario por ID
export async function getUserById(userId) {
    if (!userId) {
        throw new Error('El ID de usuario es requerido.');
    }

    try {
        const userData = await fetchWithAuth(`${API_URL}/GetUser/${userId}`);
        return userData;
    } catch (error) {
        console.error("❌ Error al obtener el usuario:", error);
        throw error;
    }
}

// 4. Actualizar nombre de usuario (envía DTO completo)
export async function updateUsername(userId, data) {
    try {
        const result = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        return result;
    } catch (error) {
        console.error("❌ Error en updateUsername:", error);
        throw error;
    }
}


// 5. Actualizar foto de perfil (envía DTO completo)
export async function updateProfilePicture(userId, updatedUserData) {
    try {
        console.log('🖼️ DTO para foto de perfil:', updatedUserData);

        const result = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedUserData),
        });

        console.log("✅ Foto de perfil actualizada:", result);
        return result;

    } catch (error) {
        console.error("❌ Error al actualizar la foto de perfil:", error);
        throw error;
    }
}

export async function getTicketCountByUser(userId) {
    const response = await fetchWithAuth(`${API_URL}/client/count/by-user/${userId}`);

    // Si fetchWithAuth ya devuelve el JSON, no hagas .json() otra vez
    if (typeof response === 'number') return response;

    // Si es un Response, entonces sí hacés .json()
    if (response.ok) {
        const count = await response.json();
        return count;
    } else {
        throw new Error("Acceso denegado al recurso solicitado");
    }
}
