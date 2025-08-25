// baseConocimientoTechService.js

// 1. ¡IMPORTANTE! Importamos la función fetchWithAuth y getUserId de nuestro servicio de autenticación.
import { fetchWithAuth, getUserId } from '../../authService.js';

// La URL base de tu API para las soluciones. AJÚSTALA SI ES NECESARIO.
const API_URL = 'http://localhost:8080/api';

export const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

export async function getSolutions(page = 0, size = 10) {
    // 2. Construimos la URL con los parámetros de paginación
    const url = `${API_URL}/GetSolutions?page=${page}&size=${size}`;

    // 3. Usamos fetchWithAuth en lugar de fetch.
    const response = await fetchWithAuth(url); // <-- Ahora usa la URL completa con parámetros

    if (!response.ok) {
        throw new Error(`No se pudieron cargar las soluciones. Código: ${response.status}`);
    }

    // Devuelve el objeto Page<SolutionDTO> completo
    return response.json();
}

/**
 * Guarda una solución (Crea una nueva o actualiza una existente).
 * @param {string|null} solutionId - El ID de la solución a actualizar, o null si se crea una nueva.
 * @param {object} solutionData - Los datos de la solución.
 */
export async function saveSolution(solutionId, solutionData) {
    const isUpdating = !!solutionId;
    const url = isUpdating ? `${API_URL}/UpdateSolution/${solutionId}` : `${API_URL}/PostSolution`;

    // 1. CORRECCIÓN: Usar PATCH para actualización
    const method = isUpdating ? 'PATCH' : 'POST';

    // Si estamos creando, añadimos el userId del usuario logueado.
    if (!isUpdating) {
        solutionData.userId = getUserId();
    }

    // 2. Usamos fetchWithAuth para la petición de guardado.
    const response = await fetchWithAuth(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(solutionData),
    });

    // 3. CORRECCIÓN: Manejo de errores
    if (!response.ok) {
        let errorText = 'Error al guardar la solución.';

        // Intenta leer el cuerpo de error si no está vacío
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                const errorData = await response.json();
                // Usamos el mensaje de error del backend (si existe)
                errorText = errorData.error || errorData.message || errorText;
            } catch (e) {
                // Si falla al leer JSON, usamos el estado de texto (ej: "Forbidden")
                errorText = response.statusText;
            }
        } else {
            // Si la respuesta es 403 (Forbidden) o 500 (y no devuelve JSON), usamos el statusText
            errorText = response.statusText || errorText;
        }

        throw new Error(errorText);
    }

    // 4. CORRECCIÓN: Evitar response.json() si es una respuesta exitosa sin contenido (PATCH 204 o 200 sin cuerpo)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null; // Éxito sin contenido para PATCH/DELETE
    }

    // Solo si se espera un cuerpo (normalmente POST exitoso o GET)
    return response.json();
}

/**
 * Elimina una solución por su ID.
 * @param {string} solutionId - El ID de la solución a eliminar.
 */
export async function deleteSolution(solutionId) {
    const url = `${API_URL}/DeleteSolution/${solutionId}`;

    // 2. Usamos fetchWithAuth para la petición de eliminación.
    const response = await fetchWithAuth(url, {
        method: 'DELETE',
    });

    if (!response.ok) {
        throw new Error('Error al eliminar la solución.');
    }
    // Para DELETE, a menudo no hay un cuerpo JSON de respuesta, así que no lo procesamos.
}