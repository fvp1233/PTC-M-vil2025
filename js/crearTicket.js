  // Primero buscamos el contenedor principal donde están todos los botones de prioridad.
  const priorityButtonsContainer = document.getElementById('prioridad-buttons-container');
 
  //  encontramos ese contenedor
  if (priorityButtonsContainer) {
      // Buscamos todos los botones que tienen la clase 'btn-prioridad' dentro de ese contenedor.
      const priorityButtons = priorityButtonsContainer.querySelectorAll('.btn-prioridad');
      // Creamos una variable para recordar cuál botón está actualmente seleccionado. Al inicio, ninguno.
      let selectedButton = null;

      // Recorremos cada botón de prioridad para añadirle un comportamiento:
      priorityButtons.forEach(button => {
          // Cuando alguien hace clic en uno de estos botones...
          button.addEventListener('click', function() {
              // ...primero revisamos si ya había un botón seleccionado y si es diferente al que se acaba de hacer clic.
              if (selectedButton && selectedButton !== this) {
                  // Si es así, le quitamos el estilo de "activo" al botón que estaba seleccionado antes.
                  selectedButton.classList.remove('active');
              }

              // Luego, al botón que se acaba de hacer clic, le ponemos o quitamos el estilo de "activo".
              // Si estaba activo lo desactiva, y si estaba inactivo lo activa.
              this.classList.toggle('active');

              // Ahora, actualizamos nuestra variable 'selectedButton':
              // Si el botón actual tiene el estilo 'active' (es decir, está seleccionado)...
              if (this.classList.contains('active')) {
                  // ...lo guardamos como el botón seleccionado.
                  selectedButton = this;
              } else {
                  // Si no tiene el estilo 'active' (se deseleccionó), entonces no hay ninguno seleccionado.
                  selectedButton = null;
              }

              // Opcional: Aquí obtenemos el valor de la prioridad seleccionada (si hay una)
              // y lo mostramos en la consola del navegador, lo cual es útil para probar.
              const currentSelectedPriority = selectedButton ? selectedButton.dataset.priority : null;
              console.log('Prioridad seleccionada:', currentSelectedPriority);
              // Aquí podrías, por ejemplo, enviar este valor a otro campo del formulario para guardarlo.
          });
      });
  }
;


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

