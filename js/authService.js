
// Obtiene el token JWT del localStorage
// Esta función es la que te permite "leer" la llave de autenticación
export function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

// Función general para hacer peticiones fetch con el token de autenticación
export async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();

    // Si no hay token no podemos hacer una petición
    // Redirigimos al usuario al login para que se autentique
    if (!token) {
        console.error('No se encontró el token de autenticación. Redirigiendo al login.');
        window.location.href = 'inicioSesion.html';
        return; // Detenemos la ejecución para evitar errores
    }

    // Clonamos las cabeceras existentes y añadimos el encabezado de autorización.
    const headers = options.headers? new Headers(options.headers) : new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    // El formato 'Bearer ' es un estándar de la industria.

    // Configuramos la petición con las nuevas cabeceras.
    const config = {
        ...options,
        headers: headers
    };

    try {
        const response = await fetch(url, config);
        
        // Manejamos los errores de autenticación (401: No autorizado, 403: Credenciales incorrectas).
        if (response.status === 401 || response.status === 403) {
            console.error('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.');
            localStorage.removeItem('jwt_token'); // Limpiamos el token viejo
          //  window.location.href = 'inicioSesion.html'; // Redirigimos al login
        }
        
        return response; // Devolvemos la respuesta para que la usemos en el siguiente paso.
    } catch (error) {
        console.error("Error en la petición:", error);
        throw error;
    }
}

export function getUserId(){
    return localStorage.getItem('userId')
}