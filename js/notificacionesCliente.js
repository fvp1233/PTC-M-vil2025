import { getUserId } from "./Login/AuthService/authService";

document.addEventListener('DOMContentLoaded', async () => {
    const userId = getUserId(); // tu lógica para obtener el ID

    const response = await fetch(`/api/notificaciones?usuarioId=${userId}`);
    const notificaciones = await response.json();

    notificaciones.forEach(noti => {
        if (noti.seen === 0) { // solo si no ha sido vista
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: noti.message,
                showConfirmButton: false,
                timer: 5000
            });

            marcarComoVista(noti.id); // ✅ Marcar como vista
        }
    });
});

// ✅ Función para marcar como vista en el backend
async function marcarComoVista(id) {
    try {
        await fetch(`/api/notificaciones/${id}/marcarVista`, {
            method: 'PATCH'
        });
    } catch (error) {
        console.error("Error al marcar notificación como vista:", error);
    }
}
