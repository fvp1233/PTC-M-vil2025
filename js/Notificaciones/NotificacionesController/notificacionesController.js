import { 
    fetchBackendNotifications, 
    FormatearFecha 
} from '../NotificacionesService/notificacionesService.js'; 

let noNotifVista = null;
let notifVista = null;

/**
 * 🎨 Crea el elemento HTML para una notificación.
 * @param {Object} notificacion - Objeto con {message, notificationDate}
 * @returns {HTMLElement}
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
 * 🖼️ Renderiza las notificaciones obtenidas del backend + una estática según rol.
 */
async function renderBackendNotifications() {
    const data = await fetchBackendNotifications();

    // 🔍 Obtenemos el rol desde localStorage
    const userRole = localStorage.getItem('user_rol');

    // ✅ Notificación estática según rol
    let mensajeEstatico = null;
    if (userRole === 'CLIENTE') {
        mensajeEstatico = "Has creado un ticket exitosamente";
    } else if (userRole === 'TECNICO') {
        mensajeEstatico = "Has aceptado un ticket exitosamente";
    }

    if (mensajeEstatico) {
        const notificacionEstatica = {
            message: mensajeEstatico,
            notificationDate: new Date().toISOString()
        };
        data.unshift(notificacionEstatica);
    }

    notifVista.innerHTML = '';

    if (data.length === 0) {
        noNotifVista.style.display = 'flex';
        notifVista.style.display = 'none';
        return;
    }

    noNotifVista.style.display = 'none';
    notifVista.style.display = 'flex';

    data.forEach(noti => {
        const tarjeta = createNotificationElement(noti);
        notifVista.appendChild(tarjeta);
    });
}

// ---------------------------
// Inicialización
// ---------------------------

document.addEventListener('DOMContentLoaded', () => {
    noNotifVista = document.getElementById('no-notificaciones');
    notifVista = document.getElementById('notificaciones');

    if (noNotifVista && notifVista) {
        renderBackendNotifications();
    } else {
        console.warn("⚠️ Elementos DOM de notificaciones no encontrados.");
    }
});
