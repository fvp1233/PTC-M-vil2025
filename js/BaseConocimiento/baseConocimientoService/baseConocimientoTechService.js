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
 * Función asíncrona para guardar una solución (crear o actualizar).
 * @param {string|null} solutionId - El ID de la solución a actualizar. Si es null, se crea una nueva.
 * @param {object} solutionData - El objeto con los datos de la solución (título, descripción, etc.).
 */
export async function saveSolution(solutionId, solutionData) {
    // Se verifica si se está actualizando una solución existente.
    const isUpdating = !!solutionId;
    // Se determina la URL y el método HTTP ('PATCH' para actualizar, 'POST' para crear).
    const url = isUpdating ? `${API_URL}/UpdateSolution/${solutionId}` : `${API_URL}/PostSolution`;
    const method = isUpdating ? 'PATCH' : 'POST';

    // Si se está creando una nueva solución, se le añade el ID del usuario.
    if (!isUpdating) {
        solutionData.userId = getUserId();
    }

    // Se realiza la solicitud a la API con el método, encabezados y cuerpo de la solicitud.
    const response = await fetchWithAuth(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(solutionData), // Se convierte el objeto de datos a una cadena JSON.
    });

    // Si la respuesta no es exitosa, se maneja el error.
    if (!response.ok) {
        let errorText = 'Error al guardar la solución.';
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            try {
                // Se intenta parsear el error como JSON para obtener un mensaje más detallado.
                const errorData = await response.json();
                errorText = errorData.error || errorData.message || errorText;
            } catch (e) {
                // Si falla el parseo, se usa el texto del estado de la respuesta.
                errorText = response.statusText;
            }
        } else {
            errorText = response.statusText || errorText;
        }
        // Se lanza el error con el mensaje obtenido.
        throw new Error(errorText);
    }

    // Si el estado de la respuesta es 204 (Sin contenido) o el cuerpo está vacío, se retorna null.
    if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null;
    }

    // Se retorna la respuesta parseada como JSON.
    return response.json();
}

/**
 * Función asíncrona para eliminar una solución.
 * @param {string} solutionId - El ID de la solución a eliminar.
 */
export async function deleteSolution(solutionId) {
    // Se construye la URL para la solicitud de eliminación.
    const url = `${API_URL}/DeleteSolution/${solutionId}`;
    // Se realiza la solicitud DELETE a la API.
    const response = await fetchWithAuth(url, {
        method: 'DELETE',
    });
    // Si la respuesta no es exitosa, se lanza un error.
    if (!response.ok) {
        throw new Error('Error al eliminar la solución.');
    }
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