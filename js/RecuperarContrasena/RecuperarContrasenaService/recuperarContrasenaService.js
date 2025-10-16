// js/Login/LoginService/serviceRecuperarContrasena.js

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

export async function enviarSolicitudRecuperacion(email) {
  try {
    const response = await fetch(`${API_URL}/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text(); // mensaje del backend
  } catch (error) {
    throw error;
  }
}

export async function verificarCodigo(email, token) {
  try {
    const response = await fetch(`${API_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text(); // "Código válido"
  } catch (error) {
    throw error;
  }
}

export async function cambiarContrasena(email, token, newPassword) {
  try {
    const response = await fetch(`${API_URL}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token, newPassword })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    return await response.text(); // "Contraseña actualizada."
  } catch (error) {
    throw error;
  }
}