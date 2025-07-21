document.addEventListener("DOMContentLoaded", () => {
  const ticketData = [
    {
      id: "1001",
      titulo: "No funcionan los filtros",
      descripcion: "Los filtros del dashboard no responden.",
      tecnico_asignado: "Carlos Mendoza",
      fecha_creacion: "2025-04-10",
      fecha_cierre: "2025-04-12",
      estado: "Pendiente",
      observaciones: "Cliente reportó que no puede ordenar por fecha."
    },
    {
      id: "1002",
      titulo: "Error al subir archivos",
      descripcion: "El sistema lanza un error al subir archivos PDF.",
      tecnico_asignado: "Lucía Hernández",
      fecha_creacion: "2025-05-03",
      fecha_cierre: "2025-05-04",
      estado: "En proceso",
      observaciones: "Se sospecha de incompatibilidad con el navegador."
    },
    {
      id: "1003",
      titulo: "Pantalla congelada",
      descripcion: "La interfaz se congela al cerrar un modal.",
      tecnico_asignado: "Mario Ayala",
      fecha_creacion: "2025-06-15",
      fecha_cierre: "2025-06-16",
      estado: "Completado",
      observaciones: "Fue necesario actualizar librerías JS."
    },
    {
      id: "1004",
      titulo: "Notificaciones no llegan",
      descripcion: "El usuario no recibe notificaciones de cambios.",
      tecnico_asignado: "Sofía López",
      fecha_creacion: "2025-07-01",
      fecha_cierre: "2025-07-03",
      estado: "En espera",
      observaciones: "Correo bloqueado por el firewall del servidor."
    }
  ];

  const urlParams = new URLSearchParams(window.location.search);
  const ticketId = urlParams.get("id");

  const main = document.querySelector("main");

  if (!ticketId || !ticketData.some(t => t.id === ticketId)) {
    // Limpiar todo el contenido de main
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

  const ticket = ticketData.find(t => t.id === ticketId);

  // Fecha en formato abreviado
  const fecha = new Date(ticket.fecha_creacion);
  const dia = fecha.getDate().toString().padStart(2, "0");
  const mes = fecha.toLocaleString("es-ES", { month: "short" });
  const anio = fecha.getFullYear().toString().slice(-2);

  document.querySelector(".date").innerHTML = `<p>${dia},</p><p>${mes},${anio}</p>`;
  document.querySelector(".description p").textContent = ticket.titulo;
  document.querySelector(".id p").textContent = `#${ticket.id}`;

  const dataFields = document.querySelectorAll(".ContentTicket .Data p");
  dataFields[0].textContent = ticket.descripcion;
  dataFields[1].textContent = ticket.tecnico_asignado;
  dataFields[2].textContent = ticket.fecha_creacion;
  dataFields[3].textContent = ticket.fecha_cierre;
  dataFields[4].textContent = ticket.observaciones;

  const statusBanner = document.querySelector(".ticket-status-banner");
  const estado = ticket.estado.toLowerCase().replace(/\s/g, "-"); // ejemplo: "en espera" → "en-espera"

  statusBanner.textContent = ticket.estado;
  statusBanner.className = `ticket-status-banner status-${estado}`;
});
