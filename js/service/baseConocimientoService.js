API_URL = 'http://localhost:8080/api/getSolutions';

// Solicitud GET para cargar el contenido
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        CargarContenido(data);
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
    }
}