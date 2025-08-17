const API_URL = 'http://localhost:8080/api/users/login';

document.addEventListener('DOMContentLoaded', (event) => {
    // Obtén los elementos del DOM
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');

    // Escucha el evento de envío del formulario
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
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
                });

                const data = await response.json();

                if (!response.ok) {
                    errorMessage.textContent = data.error || 'Error en las credenciales. Inténtalo de nuevo.';
                    return;
                }

                // *** CAMBIO CLAVE AQUÍ ***
                // Verifica si la contraseña ha expirado
                if (data.passwordExpired) {
                    // Si ha expirado, guarda el token temporal y redirige
                    localStorage.setItem('jwt_token', data.token);
                    errorMessage.textContent = 'Su contraseña temporal ha expirado. Será redirigido para cambiarla.';
                    setTimeout(() => {
                        window.location.href = '../cambiarContraseña.html';
                    }, 2000); // 2 segundos para mostrar el mensaje
                    return;
                }

                // Si la contraseña no ha expirado, guarda los datos y redirige al dashboard
                localStorage.setItem('jwt_token', data.token);
                localStorage.setItem('user_username', data.username);
                localStorage.setItem('user_rolId', data.rolId);

                console.log('Login exitoso!');
                console.log('Token JWT:', data.token);
                console.log('Nombre de usuario:', data.username);
                console.log('ID del Rol:', data.rolId);

                // Lógica de redirección basada en el rol
                switch (data.rolId) {
                    case 1:
                        window.location.href = '../dashboard.html';
                        break;
                    case 2:
                    case 3:
                        window.location.href = '../dashboardTech.html';
                        break;
                    default:
                        window.location.href = '../dashboard.html';
                }

            } catch (error) {
                console.error('Error durante el login:', error);
                errorMessage.textContent = 'Ocurrió un error. Por favor, intenta más tarde.';
            }
        });
    }

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
});