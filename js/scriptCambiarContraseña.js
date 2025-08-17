API_URL ='http://localhost:8080/api/users/change-password';

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const form = document.querySelector('.formChangePassword');
    const newPasswordInput = document.getElementById('NewPassword');
    const confirmPasswordInput = document.getElementById('ConfirmPassword');
    
    // Contenedor para mensajes de éxito/error. Lo creamos dinámicamente.
    const messageContainer = document.createElement('div');
    form.insertBefore(messageContainer, form.querySelector('.btn-enter'));
    messageContainer.classList.add('text-center', 'mt-3');
    
    // --- Lógica para mostrar/ocultar contraseña (TU CÓDIGO INTEGRADO) ---
    document.querySelectorAll('.eye-icon').forEach(icon => {
        icon.addEventListener('click', () => {
            const passwordInput = icon.closest('label').previousElementSibling;
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            icon.classList.toggle("fa-eye");
            icon.classList.toggle("fa-eye-slash");
        });
    });

    // Lógica del formulario para cambiar la contraseña
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

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

        const token = localStorage.getItem('jwt_token');
        if (!token) {
            messageContainer.textContent = 'No se encontró un token. Por favor, inicie sesión de nuevo.';
            messageContainer.classList.add('text-danger');
            messageContainer.classList.remove('text-success');
            setTimeout(() => {
                window.location.href = 'inicioSesion.html';
            }, 3000);
            return;
        }
        
        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                messageContainer.textContent = data.message;
                messageContainer.classList.add('text-success');
                messageContainer.classList.remove('text-danger');
                
                // Borra el token obsoleto y redirige al login
                localStorage.removeItem('jwt_token');
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