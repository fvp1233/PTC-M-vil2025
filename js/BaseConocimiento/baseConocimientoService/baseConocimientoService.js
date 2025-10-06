// Se importan las funciones 'fetchWithAuth' y 'getUserId' desde el servicio de autenticación.
// 'fetchWithAuth' es una envoltura de 'fetch' que incluye el token de autenticación.
// 'getUserId' es una función para obtener el ID del usuario actual.
import { fetchWithAuth, getUserId } from '../../Login/AuthService/authService.js';

// Se define una constante para la URL base de la API, apuntando a un servidor local.
const API_URL = 'http://localhost:8080/api';

// Se exporta un mapa de categorías para asociar los IDs numéricos con sus nombres descriptivos.
// Esto facilita la conversión de IDs a nombres legibles en la interfaz de usuario.
export const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

/**
 * Función asíncrona que obtiene las soluciones de la API.
 * Se usan parámetros por defecto para la paginación y el filtro de categoría.
 * @param {number} page - El número de página a obtener (basado en 0).
 * @param {number} size - El número de elementos por página.
 * @param {number} categoryId - El ID de la categoría para filtrar. Si es 0, se obtienen todas.
 */
export async function getSolutions(page = 0, size = 10, categoryId = 0) {
    let url = `${API_URL}/GetSolutions?page=${page}&size=${size}`;
    if (categoryId !== 0) {
        url += `&categoryId=${categoryId}`;
    }

    try {
        const data = await fetchWithAuth(url); // ya es JSON
        console.log("📦 JSON recibido en getSolutions:", data);
        return data;
    } catch (error) {
        console.error("❌ Error capturado en getSolutions:", error);
        throw error;
    }
}

/**
 * Función asíncrona para buscar soluciones por título.
 * @param {string} title - El término de búsqueda del título.
 * @param {number} page - El número de página (basado en 0).
 * @param {number} size - El tamaño de la página.
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
