document.addEventListener("DOMContentLoaded", function () {
  // Simulación de una API con múltiples historiales
  const auditoriaData = {
    1001: {
      id: 1001,
      asuntoGeneral: "Error en Base de Datos de Clientes", // Asunto general para el encabezado
      fechaCreacion: "2025-07-18 09:00:00.000000", // Creado hace 2 días desde el 20/Jul
      tecnicoAsignado: "Carlos Ramírez",
      prioridadActual: "Alta",
      categoriaPrincipal: "Base de datos",
      historialCambios: [
        {
          ultimaActualizacion: "2025-07-18 09:00:00.000000",
          asunto: "Ticket Generado",
          descripcion: "Ticket creado por error en la base de datos de clientes.",
          cambioRealizado: "Creación de ticket inicial.",
          tecnicoCambio: "Sistema",
        },
        {
          ultimaActualizacion: "2025-07-19 14:15:00.000000",
          asunto: "Reasignación y Ajuste de Prioridad",
          descripcion: "El ticket requiere revisión de componente de backend. Reasignado.",
          cambioRealizado:
            "Reasignación a Andrea López, prioridad a Media, categoría a Backend.",
          tecnicoCambio: "Andrea López",
        },
      ],
    },
    1002: {
      id: 1002,
      asuntoGeneral: "Solicitud de Cambio de Contraseña",
      fechaCreacion: "2025-07-03 11:30:00.000000",
      tecnicoAsignado: "Luis Martínez",
      prioridadActual: "Baja",
      categoriaPrincipal: "Soporte",
      historialCambios: [
        {
          ultimaActualizacion: "2025-07-03 11:30:00.000000",
          asunto: "Solicitud de Cambio de Contraseña",
          descripcion: "El usuario solicitó un restablecimiento de contraseña.",
          cambioRealizado: "Creación de ticket por solicitud de usuario.",
          tecnicoCambio: "Sistema",
        },
        {
          ultimaActualizacion: "2025-07-20 09:45:00.000000",
          asunto: "Procesamiento de Solicitud",
          descripcion:
            "Se envió el enlace de restablecimiento de contraseña al correo del usuario.",
          cambioRealizado: "Procesamiento y confirmación por Luis Martínez.",
          tecnicoCambio: "Luis Martínez",
        },
      ],
    },
    
  };

  /**
   * Calcula el tiempo transcurrido desde una fecha dada hasta hoy (20 de Julio de 2025).
   * @param {string} fechaString - La fecha en formato "YYYY-MM-DD HH:MM:SS".
   * @returns {string} - Una cadena de texto como "Hoy", "Ayer", "Hace X días".
   */
  function calcularTiempoTranscurrido(fechaString) {
    const ahora = new Date("2025-07-20T22:30:00"); // Fecha actual de referencia
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

  // **** CAMBIO APLICADO AQUÍ: idRecibido ahora solo toma el valor de localStorage ****
  const idRecibido = localStorage.getItem("ticketAuditoriaID");
  const ticketAuditoria = auditoriaData[idRecibido];

  const headerContainer = document.getElementById("ticket-container-header");
  const bodyContainer = document.getElementById("ticket-body");
  const mainElement = document.querySelector("main"); // Seleccionamos el elemento <main>

  if (!ticketAuditoria) {
    // Si no se encuentra el historial del ticket (idRecibido es null o no existe en auditoriaData),
    // se muestra el bloque HTML de "No hay Tickets" dentro del elemento <main>.
    const noTicketsHTML = `
      <div class="row text-center g-0 noTickets">
          <div class="col">
              <img class="" src="img/gigapixel-image_23-removebg-preview (1).png" alt="No hay Tickets">
              <div class="Ntext">
                  <strong><p>No se encontro el historial</p></strong>
                  <p>Parece que no se encontro el historial del ticket.
                  Estamos trabajando para solucionarlo</p>
              </div>
          </div>
      </div>
    `;
    if (mainElement) {
      mainElement.innerHTML = noTicketsHTML;
    }
    // Limpiamos los contenedores de encabezado y cuerpo del ticket para asegurar que no haya contenido previo.
    if (headerContainer) headerContainer.innerHTML = '';
    if (bodyContainer) bodyContainer.innerHTML = '';
    return; // Salimos de la función para evitar que el código de renderizado del ticket se ejecute.
  }

  // --- Si un ticket es encontrado, el código continúa aquí para renderizar su información ---

  // 1. Render del encabezado con el asunto general del ticket
  const headerHTML = `
    <div class="row text-center g-0">
      <div class="col ticket-header">
        <h1 class="ticket-id">#${ticketAuditoria.id}</h1>
        <p class="ticket-date">Creado el: ${new Date(
          ticketAuditoria.fechaCreacion
        ).toLocaleDateString()}</p>
        <p class="ticket-subject">${ticketAuditoria.asuntoGeneral}</p>
      </div>
    </div>
    <hr class="dashed">
  `;
  headerContainer.innerHTML = headerHTML;

  // 2. Render de la información general y estática del ticket
  const tiempoGenerado = calcularTiempoTranscurrido(ticketAuditoria.fechaCreacion);
  const infoGeneralHTML = `
    <div class="row">
        <div class="col ticket-body">
            <p><a>Ticket generado ${tiempoGenerado.toLowerCase()}</a></p>
            <p><strong>Técnico asignado:</strong> ${
              ticketAuditoria.tecnicoAsignado
            }</p>
            <p><strong>Prioridad:</strong> ${
              ticketAuditoria.prioridadActual
            }</p>
            <p><strong>Categoría:</strong> ${
              ticketAuditoria.categoriaPrincipal
            }</p>
        </div>
    </div>
    <hr class="dashed">
  `;
  bodyContainer.innerHTML = infoGeneralHTML;

  // 3. Render del historial de cambios (iterando sobre cada cambio en el historial)
  ticketAuditoria.historialCambios.forEach((cambio) => {
    const tiempoTranscurrido = calcularTiempoTranscurrido(cambio.ultimaActualizacion);

    let historialHTML = `
      <div class="row">
        <div class="col ticket-body">
          <p><strong>Última Actualización:</strong> ${tiempoTranscurrido}, ${cambio.tecnicoCambio}</p>
          <p><strong>Asunto:</strong> ${cambio.asunto}</p>
          <p><strong>Descripción:</strong> ${cambio.descripcion}</p>
          <p><strong>Cambio Realizado:</strong> ${cambio.cambioRealizado}</p>
        </div>
      </div>
      <hr class="dashed">
    `;
    bodyContainer.insertAdjacentHTML("beforeend", historialHTML);
  });

  const finHTML = `
    <p class="end-text" style="text-align:center;">Fin de los cambios</p>
    <div style="height: 70px;"></div>
  `;
  bodyContainer.insertAdjacentHTML("beforeend", finHTML);

  // Manejador de evento para el botón de regresar
  const backButton = document.querySelector(".btnBackAuditory");
  if (backButton) {
    backButton.addEventListener("click", () => {
      window.location.href = "ticketsDashboard.html";
    });
  }
});