import { fetchWithAuth } from "../../Login/AuthService/authService";

const API_URL = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api';

export const getUserById = async (userId) => {
    try {
        const response = await fetchWithAuth(`${API_URL}/GetUserById/${userId}`);
        if (!response.ok) {
            throw new Error(`Error al obtener usuario: ${response.statusText}`);
        }
        const user = await response.json();
        return user;
    } catch (error) {
        console.error('Error en la llamada a la API:', error);
        throw error;
    }
};