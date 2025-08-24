import { fetchWithAuth } from "../../authService.js";

const API_URL = 'http://localhost:8080/api';

export async function getCategorias() {
  const response = await fetchWithAuth(`${API_URL}/categories`)
  if(!response.ok){
    throw new Error('No se pudieron obtener las categorias');
  }
  return response.json();
}

export async function getPrioridades() {
  const response = await fetchWithAuth(`${API_URL}/priority`)
  if(!response.ok){
    throw new Error('No se pudieron obtener las prioridades');
  }
  return response.json();
}

export async function getTecnicosDisponibles() {
  const response = await fetchWithAuth(`${API_URL}/GetTech`)
  if(!response.ok){
    throw new Error('No se pudieron obtener los tecnicos disponibles');
  }
  return response.json();
}


export async function createTicket(ticketData) {
  const res = await fetchWithAuth(`${API_URL}/PostTicket`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  return res.json();
}

export async function updateTicket(id, ticketData) {
  const res = await fetchWithAuth(`${API_URL}/UpdateTicket/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  return res.text(); // Devuelve el toString del ticket
}