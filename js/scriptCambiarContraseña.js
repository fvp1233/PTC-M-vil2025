// Archivo: scriptCambiarContraseña.js

const API_URL = 'http://localhost:8080/api/users/change-password';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.formChangePassword');
    const newPasswordInput = document.getElementById('NewPassword');
    const confirmPasswordInput = document.getElementById('ConfirmPassword');
    const messageContainer = document.createElement('div');
    form.insertBefore(messageContainer, form.querySelector('.btn-enter'));
    messageContainer.classList.add('text-center', 'mt-3');
    
    // Lógica para mostrar/ocultar contraseña
    document.querySelectorAll('.eye-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordInput = icon.closest('label').previousElementSibling;
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Obtener el nombre de usuario y token con las claves correctas
        // Las claves 'user_username' y 'jwt_token' deben coincidir
        // con las usadas en tu script de login.
        const username = localStorage.getItem('user_username'); 
        const token = localStorage.getItem('jwt_token');

        // Línea de depuración añadida
        console.log("HOLAAAAAAAAAAAAAAAAAA")
        console.log('Username from localStorage:', username);
        console.log('Token from localStorage:', token);

        // Validaciones del lado del cliente
        if (newPassword !== confirmPassword) {
            messageContainer.textContent = 'Las contraseñas no coinciden.';
            messageContainer.classList.add('text-danger');
            messageContainer.classList.remove('text-success');
            return;
        }

        if (newPassword.length < 8) {
            messageContainer.textContent = 'La nueva contraseña debe tener al menos 8 caracteres.';
            messageContainer.classList.add('text-danger');
            messageContainer.classList.remove('text-success');
            return;
        }

        // VERIFICACIÓN CLAVE: Comprobar si el nombre de usuario y el token existen
        if (!username || !token) {
            console.error('Error: Nombre de usuario o token faltante en localStorage.');
            messageContainer.textContent = 'Faltan credenciales. Por favor, inicie sesión de nuevo.';
            messageContainer.classList.add('text-danger');
            messageContainer.classList.remove('text-success');
            setTimeout(() => {
                window.location.href = 'inicioSesion.html';
            }, 3000);
            return;
        }
        
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: username,
                    newPassword: newPassword,
                    currentPassword: ''
                }),
            });

            const data = await response.json();

            if (response.ok) {
                messageContainer.textContent = 'Contraseña cambiada exitosamente.';
                messageContainer.classList.add('text-success');
                messageContainer.classList.remove('text-danger');
                
                // Borra el token obsoleto y el username del localStorage
                localStorage.removeItem('jwt_token'); 
                localStorage.removeItem('user_username');
                
                setTimeout(() => {
                    window.location.href = 'inicioSesion.html';
                }, 3000); 
            } else {
                messageContainer.textContent = data.error || 'Error al cambiar la contraseña.';
                messageContainer.classList.add('text-danger');
                messageContainer.classList.remove('text-success');
            }
        } catch (error) {
            console.error('Error:', error);
            messageContainer.textContent = 'Ocurrió un error. Por favor, intenta más tarde.';
            messageContainer.classList.add('text-danger');
            messageContainer.classList.remove('text-success');
        }
    });
});
