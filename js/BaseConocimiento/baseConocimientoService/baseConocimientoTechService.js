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

/**
 * Función que obtiene las soluciones con paginación y filtro de categoría.
 * @param {number} page - El número de página (base 0).
 * @param {number} size - El tamaño de la página.
 * @param {number} categoryId - El ID de la categoría a filtrar, 0 para todas.
 */
export async function getSolutions(page = 0, size = 10, categoryId = 0) {
    // 2. Construimos la URL base con la paginación
    let url = `${API_URL}/GetSolutions?page=${page}&size=${size}`;

    // 3. CORRECCIÓN CRÍTICA: Añadimos el filtro de categoría si es diferente de 0
    if (categoryId !== 0) {
        url += `&categoryId=${categoryId}`; // <-- AÑADIDO: Agrega el parámetro de categoría
    }

    // 4. Usamos fetchWithAuth en lugar de fetch.
    const response = await fetchWithAuth(url); // <-- Ahora usa la URL con el filtro

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
    const method = isUpdating ? 'PATCH' : 'POST';

    if (!isUpdating) {
        solutionData.userId = getUserId();
    }

    const response = await fetchWithAuth(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(solutionData),
    });

    if (!response.ok) {
        let errorText = 'Error al guardar la solución.';
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                const errorData = await response.json();
                errorText = errorData.error || errorData.message || errorText;
            } catch (e) {
                errorText = response.statusText;
            }
        } else {
            errorText = response.statusText || errorText;
        }
        throw new Error(errorText);
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    return response.json();
}

export async function deleteSolution(solutionId) {
    const url = `${API_URL}/DeleteSolution/${solutionId}`;
    const response = await fetchWithAuth(url, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Error al eliminar la solución.');
    }
}

export async function searchSolutionsByTitle(title, page = 0, size = 10) {
    const url = `${API_URL}/searchSolution?title=${encodeURIComponent(title)}&page=${page}&size=${size}`;

    try {
        // CAMBIO CRÍTICO: Usamos fetchWithAuth en lugar de fetch, para no necesitar getAuthToken
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en la búsqueda:", error);
        throw error;
    }
}
