import { me } from "../AuthService/authService.js";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/users/login';

document.addEventListener('DOMContentLoaded', (event) => {
    // Obtén los elementos del DOM
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    initializePasswordToggle();

    if(loginForm){
        loginForm.addEventListener('submit', handledLoginSubmit);
    }

    // Escucha el evento de envío del formulario
    
    async function handledLoginSubmit(e) {
        e.preventDefault();

        const username = usernameInput.value;
        const password = passwordInput.value;

        try {
            errorMessage.textContent = '';
                
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
               },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });


            // DEBUG DETALLADO de la respuesta
            console.log('📨 Response status:', response.status);
            console.log('🔤 Response headers:');
            for (const [key, value] of response.headers.entries()) {    
            console.log(`   ${key}: ${value}`);
            }
            
            const data = await response.json();

            if (!response.ok) {
                errorMessage.textContent = data.error || 'Error en las credenciales. Inténtalo de nuevo.';
                return;
            }

            const userData = await me();
            console.log("Datos del usuario", userData);
                
            // Verifica si la contraseña ha expirado
            if (userData.passwordExpired) {
                localStorage.setItem('user_username', userData.username);
                errorMessage.textContent = 'Su contraseña temporal ha expirado. Será redirigido para cambiarla.';    
                setTimeout(() => {
                    window.location.href = '../cambiarContraseña.html';
                }, 2000); // 2 segundos para mostrar el mensaje
                return;
               }

            // Si la contraseña no ha expirado, guarda los datos y redirige al dashboard
            localStorage.setItem('user_username', userData.username);
            localStorage.setItem('user_rol', userData.rol);
            localStorage.setItem('userId', userData.userId);

            console.log('Login exitoso!');
            console.log('Nombre de usuario:', userData.username);
            console.log('ID del Rol:', userData.rol);
            console.log('ID del usuario:', userData.userId);

            redirectBasedOnRole(userData.rol);

        } catch (error){
            console.log("Error durante el inicio de sesion", error)
            errorMessage.textContent = 'Ocurrrio un error, por favor, intentalo más tarde';
        }
    }

    function redirectBasedOnRole(rol){
        console.log("Redirigiendo segun tu rol:", rol);

        const roleRoutes = {
            'CLIENTE': '../../../dashboard.html',
            'TECNICO': '../../../dashboardTech.html',
            'ADMINISTRADOR': '../Dashboard/dashboard.html'
        };

        const route = roleRoutes[rol] || '../Dashboard/dashboard.html';

        console.log("Redirigiendo a: " , route);
        window.location.href = route;
    }

                

     function checkAuthCookie() {
        const cookies = document.cookie.split(';');
         return cookies.some(cookie => cookie.trim().startsWith('authToken='));
         }

    function initializePasswordToggle(){
        // --- Lógica para mostrar/ocultar la contraseña ---
    const passwordInputHide = document.getElementById("password");
    const eyeIcon = document.querySelector(".eye-icon");

    if (eyeIcon && passwordInputHide) {
        eyeIcon.addEventListener("click", () => {
            const type = passwordInputHide.getAttribute("type") === "password" ? "text" : "password";
            passwordInputHide.setAttribute("type", type);
            eyeIcon.classList.toggle("fa-eye");
            eyeIcon.classList.toggle("fa-eye-slash");
        });
    }
    }


});