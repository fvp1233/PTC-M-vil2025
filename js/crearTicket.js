document.addEventListener('DOMContentLoaded', function() {
    // Esto hace que todo el código dentro de esta función se ejecute

    //Parte 1: Funcionalidad para subir una imagen 

    // Buscamos el botón que usamos para "subir imagen" por su nombre clave (id).
    const uploadButton = document.getElementById('uploadButton');
    const formFile = document.getElementById('formFile');

    // Si encontramos tanto el botón como el campo de archivo
    if (uploadButton && formFile) {
        // Hacemos que, al hacer clic en el "botón de subir imagen"
        uploadButton.addEventListener('click', function() {
            // se activa el campo invisible para seleccionar un archivo.
            // Esto abre la ventana para que el usuario elija su imagen.
            formFile.click();
        });
    }

    //Parte 2: Funcionalidad para los botones de prioridad ( "Alta", "Media", "Baja") 

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
});