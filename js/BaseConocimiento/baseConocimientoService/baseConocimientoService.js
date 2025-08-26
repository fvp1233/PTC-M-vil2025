// Se importan las funciones 'fetchWithAuth' y 'getUserId' desde el servicio de autenticación.
// 'fetchWithAuth' es una envoltura de 'fetch' que incluye el token de autenticación.
// 'getUserId' es una función para obtener el ID del usuario actual.
import { fetchWithAuth, getUserId } from '../../authService.js';

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
    // Se construye la URL de la solicitud con los parámetros de paginación.
    let url = `${API_URL}/GetSolutions?page=${page}&size=${size}`;

    // Si el 'categoryId' no es 0, se añade el parámetro de filtro a la URL.
    if (categoryId !== 0) {
        url += `&categoryId=${categoryId}`;
    }

    // Se realiza la solicitud GET a la URL construida, usando la función 'fetchWithAuth' para incluir la autenticación.
    const response = await fetchWithAuth(url);

    // Si la respuesta no fue exitosa (código de estado 200), se lanza un error.
    if (!response.ok) {
        throw new Error(`No se pudieron cargar las soluciones. Código: ${response.status}`);
    }

    // Se parsea la respuesta como JSON y se retorna.
    return response.json();
}

/**
 * Función asíncrona para buscar soluciones por título.
 * @param {string} title - El término de búsqueda del título.
 * @param {number} page - El número de página (basado en 0).
 * @param {number} size - El tamaño de la página.
 */
export async function searchSolutionsByTitle(value, page = 0, size = 10) {
    // Se construye la URL de búsqueda, codificando el título para que sea seguro en la URL.
    const url = `${API_URL}/searchSolution?title=${encodeURIComponent(value)}&page=${page}&size=${size}`;

    try {
        // Se realiza la solicitud GET a la API.
        const response = await fetchWithAuth(url, {
            method: 'GET',
        });

        // Si la respuesta no es exitosa, se lee el cuerpo del error y se lanza un nuevo error.
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        // Se parsea la respuesta como JSON y se retorna.
        const data = await response.json();
        return data;
    } catch (error) {
        // Se manejan los errores, registrándolos y relanzándolos.
        console.error("Error en la búsqueda:", error);
        throw error;
    }
}