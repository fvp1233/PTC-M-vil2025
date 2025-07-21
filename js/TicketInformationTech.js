document.addEventListener("DOMContentLoaded", () => {
  const ticketInformationData = {
    "1001": {
      "id": "1001",
      "tituloPrincipal": "No funcionan los filtros",
      "descripcionGeneral": "Los filtros en la sección de generación de reportes no están aplicando correctamente. No se puede filtrar por fecha ni por tipo de transacción. Afecta la extracción de datos diarios.",
      "creadoPor": "Fernando Velásquez",
      "categoria": "Software - Filtros",
      "fechaCreacion": "2025-04-01 10:00:00.000000",
      "pasosResolucionDefault": "Se revisaron las configuraciones del sistema y se aplicó un parche.",
      "estado": "Pendiente" // Campo de estado para el banner
    },
    "1002": {
      "id": "1002",
      "tituloPrincipal": "Error al subir archivos",
      "descripcionGeneral": "El sistema lanza un error al subir archivos PDF, impidiendo la documentación de procesos.",
      "creadoPor": "Lucía Hernández",
      "categoria": "Archivos - Carga",
      "fechaCreacion": "2025-05-03 09:00:00.000000",
      "pasosResolucionDefault": "Se verificó la compatibilidad del navegador y se actualizó el componente de carga de archivos.",
      "estado": "En proceso"
    },
    "1003": {
      "id": "1003",
      "tituloPrincipal": "Pantalla congelada al cerrar modal",
      "descripcionGeneral": "La interfaz de usuario se congela completamente al intentar cerrar un modal de confirmación de registro.",
      "creadoPor": "Mario Ayala",
      "categoria": "Frontend - UI",
      "fechaCreacion": "2025-06-15 11:00:00.000000",
      "pasosResolucionDefault": "Se identificó un conflicto en las librerías JS; se actualizó jQuery.",
      "estado": "Completado"
    },
    "1004": {
      "id": "1004",
      "tituloPrincipal": "Notificaciones por correo no llegan",
      "descripcionGeneral": "El usuario principal no recibe notificaciones por correo electrónico sobre cambios de estado en los tickets asignados.",
      "creadoPor": "Sofía López",
      "categoria": "Comunicaciones - Backend",
      "fechaCreacion": "2025-07-01 14:00:00.000000",
      "pasosResolucionDefault": "Se ajustaron las reglas del firewall del servidor de correo.",
      "estado": "En espera"
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  let ticketId = urlParams.get("id");

  // Si no hay ticketId en la URL, o el ID no es válido en ticketInformationData,
  // establece '1001' como el ID por defecto.
  if (!ticketId || !ticketInformationData.hasOwnProperty(ticketId)) {
    ticketId = "1001";
  }

  const main = document.querySelector("main");
  // Asegúrate de acceder al ticket correctamente usando el ID como clave
  const ticket = ticketInformationData.hasOwnProperty(ticketId) ? ticketInformationData[ticketId] : null;

  // Si el ticket no se encontró (incluso el ID por defecto), muestra el mensaje
  if (!ticket) {
    main.innerHTML = `
      <div class="row text-center g-0 noTickets">
        <div class="col">
          <img src="img/gigapixel-image_23-removebg-preview (1).png" alt="No se encontró la información del ticket">
          <div class="Ntext">
            <strong><p>No se encontró la información del Ticket</p></strong>
            <p>Parece que la información del ticket se ha perdido, estamos trabajando para solucionarlo</p>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // --- Mapeo de elementos del DOM ---
  const ticketDayElement = document.getElementById("ticket-day");
  const ticketMonthYearElement = document.getElementById("ticket-month-year");
  const ticketTitleElement = document.getElementById("ticket-title"); // Título grande del encabezado
  const ticketIdElement = document.getElementById("ticket-id");
  const ticketStatusElement = document.getElementById("ticket-status"); // El banner de estado

  // Elementos específicos para el contenido de la segunda card
  const descriptionTextElement = document.getElementById("ticket-description"); // Texto de la descripción
  // Verificación de los IDs de creado por y categoria - asegurate que existan en el HTML
  const creadoPorTextElement = document.getElementById("ticket-creado-por"); // ID añadido previamente en HTML
  const categoriaTextElement = document.getElementById("ticket-categoria");   // ID añadido previamente en HTML

  const fechaCreacionTextElement = document.getElementById("ticket-created");
  const fechaResolucionTextElement = document.getElementById("ticket-closed"); // Corregido: esta es la variable correcta
  const pasosResolucionInputElement = document.getElementById("ticket-observations"); // Es un input


  // --- Llenar los datos en el HTML ---

  // Card superior: Fecha, Título, ID, Estado
  const fechaCreacionDate = new Date(ticket.fechaCreacion);
  const day = fechaCreacionDate.getDate().toString().padStart(2, "0");
  const month = fechaCreacionDate.toLocaleString("es-ES", { month: "short" });
  const yearShort = fechaCreacionDate.getFullYear().toString().slice(-2); // Año corto (ej. 25)
  const hourMinute = fechaCreacionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (ticketDayElement) ticketDayElement.textContent = day;
  if (ticketMonthYearElement) ticketMonthYearElement.textContent = `${month},${yearShort}`;
  
  if (ticketTitleElement) ticketTitleElement.textContent = ticket.tituloPrincipal;
  if (ticketIdElement) ticketIdElement.textContent = `#${ticket.id}`;
  
  // --- Manejo del Banner de Estado ---
  if (ticketStatusElement && ticket.estado) {
    const estadoClase = ticket.estado.toLowerCase().replace(/\s/g, "-"); // Convierte "En proceso" a "en-proceso"
    ticketStatusElement.className = `ticket-status-banner status-${estadoClase}`; // Asigna la clase CSS
    ticketStatusElement.textContent = ticket.estado; // Asigna el texto del estado
  }

  // Card de información detallada (la segunda card)
  if (descriptionTextElement) descriptionTextElement.textContent = ticket.descripcionGeneral;
  // Solo asigna si el elemento existe (para evitar errores si no se añadió en el HTML)
  if (creadoPorTextElement) creadoPorTextElement.textContent = ticket.creadoPor;
  if (categoriaTextElement) categoriaTextElement.textContent = ticket.categoria;
  
  // Formatear la fecha de creación para la segunda card (formato: 01,Abr,2025 , 10:00 AM)
  const fullYear = fechaCreacionDate.getFullYear();
  if (fechaCreacionTextElement) fechaCreacionTextElement.textContent = `${day},${month},${fullYear} , ${hourMinute}`;

  // Fecha de resolución: toma la fecha actual del sistema (en El Salvador)
  const fechaResolucionDate = new Date(); 
  const resDay = fechaResolucionDate.getDate().toString().padStart(2, "0");
  const resMonth = fechaResolucionDate.toLocaleString("es-ES", { month: "short" });
  const resYear = fechaResolucionDate.getFullYear();

  // CORRECCIÓN AQUÍ: Usar la variable correcta `fechaResolucionTextElement`
  if (fechaResolucionTextElement) fechaResolucionTextElement.textContent = `${resDay},${resMonth},${resYear}`;

  // Pasos de resolución (input con placeholder y sin borde visible)
  // Este ya debería funcionar con el ID y tipo de elemento correctos
  if (pasosResolucionInputElement) {
    pasosResolucionInputElement.placeholder = "Escribe aquí los pasos de resolución...";
    pasosResolucionInputElement.value = ticket.pasosResolucionDefault || ''; // Usa el valor del JSON o cadena vacía
  }
});