// Se importan las funciones 'fetchWithAuth' y 'getUserId' desde el servicio de autenticación.
import { fetchWithAuth, getUserId } from '../../Login/AuthService/authService.js';

// Se define una constante para la URL base de la API, apuntando a un servidor local.
const API_URL = 'http://localhost:8080/api';

// Se exporta un mapa de categorías para asociar los IDs numéricos con sus nombres descriptivos.
export const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

/**
 * Obtiene soluciones desde la API con paginación y filtro por categoría.
 * @param {number} page - Página a obtener (base 0).
 * @param {number} size - Cantidad de elementos por página.
 * @param {number} categoryId - ID de categoría para filtrar. Si es 0, se obtienen todas.
 */
export async function getSolutions(page = 0, size = 10, categoryId = 0) {
    let url = `${API_URL}/GetSolutions?page=${page}&size=${size}`;
    if (categoryId !== 0) {
        url += `&categoryId=${categoryId}`;
    }

    try {
        const data = await fetchWithAuth(url);
        console.log("📦 JSON recibido en getSolutions:", data);
        return data;
    } catch (error) {
        console.error("❌ Error capturado en getSolutions:", error);
        throw error;
    }
}

/**
 * Guarda una solución (crear o actualizar).
 * @param {string|null} solutionId - ID de la solución. Si es null, se crea una nueva.
 * @param {object} solutionData - Datos de la solución.
 */
export async function saveSolution(solutionId, solutionData) {
    const isUpdating = !!solutionId;
    const url = isUpdating ? `${API_URL}/UpdateSolution/${solutionId}` : `${API_URL}/PostSolution`;
    const method = isUpdating ? 'PATCH' : 'POST';

    if (!isUpdating) {
        solutionData.userId = getUserId();
    }

    try {
        const response = await fetchWithAuth(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(solutionData),
        });

        if (!response.ok) {
            let errorText = 'Error al guardar la solución.';
            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorText = errorData.error || errorData.message || errorText;
            } else {
                errorText = response.statusText || errorText;
            }

            throw new Error(errorText);
        }

        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return null;
        }

        const data = await response.json();
        console.log("✅ Solución guardada:", data);
        return data;
    } catch (error) {
        console.error("❌ Error al guardar solución:", error);
        throw error;
    }
}

/**
 * Elimina una solución por ID.
 * @param {string} solutionId - ID de la solución a eliminar.
 */
export async function deleteSolution(solutionId) {
    const url = `${API_URL}/DeleteSolution/${solutionId}`;

    try {
        const response = await fetchWithAuth(url, { method: 'DELETE' });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        console.log("🗑️ Solución eliminada:", solutionId);
    } catch (error) {
        console.error("❌ Error al eliminar solución:", error);
        throw error;
    }
}

/**
 * Busca soluciones por título.
 * @param {string} value - Término de búsqueda.
 * @param {number} page - Página (base 0).
 * @param {number} size - Tamaño de página.
 */
export async function searchSolutionsByTitle(value, page = 0, size = 10) {
    const url = `${API_URL}/searchSolution?title=${encodeURIComponent(value)}&page=${page}&size=${size}`;

    try {
        const data = await fetchWithAuth(url, { method: 'GET' });
        console.log("🔍 Resultados de búsqueda recibidos:", data);
        return data;
    } catch (error) {
        console.error("❌ Error en la búsqueda:", error);
        throw error;
    }
}
