// 1. Importamos la función que INCLUYE el token en la petición
import { fetchWithAuth } from '../../authService.js'; // Asegúrate de que la ruta a authService.js sea correcta

// 2. Definimos la URL base para los USUARIOS, coincidiendo con el @RequestMapping del backend
const API_URL = "http://localhost:8080/api";

export async function getUserById(userId) {
    if (!userId) {
        throw new Error('El ID de usuario es requerido.');
    }
    
    // 3. Usamos fetchWithAuth para que la petición vaya con el token
    // 4. La URL final es la combinación de la base + el ID
    const response = await fetchWithAuth(`${API_URL}/GetUser/${userId}`);
    
    if (!response.ok) {
        // Aquí podemos dar un mensaje más detallado si la API nos lo da
        const errorData = await response.json().catch(() => ({ message: 'Error al obtener el usuario' }));
        throw new Error(errorData.message || 'No se pudieron obtener los datos del usuario.');
    }
    
    return response.json();
}

export async function updateUsername(userId, data) {
    // CORRECCIÓN AQUÍ: Cambiamos la URL de '/user/' a '/users/' para que coincida con la configuración de seguridad del backend
    try {
        console.log('Datos que se enviarán al backend:', data);
        const response = await fetchWithAuth(`${API_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
        });

        // Verificamos si la respuesta fue exitosa
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error al actualizar el usuario' }));
            throw new Error(errorData.message || 'Error al actualizar el usuario.');
        }

        return response.json();

    } catch (error) {
        console.error("Error en updateUsername:", error);
        throw error;
    }
}
