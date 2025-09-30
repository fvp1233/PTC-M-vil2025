// Importamos la función de autenticación para obtener el ID de usuario
import { getUserId } from '../../Login/AuthService/authService.js';

const API_BASE = 'http://localhost:8080';
const STORAGE_KEY = 'h2c_notifications';

// ---------------------------
// Lógica de Datos (sessionStorage)
// ---------------------------

/**
 * 💾 Carga las notificaciones guardadas en el almacenamiento de la sesión.
 * @returns {Array<Object>} Lista de notificaciones guardadas.
 */
export function getSavedNotifications() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

/**
 * 💾 Guarda la lista completa de notificaciones en el almacenamiento de la sesión.
 * @param {Array<Object>} notifications - La lista de notificaciones a guardar.
 */
function saveNotifications(notifications) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

/**
 * 🔔 Procesa una nueva notificación en tiempo real, la guarda y devuelve el objeto listo para renderizar.
 * @param {string} message - El mensaje de la notificación (solo el string recibido por WS).
 * @returns {Object} El objeto de notificación con el mensaje y la fecha.
 */
export function processNewNotification(message) {
    const newNotification = {
        message: message,
        // Usamos la hora actual como marca de tiempo (ISO)
        notificationDate: new Date().toISOString()
    };

    // 1. Cargar las existentes y añadir la nueva al principio
    const existingNotifications = getSavedNotifications();
    existingNotifications.unshift(newNotification);

    // 2. Guardar la lista actualizada
    saveNotifications(existingNotifications);

    return newNotification;
}

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

// ---------------------------
// Lógica de Red (WebSocket)
// ---------------------------

/**
 * ⚙️ Configura y mantiene la conexión WebSocket (STOMP).
 * @param {function(Object)} onNotificationReceived - Callback del Controller para actualizar la UI.
 */
export function setupStompClient(onNotificationReceived) {
    getUserId().then(userId => {
        if (!userId) {
            console.warn("Usuario no autenticado, no se conecta WebSocket.");
            return;
        }

        const socket = new SockJS(`${API_BASE}/ws`);
        const stompClient = Stomp.over(socket);

        const headers = {};

        stompClient.connect(headers, function (frame) {
            console.log(`Conexión WS exitosa. Suscribiéndose a: /user/queue/notifications para ${userId}`);

            stompClient.subscribe("/user/queue/notifications", function (message) {
                console.log("📨 Notificación recibida:", message); // 👈 Este log es clave
                const newNotification = processNewNotification(message.body);
                onNotificationReceived(newNotification);
            });

        }, function (error) {
            console.error('❌ Error de conexión STOMP:', error);
        });
    }).catch(error => {
        console.error('Error al obtener el userId para WS:', error);
    });
}