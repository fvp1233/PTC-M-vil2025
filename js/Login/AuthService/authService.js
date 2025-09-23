// authService.js

const API_URL = "http://localhost:8080/api";


export async function login({username, password}) {
    const response = await fetch(`${API_URL}/users/login` , {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        credentials: 'include',     
        body: JSON.stringify({username, password}),
    });

    if(!response.ok){
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el login');
    }
    return true; //Solo retornamos éxito, no mandamos nada de datos
}

export async function me() {
    const response = await fetch(`${API_URL}/users/authme`, {
        method: 'POST',
        credentials: 'include'
    });

    if(response.ok){
        return await response.json(); // aqui viene el username, rol, userId y passwordExpired
    } else{
        throw new Error('No autenticado');
    }
}

export async function logout() {
    try{
        const response = await fetch(`${API_URL}/users/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        return response.ok;

    } catch{
        return false;
    }
}

export async function fetchWithAuth(url, options = {}) {
    console.log('🔄 Fetching:', url);
    console.log('🍪 Cookies disponibles:', document.cookie);
    try {

        //Contruye la URL COMPLETA por si viene con algun error, aqui se solciona, asi es mas flexible
        const fullUrl = url.startsWith('http') ? url : `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;

        const config = {
            ...options,
            credentials: 'include', //Para enviar cookies
            headers: {
                'Content-Type': 'application/json',
                ...options.headers // Mantener headers personalizados
            }
        };
                console.log('📤 Request config:', config);
        
        
        const response = await fetch(fullUrl, config);
        
        
        // ✅ Primero verificar si la respuesta es JSON
        const contentType = response.headers.get('content-type');
        const isJson = contentType && contentType.includes('application/json');
        
        // Manejar errores de autenticación
        if (response.status === 401 || response.status === 403) {
            console.error('Sesión expirada o token inválido. Por favor, vuelve a iniciar sesión.');
            clearUserData();
            
            //  Redirigir solo si es una página HTML
            if (RedirectedToLogin()) {
              //  window.location.href = 'inicioSesion.html';
            }
            
            throw new Error('Acceso denegado o sesión inválida');
        }
        
        // Manejar otros errores HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            if (isJson) {
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    console.warn('Error parseando JSON de error:', parseError);
                }
            } else {
                try {
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                } catch (textError) {
                    console.warn('Error leyendo texto de error:', textError);
                }
            }
            
            throw new Error(errorMessage);
            }
        
        // Devolver el JSON parseado si es JSON, sino la respuesta
        if(isJson){
            return await response.json();
        } else{
            return response;
        }
        
    } catch (error) {
        console.error('Error en fetchWithAuth:', error);
        throw error; // ✅ Relanzar el error para manejo externo
    }
}

export function getUserId() {
    return localStorage.getItem('userId');
}

 function clearUserData(){
    const userKeys = ['userId', 'rol', 'username', 'passwordExpired'];
    userKeys.forEach(key => localStorage.removeItem(key));

    console.log("datos de usuario limpiados")
 }

 function RedirectedToLogin(){
    if(window.location.pathname.includes('inicioSesion.html')){
        return false;
    }

    return window.location.pathname.endsWith('.html') || !window.location.pathname.includes ('.');
 }