import { getCategorias, getPrioridades, getTecnicosDisponibles, createTicket } from "../Service/CreateTicketService.js";
import { uploadImageToFolder } from "../Service/imageService.js";
import { getUserId } from "../../Login/AuthService/authService.js";

document.addEventListener('DOMContentLoaded', () => {
    console.log("entramos");
    const ticketForm = document.getElementById('ticketForm');
    const categoriaSelect = document.getElementById('categoryId');
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
                        <span class="first-line-message">Creado correctamente.</span><br>
                        Espera un momento, estamos buscando un técnico para ti.
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
        console.log("entramos a funcion cargarDatosIniciales");
        try {

            const [categorias, prioridades] = await Promise.all([getCategorias(), getPrioridades()]);

            // Llenar el select de categorías
            categoriaSelect.innerHTML = '<option value="">Selecciona la categoría</option>';
            categorias.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.displayName;
                categoriaSelect.appendChild(opt);
            });

            // Generar los botones de prioridad
            if (prioridadButtonsContainer) {
                prioridadButtonsContainer.innerHTML = '';
                prioridades.forEach(p => {
                    const colDiv = document.createElement('div');
                    colDiv.className = 'col d-flex justify-content-center';
                    const btn = document.createElement('button');
                    btn.type = 'button';
                    btn.className = 'btn-prioridad mt-2 mb-2'; // Usamos solo la clase de estilo
                    btn.textContent = p.displayName;
                    btn.dataset.priorityId = p.id;
                    colDiv.appendChild(btn);
                    prioridadButtonsContainer.appendChild(colDiv);
                });

                prioridadButtonsContainer.addEventListener('click', (event) => {
                    const button = event.target.closest('button');
                    if (button) {
                        document.querySelectorAll('.btn-prioridad').forEach(btn => btn.classList.remove('active')); // Corregido: usa 'active'
                        button.classList.add('active'); // Corregido: usa 'active'
                        selectedButton = button;
                    }
                });
            }
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            showNotification('error', 'Error al cargar las opciones del formulario.');
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
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png']

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

    // --- Asignación de Técnico (lógica en el cliente) ---
    async function asignarTecnico(categoriaId) {
        try {
            const tecnicos = await getTecnicosDisponibles();
            const filtrados = tecnicos.filter(t =>t.category && t.category.id === Number(categoriaId));
            if (filtrados.length === 0) return null;
            filtrados.sort((a, b) => a.ticketsAsignados - b.ticketsAsignados);
            const minTickets = filtrados[0].ticketsAsignados;
            const candidatos = filtrados.filter(t => t.ticketsAsignados === minTickets);
            const elegido = candidatos[Math.floor(Math.random() * candidatos.length)];
            return elegido.id;
        } catch (error) {
            console.error('Error al asignar técnico:', error);
            showNotification('error', 'Ocurrió un error al asignar un técnico.');
            return null;
        }
    }

    // --- Evento de Envío del Formulario ---
    ticketForm?.addEventListener('submit', async e => {
        e.preventDefault();

        const title = document.getElementById('title')?.value?.trim();
        const categoriaId = categoriaSelect.value;
        const description = document.getElementById('description')?.value?.trim();
        const prioridadId = selectedButton ? selectedButton.dataset.priorityId : null;
        const imageFile = imageUploadInput?.files[0];
        const userId = getUserId(); 

        if (!title || !categoriaId || !description || !prioridadId ) {
            showNotification('error', 'Por favor, completa todos los campos y selecciona una imagen.');
            return;
        }
        console.log("Campos validados")

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando...';

        try {
            let uploadedImageUrl = null;
            console.log("Comprobando si hay una imagen para subir");
            if(imageFile){
                console.log("Archivo de imagen encontrado, sera subido a cloudinary");
                uploadedImageUrl = (await uploadImageToFolder(imageFile, 'tickets')).url;
                console.log("URL de la imagen obtenida", uploadedImageUrl);
            }
            const tecnicoId = await asignarTecnico(categoriaId);

            if (!tecnicoId) {
                showNotification('error', 'No hay técnicos disponibles en esta categoría.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Crear Ticket';
                return;
            }

            const ticketData = {
                title,
                description,
               // imageUrl: uploadedImageUrl,
                percentage: 0,
                userId: parseInt(userId),
                category: { id: parseInt(categoriaId) },
                priority: { id: parseInt(prioridadId) },
                assignedTech: { id: parseInt(tecnicoId) }
            };

            const result = await createTicket(ticketData, uploadedImageUrl);
            showNotification('success', 'Ticket creado correctamente.', result.ticketId);

            // Limpiar el formulario y el estado del botón
            ticketForm.reset();
            if (selectedButton) {
                selectedButton.classList.remove('active'); // Corregido: usa 'active'
            }
            selectedButton = null;
            imagesPreviewContainer.innerHTML = '';

        } catch (err) {
            console.error('Error al crear ticket:', err);
            showNotification('error', 'Ocurrió un error al crear el ticket.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Crear Ticket';
        }
    });
    
    // Iniciar la carga de datos iniciales al cargar la página
    cargarDatosIniciales();
});