// authService.js

// Gets the JWT token from localStorage
export function getAuthToken() {
    return localStorage.getItem('jwt_token');
}

// General function to make fetch requests with the authentication token
export async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        // Throw an error if no token is found.
        throw new Error('No se encontró el token de autenticación.');
    }

    const headers = options.headers ? new Headers(options.headers) : new Headers();
    headers.set('Authorization', `Bearer ${token}`);
    
    const config = {
        ...options,
        headers: headers
    };

    const response = await fetch(url, config);
    
    // Handle authentication errors (401: Unauthorized, 403: Forbidden, etc.).
    if (response.status === 401 || response.status === 403) {
        console.error('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.');
        localStorage.removeItem('jwt_token');
        window.location.href = 'inicioSesion.html';
        // By redirecting, we stop the rest of the script from executing
        return; 
    }
    
    // If the request was successful but the status is not ok (e.g., a server-side validation error 400),
    // we throw an error.
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error en la petición: ${response.status} - ${errorBody}`);
    }
    
    // If everything is okay, return the response.
    return response;
}

export function getUserId() {
    return localStorage.getItem('userId');
}