const API_URL = 'https://6864654f5b5d8d03397d1e12.mockapi.io/Daniela/tbNotifications';

const noNotifVista = document.getElementById('no-notificaciones');
const notifVista = document.getElementById('notificaciones');

//Solicitud GET para cargar las notificaciones
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        CargarNotificaciones(data);
    } catch (error) {
        console.error('Error al cargar las notificaciones:', error);
        notifVista.innerHTML = '<p>Error al cargar las notificaciones.</p>';
    }
}

function FormatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    const dia = fecha.getDate().toString().padStart(2, '0');
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const mes = meses[fecha.getMonth()];
    const año = fecha.getFullYear();

    return `${dia}, ${mes}, ${año}`;
}

function CargarNotificaciones(data) {
    if (data.length === 0) {
        noNotifVista.style.display = 'flex';
        return;
    } else {
        noNotifVista.style.display = 'none';
        notifVista.style.display = 'flex';

        data.forEach(notificacion => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'tarjeta';
            tarjeta.innerHTML = `
            <p class="fecha">${FormatearFecha(notificacion.notificationDate)}</p>
            <p class="notificacion">${notificacion.message}</p>
        `;
            notificaciones.appendChild(tarjeta);
        });
    }
}

window.addEventListener('DOMContentLoaded', CargarDatos);