// js modalCustom del modal que abre la camara y galeria

document.addEventListener('DOMContentLoaded', function() {
    const openModalBtn = document.getElementById('openCustomModal');
    const customModal = document.getElementById('customModal');
    const closeButton = document.querySelector('.custom-close-button');

    // Función para abrir el modal
    function openModal() {
        customModal.style.display = 'flex'; // Usamos 'flex' para centrado CSS
        document.body.style.overflow = 'hidden'; // Evita el scroll del body
    }

    // Función para cerrar el modal
    function closeModal() {
        customModal.style.display = 'none';
        document.body.style.overflow = ''; // Restaura el scroll del body
    }

    // Event listener para abrir el modal al hacer clic en el icono de subir archivo
    if (openModalBtn) {
        openModalBtn.addEventListener('click', openModal);
    }

    // Event listener para cerrar el modal al hacer clic en la "x"
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Event listener para cerrar el modal al hacer clic fuera del contenido del modal
    if (customModal) {
        customModal.addEventListener('click', function(event) {
            if (event.target === customModal) {
                closeModal();
            }
        });
    }
});