// js/notificationController.js

// Importamos solo las funciones necesarias del Service
import { 
    getSavedNotifications, 
    FormatearFecha,
    setupStompClient 
} from '../NotificacionesService/notificacionesService.js'; 

// Variables de estado y DOM
let noNotifVista = null; // El div de "No tienes notificaciones"
let notifVista = null;  // El div container de las notificaciones

/**
 * 🎨 Crea el elemento HTML para una notificación.
 * @param {Object} notificacion - Objeto con {message, notificationDate}
 * @returns {HTMLElement} La tarjeta de notificación.
 */
function createNotificationElement(notificacion) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'tarjeta';
    
    tarjeta.innerHTML = `
        <p class="fecha">${FormatearFecha(notificacion.notificationDate)}</p>
        <p class="notificacion">${notificacion.message}</p>
    `;
    return tarjeta;
}

/**
 * 🖼️ Renderiza todas las notificaciones cargadas desde el Service.
 * Se llama al cargar la página (DOMContentLoaded).
 */
function RenderSavedNotifications() {
    const data = getSavedNotifications();
    notifVista.innerHTML = ''; // Limpiar cualquier contenido previo
    
    if (data.length === 0) {
        noNotifVista.style.display = 'flex';
        notifVista.style.display = 'none';
        return;
    } 

    noNotifVista.style.display = 'none';
    notifVista.style.display = 'flex';

    // Recorre y renderiza las notificaciones
    data.forEach(notificacion => {
        const tarjeta = createNotificationElement(notificacion);
        notifVista.appendChild(tarjeta);
    });
}

/**
 * 🔔 Función que actualiza el DOM (UI) cuando llega un mensaje en tiempo real.
 * Esta es la función de callback que se pasa al Service.
 * @param {Object} newNotification - El objeto de notificación ya procesado y guardado por el Service.
 */
function handleRealTimeNotification(newNotification) {
    const message = newNotification.message;

    // Mostrar el toast emergente
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: message,
            showConfirmButton: false,
            timer: 5000
        });
    }

    // Verificamos que los elementos DOM existan antes de renderizar
    if (!notifVista || !noNotifVista) {
        console.warn("⚠️ Elementos DOM de notificaciones no disponibles. Solo se muestra el toast.");
        return;
    }

    const newElement = createNotificationElement(newNotification);

    if (notifVista.firstChild) {
        notifVista.insertBefore(newElement, notifVista.firstChild);
    } else {
        notifVista.appendChild(newElement);
    }

    noNotifVista.style.display = 'none';
    notifVista.style.display = 'flex';
}



// ---------------------------
// Inicialización
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtener referencias del DOM
    noNotifVista = document.getElementById('no-notificaciones');
    notifVista = document.getElementById('notificaciones');
    
    if (noNotifVista && notifVista) {
        // Cargar las notificaciones que ya están en la sesión
        RenderSavedNotifications(); 
    } else {
        console.warn("Elementos DOM de notificaciones no encontrados. Solo se mostrarán toasts.");
    }
    
    // 2. Iniciar la conexión de tiempo real:
    // El Controller llama al Service y le dice qué función usar para la UI.
    setupStompClient(handleRealTimeNotification);
});

window.handleRealTimeNotification = handleRealTimeNotification;
