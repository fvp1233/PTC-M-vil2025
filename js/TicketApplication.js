document.addEventListener("DOMContentLoaded", function () {
  // Simulación de una API con múltiples tickets (información principal)
  const ticketsData = {
    "1001": {
      "id": 1001,
      "asuntoGeneral": "No funcionan los filtros en el módulo de reportes",
      "fechaCreacion": "2025-05-01 09:00:00.000000",
      "creadoPor": "Astrid Murgas",
      "prioridadActual": "Baja",
      "categoriaPrincipal": "Software - Filtros",
      "descripcionGeneral": "Los filtros en la sección de generación de reportes no están aplicando correctamente. No se puede filtrar por fecha ni por tipo de transacción. Afecta la extracción de datos diarios.",
      "archivosAdjuntos": [
        "img/anexo_ticket_1001_screenshot1.png"
      ],
      "tecnicoAsignado": "Sin asignar"
    },
    "1002": {
      "id": 1002,
      "asuntoGeneral": "Problema con inicio de sesión en módulo de administración",
      "fechaCreacion": "2025-06-10 14:15:00.000000",
      "creadoPor": "Juan Pérez",
      "prioridadActual": "Alta",
      "categoriaPrincipal": "Acceso - Autenticación",
      "descripcionGeneral": "No puedo acceder al módulo de administración. Ingreso mis credenciales y me devuelve a la pantalla de login sin mostrar ningún error. Otros usuarios con mi rol sí pueden acceder.",
      "archivosAdjuntos": [],
      "tecnicoAsignado": "Ana L."
    },
    "1003": {
      "id": 1003,
      "asuntoGeneral": "Error al generar factura en sistema POS",
      "fechaCreacion": "2025-07-05 10:30:00.000000",
      "creadoPor": "María Gómez",
      "prioridadActual": "Media",
      "categoriaPrincipal": "Sistema POS - Facturación",
      "descripcionGeneral": "Al intentar emitir una factura, el sistema muestra un mensaje de 'Error de conexión con impresora' a pesar de que la impresora está conectada y encendida. No se imprime nada.",
      "archivosAdjuntos": [
        "img/anexo_ticket_1003_error_factura.jpg"
      ],
      "tecnicoAsignado": "Pedro S."
    },
    "1004": {
      "id": 1004,
      "asuntoGeneral": "Solicitud de nueva funcionalidad: Exportar datos a Excel",
      "fechaCreacion": "2025-07-15 16:00:00.000000",
      "creadoPor": "Gerencia",
      "prioridadActual": "Baja",
      "categoriaPrincipal": "Desarrollo - Solicitud",
      "descripcionGeneral": "Necesitamos una opción para exportar los datos de ventas diarias del último mes a un archivo de Excel desde el dashboard principal. Actualmente solo se pueden ver en pantalla.",
      "archivosAdjuntos": [],
      "tecnicoAsignado": "Equipo de Desarrollo"
    }
  };

  /**
   * Calcula el tiempo transcurrido desde una fecha dada hasta hoy (20 de Julio de 2025).
   * @param {string} fechaString - La fecha en formato "YYYY-MM-DD HH:MM:SS".
   * @returns {string} - Una cadena de texto como "Hoy", "Ayer", "Hace X días".
   */
  function calcularTiempoTranscurrido(fechaString) {
    const ahora = new Date("2025-07-20T22:30:00"); // Fecha actual de referencia (20 de Julio de 2025)
    const fechaCambio = new Date(fechaString.split(".")[0]);

    const inicioDeHoy = new Date(ahora);
    inicioDeHoy.setHours(0, 0, 0, 0);
    const inicioDeFechaCambio = new Date(fechaCambio);
    inicioDeFechaCambio.setHours(0, 0, 0, 0);

    const diffTiempo = inicioDeHoy - inicioDeFechaCambio;
    const diffDias = Math.floor(diffTiempo / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return "Hoy";
    if (diffDias === 1) return "Ayer";
    return `Hace ${diffDias} días`;
  }

  // **** CAMBIO APLICADO AQUÍ: Se eliminó el valor por defecto '1001' ****
  const idRecibido = localStorage.getItem("ticketAuditoriaID");
  const ticket = ticketsData[idRecibido];

  const headerContainer = document.getElementById("ticket-container-header");
  const bodyContainer = document.getElementById("ticket-body");
  const mainElement = document.querySelector("main");

  if (!ticket) {
    const noTicketsHTML = `
      <div class="row text-center g-0 noTickets">
          <div class="col">
              <img class="" src="img/gigapixel-image_23-removebg-preview (1).png" alt="No hay Tickets">
              <div class="Ntext">
                  <strong><p>No tienes Tickets</p></strong>
                  <p>Parece que no tienes ningún ticket en proceso.
                  Por favor crea uno para reportar un problema</p>
              </div>
          </div>
      </div>
    `;
    if (mainElement) {
      mainElement.innerHTML = noTicketsHTML;
    }
    if (headerContainer) headerContainer.innerHTML = '';
    if (bodyContainer) bodyContainer.innerHTML = '';
    return;
  }

  // --- Si un ticket es encontrado, el código continúa aquí para renderizar su información ---

  // 1. Render del encabezado
  const headerHTML = `
    <div class="row text-center g-0">
      <div class="col ticket-header">
        <h1 class="ticket-id">#${ticket.id}</h1>
        <p class="ticket-date">Creado el: ${new Date(
          ticket.fechaCreacion
        ).toLocaleDateString()} ${new Date(ticket.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        <p class="ticket-subject">${ticket.asuntoGeneral}</p>
      </div>
    </div>
    <hr class="dashed">
  `;
  headerContainer.innerHTML = headerHTML;

  // 2. Render de la información general y estática del ticket
  const tiempoGenerado = calcularTiempoTranscurrido(ticket.fechaCreacion);

  // Genera el HTML para los archivos adjuntos
  let archivosAdjuntosHTML = '';
  if (ticket.archivosAdjuntos && ticket.archivosAdjuntos.length > 0) {
    archivosAdjuntosHTML = `
      <div class="col ticket-body">
          <p><strong class="Archive">Archivos Adjuntos:</strong></p>
          <div class="row">
            ${ticket.archivosAdjuntos.map(filePath => `
              <div class="col-auto mb-2">
                <img class="img-thumbnail" src="${filePath}" alt="Archivo adjunto" style="max-width: 100px; max-height: 100px;">
              </div>
            `).join('')}
          </div>
      </div>
      <hr class="dashed">
    `;
  }

  const infoGeneralHTML = `
    <div class="row">
        <div class="col ticket-body">
            <p><a>Ticket generado ${tiempoGenerado.toLowerCase()}</a></p>
            <p><strong>Creado por:</strong> ${ticket.creadoPor}</p>
            <p><strong>Prioridad:</strong> ${ticket.prioridadActual}</p>
            <p><strong>Categoría:</strong> ${ticket.categoriaPrincipal}</p>
            <p><strong>Técnico asignado:</strong> ${ticket.tecnicoAsignado}</p>
            <hr class="dashed">
            <p class="mt-3"><strong class="ticket-description-label">Descripción:</strong></p>
            <p class="description-text">${ticket.descripcionGeneral}</p>
        </div>
    </div>
    <hr class="dashed">
    ${archivosAdjuntosHTML}
  `;
  bodyContainer.innerHTML = infoGeneralHTML;

  const finHTML = `
    <p class="end-text" style="text-align:center;">Fin del ticket</p>
    <div style="height: 70px;"></div>
  `;
  bodyContainer.insertAdjacentHTML("beforeend", finHTML);

  const backButton = document.querySelector(".btnBackAuditory");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "ticketsDashboard.html";
    });
  }
});