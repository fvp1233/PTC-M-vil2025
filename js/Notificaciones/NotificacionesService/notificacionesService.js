import { getUserId } from '../../Login/AuthService/authService.js';

const API_BASE = 'https://ptchelpdesk-a73934db2774.herokuapp.com/';
const STORAGE_KEY = 'h2c_notifications';

/**
 * 📅 Formatea una cadena de fecha ISO a "dd, Mes, aaaa".
 */
export function FormatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();
    return `${dia}, ${mes}, ${año}`;
}

/**
 * 🔄 Obtiene las notificaciones del backend para el usuario actual.
 * @returns {Promise<Array<Object>>}
 */
export async function fetchBackendNotifications() {
    try {
        const userId = await getUserId();
        if (!userId) throw new Error("Usuario no autenticado");

        const response = await fetch(`${API_BASE}/api/notificaciones?usuarioId=${userId}`);
        if (!response.ok) throw new Error("Error al obtener notificaciones");

        return await response.json();
    } catch (error) {
        console.error("❌ Error al obtener notificaciones:", error);
        return [];
    }
}
