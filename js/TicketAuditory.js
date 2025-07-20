document.addEventListener("DOMContentLoaded", function () {
  // Simulación de una API con múltiples historiales
  const auditoriaData = {
    1001: {
      id: 1001,
      fecha: "01/07/2025, 9:00AM",
      subject: "Error en la base de datos de clientes",
      detalles: [
        {
          generado: "Hace 2 días",
          tecnico: "Carlos Ramírez",
          prioridad: "Alta",
          categoria: "Base de datos"
        },
        {
          generado: "Ayer",
          tecnico: "Andrea López",
          prioridad: "Media",
          categoria: "Backend"
        }
      ]
    },
    1002: {
      id: 1002,
      fecha: "03/07/2025, 11:30AM",
      subject: "Cambio de contraseña",
      detalles: [
        {
          generado: "Hoy",
          tecnico: "Luis Martínez",
          prioridad: "Baja",
          categoria: "Soporte"
        }
      ]
    },
    1003: {
      id: 1003,
      fecha: "04/07/2025, 4:30PM",
      subject: "Actualización del sistema",
      detalles: [
        {
          generado: "Hace 1 día",
          tecnico: "Sofía Torres",
          prioridad: "Baja",
          categoria: "Infraestructura"
        }
      ]
    },
    1004: {
      id: 1004,
      fecha: "05/07/2025, 10:15AM",
      subject: "Inicio de sesión fallido",
      detalles: [
        {
          generado: "Hoy",
          tecnico: "Daniel Pérez",
          prioridad: "Alta",
          categoria: "Seguridad"
        },
        {
          generado: "Hace 5 horas",
          tecnico: "Carla Mejía",
          prioridad: "Alta",
          categoria: "Soporte técnico"
        }
      ]
    }
  };

  // Recuperar el ID guardado
  const idRecibido = localStorage.getItem('ticketAuditoriaID');
  const ticketAuditoria = auditoriaData[idRecibido];

  const headerContainer = document.getElementById("ticket-container-header");
  const bodyContainer = document.getElementById("ticket-body");

  // Si no se encontró historial para ese ID
  if (!ticketAuditoria) {
    headerContainer.innerHTML = `<p style="text-align:center;">No se encontró historial para el ticket #${idRecibido}</p>`;
    return;
  }

  // Render del encabezado
  const headerHTML = `
    <div class="row text-center g-0">
      <div class="col ticket-header">
        <h1 class="ticket-id">#${ticketAuditoria.id}</h1>
        <p class="ticket-date">${ticketAuditoria.fecha}</p>
        <p class="ticket-subject">${ticketAuditoria.subject}</p>
      </div>
    </div>
    <hr class="dashed">
  `;
  headerContainer.insertAdjacentHTML("beforeend", headerHTML);

  // Render del historial de cambios
  ticketAuditoria.detalles.forEach((detalle, index) => {
    const esUltimo = index === ticketAuditoria.detalles.length - 1;

    let detalleHTML = `
      <div class="row">
        <div class="col ticket-body">
          <p>Ticket generado hace: <span>${detalle.generado}</span></p>
          <p>Técnico Asignado: <span>${detalle.tecnico}</span></p>
          <p>Prioridad: <span>${detalle.prioridad}</span></p>
          <p>Categoría: <span>${detalle.categoria}</span></p>
        </div>
      </div>
    `;

    if (!esUltimo) {
      detalleHTML += `<hr class="dashed">`;
    } else {
      detalleHTML += `<p class="end-text">Fin de los cambios</p>`;
    }

    bodyContainer.insertAdjacentHTML("beforeend", detalleHTML);
  });

  // Botón "volver" funcional
  const backButton = document.querySelector('.btnBackAuditory');
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.location.href = 'ticketsDashboard.html';
    });
  }
});
