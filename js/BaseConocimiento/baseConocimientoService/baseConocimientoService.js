// Constante de la URL base para la API
const API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Mapeo para traducir categoryId a nombres de categoría
export const categoryMap = {
    1: 'Soporte técnico',
    2: 'Consultas',
    3: 'Gestión de usuarios',
    4: 'Redes',
    5: 'Incidentes críticos'
};

/**
 * Carga todas las soluciones (tarjetas) desde la API.
 * @returns {Promise<Array<Object>>} Un arreglo con todas las soluciones.
 */
export async function getSolutions() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) {
            throw new Error(`Error HTTP: ${res.status}`);
        }
        return await res.json();
    } catch (error) {
        console.error('Error al cargar el contenido desde la API:', error);
        throw error; // Propagar el error para que el controller lo maneje
    }
}

// Nota: Como no hay lógica de Creación, Actualización o Eliminación (POST/PUT/DELETE),
// solo se necesita la función de lectura (getSolutions).