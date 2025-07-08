document.addEventListener("DOMContentLoaded", function () {


  const fakeTicket = {
    id: "0001",
    fecha: "01/07/2025, 9:00AM",
    subject: "No recibe Internet",
    detalles: [
      {
        generado: "Hace 2 días",
        tecnico: "Carlos Ramírez",
        prioridad: "Alta",
        categoria: "Soporte Técnico"
      },
      {
        generado: "Hace 1 día",
        tecnico: "Andrea López",
        prioridad: "Media",
        categoria: "Infraestructura"
      },
      {
        generado: "Hace 2 días",
        tecnico: "Carlos Ramírez",
        prioridad: "Alta",
        categoria: "Soporte Técnico"
      }
    ]
  };

  const headerContainer = document.getElementById("ticket-container-header");
  const bodyContainer = document.getElementById("ticket-body");

  const headerHTML = `
    <div class="row text-center g-0">
      <div class="col ticket-header">
        <h1 class="ticket-id">#${fakeTicket.id}</h1>
        <p class="ticket-date">${fakeTicket.fecha}</p>
        <p class="ticket-subject">${fakeTicket.subject}</p>
      </div>
    </div>
    <hr class="dashed">
  `;
  headerContainer.insertAdjacentHTML("beforeend", headerHTML);

  
  fakeTicket.detalles.forEach((detalle, index) => {
  const esUltimo = index === fakeTicket.detalles.length - 1;

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

  // Solo agrega <hr> si NO es el último
  if (!esUltimo) {
    detalleHTML += `<hr class="dashed">`;
  } else {
    detalleHTML += `
      <p class="end-text">Fin de los cambios</p>
    `;
  }

  bodyContainer.insertAdjacentHTML("beforeend", detalleHTML);
});
});
