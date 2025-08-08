//Javascript del proyecto para que simule una carga y me rediriga al login

document.addEventListener('DOMContentLoaded', (event)=> {
    //5 segundo de carga
    const delay = 5000;

    setTimeout(() => {
        window.location.href = 'inicioSesion.html'
    }, delay);
});