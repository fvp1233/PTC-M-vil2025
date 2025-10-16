// js/Login/LoginController/controllerRecuperarContrasena.js

import { enviarSolicitudRecuperacion, verificarCodigo, cambiarContrasena } from '../RecuperarContrasenaService/recuperarContrasenaService.js';
import Swal from 'https://cdn.jsdelivr.net/npm/sweetalert2@11/+esm';

document.addEventListener('DOMContentLoaded', () => {
  // Recuperación de contraseña
  const form = document.getElementById('contrasena-form');
  const emailInput = document.getElementById('email');
  const errorMessage = document.getElementById('error-message');

  const modalElement = document.getElementById('codeModal');
  let modal = null;
  if (modalElement) {
    modal = new bootstrap.Modal(modalElement);
  }

  const btnVerificar = document.getElementById('btn-verificar-codigo');
  const tokenInput = document.getElementById('codigo-verificacion');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.textContent = '';

      const email = emailInput.value.trim();

      if (!validarEmail(email)) {
        errorMessage.textContent = 'Por favor ingresa un correo válido.';
        return;
      }

      try {
        await enviarSolicitudRecuperacion(email);
        sessionStorage.setItem('email', email); // guardar para el siguiente paso
        if (modal) modal.show();
      } catch (error) {
        errorMessage.textContent = 'No se pudo enviar el código. Intenta de nuevo.';
        console.error('Error al solicitar recuperación:', error);
      }
    });
  }

  if (btnVerificar) {
    btnVerificar.addEventListener('click', async () => {
      const email = sessionStorage.getItem('email');
      const token = tokenInput.value.trim();

      if (!email || !token) {
        Swal.fire({
          icon: 'warning',
          title: 'Campos incompletos',
          text: 'Debes ingresar el correo y el código.',
        });
        return;
      }

      try {
        await verificarCodigo(email, token);
        sessionStorage.setItem('token', token); // guardar para el cambio de contraseña
        window.location.href = 'cambiarContrasenaRecuperar.html';
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Código inválido',
          text: 'El código ingresado es incorrecto o ha expirado.',
        });
        console.error('Error al verificar código:', error);
      }
    });
  }

  // Cambio de contraseña
  const passwordForm = document.querySelector('.formChangePassword');
  const newPasswordInput = document.getElementById('NewPassword');
  const confirmPasswordInput = document.getElementById('ConfirmPassword');

  if (passwordForm) {
    const email = sessionStorage.getItem('email');
    const token = sessionStorage.getItem('token');

    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newPassword = newPasswordInput.value.trim();
      const confirmPassword = confirmPasswordInput.value.trim();

      if (newPassword !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'Las contraseñas no coinciden',
          text: 'Por favor verifica que ambas contraseñas sean iguales.',
        });
        return;
      }

      if (!validarPassword(newPassword)) {
        Swal.fire({
          icon: 'warning',
          title: 'Contraseña inválida',
          html: `
            <p>La contraseña debe tener entre 8 y 30 caracteres.</p>
            <p>Debe incluir al menos:</p>
            <ul style="text-align:left;">
              <li>Una letra mayúscula</li>
              <li>Una letra minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial (@#$%^&+=)</li>
            </ul>
          `,
        });
        return;
      }

      try {
        await cambiarContrasena(email, token, newPassword);
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: 'Ahora puedes iniciar sesión con tu nueva contraseña.',
          confirmButtonText: 'Ir al inicio de sesión',
        }).then(() => {
          window.location.href = 'inicioSesion.html';
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al cambiar la contraseña',
          text: error.message || 'Intenta de nuevo más tarde.',
        });
      }
    });

    // Mostrar/ocultar contraseña con ojitos
    const eyeIcons = document.querySelectorAll('.eye-icon');
    eyeIcons.forEach(icon => {
      icon.addEventListener('click', () => {
        const input = icon.closest('label').previousElementSibling;
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        }
      });
    });
  }
});

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarPassword(password) {
  const regex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,30}$/;
  return regex.test(password);
}
