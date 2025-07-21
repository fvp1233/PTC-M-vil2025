API_URL = "https://687435d9dd06792b9c935e6c.mockapi.io/Daniela/tbSolution";

// Variables globales para los elementos del modal y menú
const modal = document.getElementById("modal");
const btnCerrar = document.getElementById("flechaIzquierda");
const menu = document.querySelector(".menu");

// Elementos dentro del modal que vamos a rellenar dinámicamente
const modalTitle = modal.querySelector('.modal-content .modal-titulo h3'); // Selecciona el h3 dentro del modal
const modalAuthor = modal.querySelector('.modal-content .modal-datos p:first-child'); // El primer p en modal-datos (autor)
const modalDate = modal.querySelector('.modal-content .modal-datos p:last-child'); // El segundo p en modal-datos (fecha)
const modalInfo = modal.querySelector('.modal-content .modal-info p'); // El párrafo con la información completa


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
    contenidoVista.innerHTML = ''; // Limpiar el contenido antes de añadir

    data.forEach(c => {
        // Formatear la fecha para que se vea bien en el modal
        const rawDate = new Date(c.updateDate); // Crea un objeto Date
        // Formato DD/MM/YYYY
        const formattedDate = `${rawDate.getDate().toString().padStart(2, '0')}/${(rawDate.getMonth() + 1).toString().padStart(2, '0')}/${rawDate.getFullYear()}`;


        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta';
        tarjeta.innerHTML = `
            <h5>${c.title}</h5>
            <p>${c.description}</p>
            <p class="leer-mas"
               data-id="${c.solutionId}"
               data-title="${c.title}"
               data-description="${c.description}"
               data-full-solution="${c.solutionSteps}"
               data-author="${c.userId}"  data-date="${formattedDate}">Leer más</p>
        `;
        contenidoVista.appendChild(tarjeta);
    });

    attachLeerMasEventListeners();
}

function attachLeerMasEventListeners() {
    const btnAbrirModalLeerMasList = document.querySelectorAll(".leer-mas");

    btnAbrirModalLeerMasList.forEach(button => {
        button.addEventListener("click", (event) => {
            const currentButton = event.target; // El botón "Leer más" que fue clickeado

            // Obtener los datos de los data-attributes
            const articleTitle = currentButton.dataset.title;
            const articleFullSolution = currentButton.dataset.fullSolution;
            const articleAuthor = currentButton.dataset.author;
            const articleDate = currentButton.dataset.date;

            // Rellenar el contenido del modal con los datos obtenidos
            if (modalTitle) modalTitle.textContent = articleTitle;
            if (modalInfo) modalInfo.innerHTML = articleFullSolution; // Usar innerHTML si solutionSteps tiene tags HTML

            // Rellenar los datos de autor y fecha
            if (modalAuthor) modalAuthor.textContent = `Redactado por: ${articleAuthor}`;
            if (modalDate) modalDate.textContent = `Fecha: ${articleDate}`;


            // Mostrar el modal
            modal.classList.remove("oculto");
        });
    });
}

// Listener para el botón de cerrar modal (flechaIzquierda)
if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
        modal.classList.add("oculto");
    });
} else {
    console.error("El botón para cerrar el modal (flechaIzquierda) no se encontró.");
}

window.addEventListener('DOMContentLoaded', CargarDatos);

//Agregar un nuevo registro
const modalAgregar = document.getElementById("modal-agregar"); //Cuadro de diálogo
const btnAgregar = document.getElementById("add"); //+ para abrir
const btnCerrarAgregar = document.getElementById("cerrar-agregar") //X para cerrar

btnAgregar.addEventListener("click", () => {
    modalAgregar.classList.remove("oculto");
});

btnCerrarAgregar.addEventListener("click", () => {
    modalAgregar.classList.add("oculto");
});

//Agregar nueva solucion
document.getElementById("frmAgregar").addEventListener("submit", async e => {
    e.preventDefault(); //e representa a "submit" - Evita que el formulario se envíe
    //Capturar los valores del formulario
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const solucion = document.getElementById("solucion").value.trim();
    const date = new Date().toISOString();

    //Validación básica
    if (!titulo || !descripcion || !solucion) {
        alert("Complete todos los campos");
        return; //Evitar que el formulario se envíe
    }

    const dataToSend = {
        title: titulo,           // Coincide con 'title' en MockAPI
        description: descripcion, // Coincide con 'description' en MockAPI
        solutionSteps: solucion,
        updateDate: date,  // Coincide con 'solutionSteps' en MockAPI
        // Ahora vamos a añadir la fecha y el userId aquí también
    };


    //Llamar a la API para enviar el usuario
    const respuesta = await fetch(API_URL, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }, //Indicar a la API que el contenido que recibe es un JSON
        body: JSON.stringify(dataToSend)
    });

    if (respuesta.ok) {
        Swal.fire({
            position: "center",
            icon: "success",
            text: "La solución fue agregada correctamente",
            showConfirmButton: false,
            timer: 1800,
            width: "90%",
        });

        //Limpiar el formulario y cerrar el nodal
        document.getElementById("frmAgregar").reset();
        modalAgregar.classList.add("oculto");

        //Recargar la tabla
        CargarDatos();
    } else {
        alert("Hubo un error al agregar");
    }
});