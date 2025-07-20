API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Solicitud GET para cargar el contenido
async function CargarDatos() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        CargarContenido(data);
    } catch (error) {
        console.error('Error al cargar el contenido:', error);
    }
}

function CargarContenido(data) {
    const contenidoVista = document.getElementById('contenido');
    contenidoVista.innerHTML = ''; // Limpiar el contenido antes de añadir (útil si CargarContenido se llama varias veces)

    data.forEach(c => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5>${c.title}d</h5>
            <p>${c.description}</p>
            <p class="leer-mas" data-id="${c.id}" data-title="${c.title}" data-description="${c.solutionSteps}">Leer más</p>
            `;
        contenidoVista.appendChild(tarjeta);
    });

    // ¡IMPORTANTE! Llama a la función para adjuntar eventos *después* de que todas las tarjetas han sido añadidas al DOM.
    attachLeerMasEventListeners();
}

// Función separada para adjuntar los event listeners a los botones "Leer más"
function attachLeerMasEventListeners() {
    // Selecciona todos los elementos con la CLASE "leer-mas"
    const btnAbrirModalLeerMasList = document.querySelectorAll(".leer-mas"); // Usa querySelectorAll para clases

    btnAbrirModalLeerMasList.forEach(button => {
        // Asegúrate de que el event listener no se añada múltiples veces si esta función se llama repetidamente
        // Una forma simple es remover el listener antes de añadirlo, o usar un flag/set.
        // Por simplicidad, si CargarContenido vacía y rellena siempre, no es un problema inmediato.
        button.addEventListener("click", (event) => {
            const currentButton = event.target; // El botón "Leer más" que fue clickeado

            // Ejemplo de cómo podrías obtener datos para el modal si los necesitas
            // const articleId = currentButton.dataset.id;
            // const articleTitle = currentButton.dataset.title;
            // const articleDescription = currentButton.dataset.description;

            // Rellenar el modal con el contenido dinámico si es necesario
            // document.querySelector('.modal-titulo h3').textContent = articleTitle;
            // document.querySelector('.modal-info p').textContent = articleDescription;

            modalLeerMas.showModal();
        });
    });
}


window.addEventListener('DOMContentLoaded', CargarDatos);

// Asegúrate de que 'modal' y 'flechaIzquierda' existan en el DOM global,
// o que se seleccionen después de que el DOM esté completamente cargado.
const modalLeerMas = document.getElementById("modal");
const btnCerrarModalLeerMas = document.getElementById("flechaIzquierda");

// Este listener para cerrar se puede añadir directamente ya que el botón de cerrar es único
if (btnCerrarModalLeerMas) {
    btnCerrarModalLeerMas.addEventListener("click", (event) => {
        event.preventDefault();
        modalLeerMas.close();
    });
} else {
    console.error("El botón para cerrar el modal (flechaIzquierda) no se encontró.");
}

// Opcional: Para evitar que el modal se cierre al hacer clic fuera de él (si lo deseas)
// modalLeerMas.addEventListener('click', (e) => {
//     if (e.target === modalLeerMas) {
//         modalLeerMas.close();
//     }
// });