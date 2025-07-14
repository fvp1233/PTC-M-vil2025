document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica para la selección de botones de prioridad ---
    const priorityButtonsContainer = document.getElementById('prioridad-buttons-container');
    let selectedButton = null; // Variable para almacenar el botón de prioridad seleccionado

    if (priorityButtonsContainer) {
        const priorityButtons = priorityButtonsContainer.querySelectorAll('.btn-prioridad');

        priorityButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Si ya hay un botón seleccionado, removerle la clase 'active'
                if (selectedButton && selectedButton !== this) {
                    selectedButton.classList.remove('active');
                }
                // Añadir la clase 'active' al botón clickeado
                this.classList.add('active');
                // Actualizar la referencia al botón seleccionado
                selectedButton = this;
                
            });
        });
    }

    // --- JS para el modal que abre la cámara y galería ---
    const openModalBtn = document.getElementById('openCustomModal');
    const customModal = document.getElementById('customModal');
    const closeButton = document.querySelector('.custom-close-button');

    function openModal() {
        if (customModal) {
            customModal.style.display = 'flex'; // Usamos 'flex' para centrar el modal
            document.body.style.overflow = 'hidden'; // Evita el scroll del body mientras el modal está abierto
        }
    }

    function closeModal() {
        if (customModal) {
            customModal.style.display = 'none';
            document.body.style.overflow = ''; // Restaura el scroll del body
        }
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', openModal);
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Cierra el modal si se hace clic fuera del contenido o se presiona ESC
    if (customModal) {
        customModal.addEventListener('click', function(event) {
            if (event.target === customModal) {
                closeModal();
            }
        });
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && customModal.style.display === 'flex') {
                closeModal();
            }
        });
    }

    // --- Lógica para el manejo de imágenes y previsualizaciones ---
    const uploadFromGalleryBtn = document.getElementById('uploadFromGalleryBtn');
    const imageUploadInput = document.getElementById('imageUploadInput');
    const takePictureBtn = document.getElementById('takePictureBtn');

    let imagesPreviewContainer = document.getElementById('imagesPreviewContainer');
    if (!imagesPreviewContainer) {
        imagesPreviewContainer = document.createElement('div');
        imagesPreviewContainer.id = 'imagesPreviewContainer';
        const uploadSection = document.getElementById('openCustomModal')?.closest('.mb-5');
        if (uploadSection) {
            uploadSection.after(imagesPreviewContainer);
        } else {
            console.warn("No se encontró la sección para insertar imagesPreviewContainer. Insertando al final del formulario.");
            document.getElementById('ticketForm')?.appendChild(imagesPreviewContainer);
        }
    }

    let selectedFiles = []; // Array para almacenar los objetos File seleccionados

    if (uploadFromGalleryBtn && imageUploadInput) {
        uploadFromGalleryBtn.addEventListener('click', function() {
            imageUploadInput.click();
        });

        imageUploadInput.addEventListener('change', function(event) {
            const files = event.target.files;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (file.type.startsWith('image/')) {
                        selectedFiles.push(file);
                        displayImagePreview(file);
                    } else {
                        console.warn('El archivo no es de tipo imagen, por favor inténtalo de nuevo:', file.name);
                    }
                }
                closeModal();
                imageUploadInput.value = '';
            }
        });
    }

    // Lógica para "Tomar imagen" (placeholder)
    if (takePictureBtn) {
        takePictureBtn.addEventListener('click', function() {
            alert('La funcionalidad para tomar una foto requiere acceso a la cámara y es más compleja de implementar. Considera usar una librería o API específica.');
            closeModal();
        });
    }

    function displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageContainer = document.createElement('div');
            imageContainer.classList.add('image-preview-item', 'd-inline-block', 'm-2', 'position-relative');

            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Previsualización de imagen';
            img.style.maxWidth = '150px';
            img.style.maxHeight = '150px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '5px';

                        const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="fas fa-times"></i>'; // CAMBIO: Usar un icono de FontAwesome para la 'X'
            removeBtn.classList.add('remove-image-btn', 'position-absolute'); // CAMBIO: Clases personalizadas
            removeBtn.style.top = '5px'; // Ajusta la posición
            removeBtn.style.right = '5px'; // Ajusta la posición
            // removeBtn.style.lineHeight = '0.5'; // Estas ya no serán necesarias
            // removeBtn.style.padding = '0.2rem 0.2rem'; // Estas ya no serán necesarias
            // removeBtn.style.borderRadius = '50%'; // Estas ya no serán necesarias
            // removeBtn.style.fontWeight = 'bold'; // Estas ya no serán necesarias
            removeBtn.style.cursor = 'pointer'; // Mantener el cursor de puntero

            removeBtn.addEventListener('click', function() {
                imageContainer.remove();
                selectedFiles = selectedFiles.filter(f => f !== file);
                console.log('Archivos después de eliminar:', selectedFiles);
            });

            imageContainer.appendChild(img);
            imageContainer.appendChild(removeBtn);
            imagesPreviewContainer.appendChild(imageContainer);
        };
        reader.readAsDataURL(file);
    }

    // --- Funciones para mostrar mensajes de éxito/error personalizados ---
    const customNotification = document.getElementById('customNotification');
    // Ya no necesitamos obtener notificationIcon y notificationMessage al inicio,
    // se manejan dinámicamente dentro de showNotification.

    function showNotification(type, message, ticketId = null) {
        if (!customNotification) {
            console.error('El elemento de notificación personalizado no fue encontrado en el DOM.');
            return;
        }

        // Limpiar clases anteriores y el contenido
        customNotification.classList.remove('success', 'error');
        const notificationContent = customNotification.querySelector('.notification-content');
        if (notificationContent) {
            notificationContent.innerHTML = ''; // Limpiar contenido previo
        } else {
            console.error('El elemento .notification-content no fue encontrado dentro de #customNotification.');
            return;
        }


        if (type === 'success') {
            customNotification.classList.add('success');
            // Inyectar la estructura HTML específica para el éxito
            notificationContent.innerHTML = `
                <div class="notification-header">
                    <span class="notification-title">Ticket Alert</span>
                    <i class="fas fa-check-circle notification-header-icon"></i>
                </div>
                 <div class="notification-body">
                    <span class="ticket-id-info">ID: <span id="insertedTicketId">${ticketId || 'N/A'}</span></span>
                    <span class="ticket-message">
                        <span class="first-line-message">Creado correctamente.</span><br>
                        Espera un momento, estamos buscando un técnico para ti.
                    </span>
                </div>
            `;
            // Ya no necesitamos buscar #insertedTicketId aparte si lo inyectamos directamente.
            // Si quieres modificarlo después de la inyección, sí lo necesitarías.

        } else if (type === 'error') {
            customNotification.classList.add('error');
            // Para el error, mantener la estructura simple de icono/texto
            notificationContent.innerHTML = `
                <i class="notification-icon fas fa-exclamation-circle"></i>
                <span class="notification-text">${message}</span>
            `;
        }

        // Mostrar la notificación
        customNotification.classList.remove('d-none');
        setTimeout(() => {
            customNotification.classList.add('show');
        }, 10);

        // Ocultar la notificación después de un tiempo
        const displayTime = 5000; // Tanto éxito como error duran 5 segundos
        setTimeout(() => {
            customNotification.classList.remove('show');
            setTimeout(() => {
                customNotification.classList.add('d-none');
            }, 400); // Coincide con la duración de la transición CSS
        }, displayTime);
    }

    // Adaptar tus llamadas existentes:
    function showSuccessMessage(ticketId) { // Ahora acepta ticketId
        showNotification('success', '', ticketId); // El mensaje ahora es parte del HTML
    }

    function showErrorMessage(message) {
        showNotification('error', message);
    }

    // --- Lógica de Envío del Formulario (con Validaciones y Simulación) ---
    const ticketForm = document.getElementById('ticketForm');

    if (ticketForm) {
        ticketForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Previene el envío tradicional del formulario

            // 1. Recopilar datos de los campos
            const tituloTicket = document.getElementById('tituloTicket').value.trim();
            const categoriaSelect = document.getElementById('categoria');
            const categoria = categoriaSelect.value;
            const descripcion = document.getElementById('descripcion').value.trim();
            const prioridad = selectedButton ? selectedButton.dataset.priority : null;

            // --- INICIO DE LAS VALIDACIONES DE CAMPOS VACÍOS ---
            if (!tituloTicket) {
                showErrorMessage('Por favor, ingresa el título del ticket.');
                return;
            }

            if (categoria === '') {
                showErrorMessage('Por favor, selecciona una categoría.');
                return;
            }

            if (!prioridad) {
                showErrorMessage('Por favor, selecciona una prioridad para el ticket.');
                return;
            }

            if (!descripcion) {
                showErrorMessage('Por favor, ingresa la descripción del ticket.');
                return;
            }
            // --- FIN DE LAS VALIDACIONES ---

            console.log('Todos los campos requeridos están llenos. Procediendo con la simulación/envío.');

            // Preparar FormData para el envío (incluso si es simulación)
            const formData = new FormData();
            formData.append('titulo', tituloTicket);
            formData.append('categoria', categoria);
            formData.append('prioridad', prioridad);
            formData.append('descripcion', descripcion);
            selectedFiles.forEach((file, index) => {
                formData.append(`imagenes[]`, file);
            });

            console.log('Datos del formulario recopilados (para simulación):');
            for (let pair of formData.entries()) {
                console.log(pair[0] + ': ' + pair[1]);
            }

            // --- INICIO DE LA SIMULACIÓN DE ENVÍO (Muestra éxito/error) ---
            const simulationDelay = 1500; // Simula un retraso de 1.5 segundos en la red

            setTimeout(() => {
                if (tituloTicket.toLowerCase() === 'error') {
                    showErrorMessage('Simulación: Hubo un problema al procesar su solicitud en el servidor.');
                    console.error('Simulación: Error forzado por el título "error".');
                } else {
                    // Simular un ID de ticket me genera un numero random de 6 digitos para mostrarlo en la notificacion
                    const simulatedTicketId = Math.floor(Math.random() * 900000) + 100000; // ID de 6 dígitos
                    showSuccessMessage(simulatedTicketId); // Pasa el ID simulado
                    console.log('Simulación: Ticket creado exitosamente con ID:', simulatedTicketId);

                    // Limpiar el formulario y estados después de un envío exitoso
                    ticketForm.reset();
                    document.getElementById('categoria').value = '';

                    selectedFiles = [];
                    if (imagesPreviewContainer) {
                        imagesPreviewContainer.innerHTML = '';
                    }
                    if (selectedButton) {
                        selectedButton.classList.remove('active');
                        selectedButton = null;
                    }
                }
            }, simulationDelay);
            // --- FIN DE LA SIMULACIÓN ---

            // --- CÓDIGO PARA CONEXIÓN REAL CON RETOOL (DESCOMENTAR CUANDO ESTÉS LISTO) ---
            /*
            const retoolApiUrl = 'TU_URL_DE_WORKFLOW_RETOOL_AQUI';

            fetch(retoolApiUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || 'Error desconocido del servidor Retool');
                    }).catch(() => {
                        throw new Error(`Error del servidor Retool: ${response.status} ${response.statusText}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                console.log('Ticket creado exitosamente por Retool:', data);
                if (data.success) {
                    showSuccessMessage(data.ticketId || 'N/A'); // Asumiendo que Retool devuelve el ID en data.ticketId
                } else {
                    showErrorMessage(data.message || 'Error al crear ticket en Retool.');
                }
                ticketForm.reset();
                document.getElementById('categoria').value = '';
                selectedFiles = [];
                if (imagesPreviewContainer) {
                    imagesPreviewContainer.innerHTML = '';
                }
                if (selectedButton) {
                    selectedButton.classList.remove('active');
                    selectedButton = null;
                }
            })
            .catch(error => {
                console.error('Error al enviar el ticket a Retool:', error);
                showErrorMessage('Hubo un error al crear el ticket: ' + error.message);
            });
            */
            // --- FIN CÓDIGO DE CONEXIÓN REAL ---

        });
    }
});