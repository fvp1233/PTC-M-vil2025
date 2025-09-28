import { getPrioridades, updateTicket } from "../Service/CreateTicketService.js";
import { getTicketById } from "../../Dashboard/dashboardService/ticketService.js";
import { uploadImageToFolder } from "../Service/imageService.js";
// Se ha eliminado la importación de getUserId desde authService.js
// import { getUserId } from "../../authService.js";

document.addEventListener('DOMContentLoaded', () => {
    const ticketForm = document.getElementById('ticketForm');
    const prioridadButtonsContainer = document.getElementById('prioridad-buttons-container');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const imagesPreviewContainer = document.getElementById('imagesPreviewContainer');
    const customNotification = document.getElementById('customNotification');
    const openModalBtn = document.getElementById('openCustomModal');
    const customModal = document.getElementById('customModal');
    const closeButton = document.querySelector('.custom-close-button');
    const uploadFromGalleryBtn = document.getElementById('uploadFromGalleryBtn');
    const takePictureBtn = document.getElementById('takePictureBtn');
    const submitBtn = document.getElementById('submitTicketBtn');
    
    let selectedButton = null;
    let currentTicketId = null;

    // Esta variable global almacenará el objeto completo del ticket existente.
    window.currentTicketData = null; 

    // --- Funciones de Utilidad ---
    function showNotification(type, message, ticketId = null) {
        if (!customNotification) return;

        const content = customNotification.querySelector('.notification-content');
        customNotification.classList.remove('success', 'error', 'd-none', 'show');
        content.innerHTML = '';

        if (type === 'success') {
            customNotification.classList.add('success');
            content.innerHTML = `
                <div class="notification-header">
                    <span class="notification-title">Ticket Alert</span>
                    <i class="fas fa-check-circle notification-header-icon"></i>
                </div>
                <div class="notification-body">
                    <span class="ticket-id-info">ID: <span id="insertedTicketId">${ticketId}</span></span>
                    <span class="ticket-message">
                        <span class="first-line-message">Ticket actualizado correctamente.</span><br>
                        Se han guardado tus cambios.
                    </span>
                </div>
            `;
        } else {
            customNotification.classList.add('error');
            content.innerHTML = `
                <i class="notification-icon fas fa-exclamation-circle"></i>
                <span class="notification-text">${message}</span>
            `;
        }
        setTimeout(() => customNotification.classList.add('show'), 10);
        setTimeout(() => {
            customNotification.classList.remove('show');
            setTimeout(() => customNotification.classList.add('d-none'), 400);
        }, 5000);
    }
    
    // --- Funciones del Modal ---
    function openModal() {
        if (customModal) {
            customModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }
    function closeModal() {
        if (customModal) {
            customModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
    openModalBtn?.addEventListener('click', openModal);
    closeButton?.addEventListener('click', closeModal);
    customModal?.addEventListener('click', e => { if (e.target === customModal) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && customModal?.style.display === 'flex') closeModal(); });

    // --- Lógica de Carga de Datos ---
    async function cargarDatosIniciales() {
        try {
            const prioridades = await getPrioridades();

            if (prioridadButtonsContainer) {
                prioridadButtonsContainer.innerHTML = '';
                prioridades.forEach(p => {
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col d-flex justify-content-center';
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-prioridad mt-2 mb-2';
                    btn.textContent = p.displayName;
                    btn.dataset.priorityId = p.id;
                    colDiv.appendChild(btn);
                    prioridadButtonsContainer.appendChild(colDiv);
                });

                prioridadButtonsContainer.addEventListener('click', (event) => {
                    const button = event.target.closest('button');
                    if (button) {
                        document.querySelectorAll('.btn-prioridad').forEach(btn => btn.classList.remove('active'));
                        button.classList.add('active');
                        selectedButton = button;
                    }
                });
            }

            const urlParams = new URLSearchParams(window.location.search);
            currentTicketId = urlParams.get("id");
            if (currentTicketId) {
                submitBtn.textContent = 'Actualizar Ticket';
                await cargarDatosTicketExistente(currentTicketId);
            }
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            showNotification('error', 'Error al cargar las opciones del formulario.');
        }
    }

    async function cargarDatosTicketExistente(ticketId) {
        try {
            const ticket = await getTicketById(ticketId);
            if (ticket) {
                // Guarda el objeto completo para la actualización posterior
                window.currentTicketData = ticket;
                
                document.getElementById('title').value = ticket.title;
                document.getElementById('description').value = ticket.description;
                
                if (ticket.imageUrl) {
                    displayImagePreview(ticket.imageUrl);
                }

                const priorityButtons = document.querySelectorAll('.btn-prioridad');
                priorityButtons.forEach(btn => {
                    if (parseInt(btn.dataset.priorityId) === ticket.priority.id) {
                        btn.classList.add('active');
                        selectedButton = btn;
                    }
                });
            }
        } catch (error) {
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('No se encontró el token')) {
                showNotification('error', 'Tu sesión ha expirado o no tienes permisos. Redirigiendo al inicio de sesión.');
                setTimeout(() => {
                    window.location.href = 'inicioSesion.html';
                }, 3000); 
            } else {
                console.error('Error al cargar los datos del ticket para actualizar:', error);
                showNotification('error', 'No se pudieron cargar los datos del ticket para actualizar.');
            }
        }
    }

    // --- Manejo de Eventos de Carga de Imagen ---
    uploadFromGalleryBtn?.addEventListener('click', () => {
        imageUploadInput.removeAttribute('capture');
        imageUploadInput.click();
    });
    takePictureBtn?.addEventListener('click', () => {
        imageUploadInput.setAttribute('capture', 'environment');
        imageUploadInput.click();
    });
    imageUploadInput?.addEventListener('change', event => {
        const file = event.target.files[0];
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];

        if(!file || !allowedMimeTypes.includes(file.type)){
            if (imagesPreviewContainer) imagesPreviewContainer.innerHTML = '';
            showNotification('error', 'Por favor, selecciona un archivo de imagen válido.');
            return;
        }

        const localUrl = URL.createObjectURL(file);
        displayImagePreview(localUrl);
        closeModal();
    });

    function displayImagePreview(url) {
        if (imagesPreviewContainer) {
            imagesPreviewContainer.innerHTML = '';
            const container = document.createElement('div');
            container.className = 'image-preview-item d-inline-block mt-1 position-relative';
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Imagen del ticket';
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.className = 'remove-image-btn position-absolute';
            removeBtn.addEventListener('click', () => {
                container.remove();
                if (imageUploadInput) imageUploadInput.value = '';
                URL.revokeObjectURL(url);
            });
            container.appendChild(img);
            container.appendChild(removeBtn);
            imagesPreviewContainer.appendChild(container);
        }
    }

    // --- Evento de Envío del Formulario ---
    ticketForm?.addEventListener('submit', async e => {
        e.preventDefault();

        const title = document.getElementById('title')?.value?.trim();
        const description = document.getElementById('description')?.value?.trim();
        const prioridadId = selectedButton ? selectedButton.dataset.priorityId : null;
        const imageFile = imageUploadInput?.files[0];

        if (!title || !description || !prioridadId) {
            showNotification('error', 'Por favor, completa todos los campos.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Actualizando...';

        try {
            // Se crea una copia completa del ticket existente.
            const ticketData = { ...window.currentTicketData };

            // Se sobrescriben los campos que se actualizan en el formulario.
            ticketData.title = title;
            ticketData.description = description;
            
            // La prioridad se actualiza como un objeto con un 'id'
            ticketData.priority = { id: parseInt(prioridadId), displayName: selectedButton.textContent };
            
            // La imagen se maneja por separado.
            if (imageFile) {
                const uploadedImageUrl = (await uploadImageToFolder(imageFile, 'tickets')).url;
                ticketData.imageUrl = uploadedImageUrl;
            } else {
                 // Si no hay una nueva imagen, nos aseguramos de no perder la existente.
                 ticketData.imageUrl = window.currentTicketData?.imageUrl;
            }

            const result = await updateTicket(currentTicketId, ticketData);
            showNotification('success', 'Ticket actualizado correctamente.', currentTicketId);

            setTimeout(() => {
                window.location.href = `TicketInformation.html?id=${currentTicketId}`;
            }, 2000);

        } catch (err) {
            console.error('Error al actualizar ticket:', err);
            if (err.message.includes('401') || err.message.includes('403') || err.message.includes('No se encontró el token') || err.message.includes('400')) {
                 showNotification('error', 'Ocurrió un error. Por favor, revisa tus permisos o contacta a soporte.');
                 setTimeout(() => {
                     window.location.href = 'inicioSesion.html';
                 }, 3000);
            } else {
                 showNotification('error', 'Ocurrió un error al actualizar el ticket.');
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Actualizar Ticket';
        }
    });
    
    cargarDatosIniciales();
});