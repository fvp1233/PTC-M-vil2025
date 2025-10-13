import { fetchWithAuth } from "../../Login/AuthService/authService.js";

const IMAGE_API = 'https://ptchelpdesk-a73934db2774.herokuapp.com/api/image';


export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file); // Debe coincidir con @RequestParam("image")

  const res = await fetchWithAuth(`${IMAGE_API}/upload`, {
    method: 'POST',
    body: formData
  });

  return await res;
}


export async function uploadImageToFolder(file, folder) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const res = await fetchWithAuth(`${IMAGE_API}/upload-to-folder`, {
    method: 'POST',
    body: formData
  });

  return await res;
}
