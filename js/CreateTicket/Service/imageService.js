import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const IMAGE_API = 'http://localhost:8080/api/image';


export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file); // Debe coincidir con @RequestParam("image")

  const res = await fetchWithAuth(`${IMAGE_API}/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Error al subir imagen');
  return await res.json();
}


export async function uploadImageToFolder(file, folder) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetchWithAuth(`${IMAGE_API}/upload-to-folder`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) throw new Error('Error al subir imagen a carpeta');
  return await res.json();
}
