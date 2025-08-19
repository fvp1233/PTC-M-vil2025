const USUARIO_CORRECTO = "ptc2025";
const CONTRASENA_CORRECTA = "1234";

const  USUARIO_CORRECTO2 = "tecnico2025"
const CONTRASENA_CORRECTA2 = "1234"

// --- Referencias a elementos del DOM ---
const loginForm = document.querySelector(".formLogin");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const eyeIcon = document.querySelector(".eye-icon");



//  Manejo del envío del formulario 
loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que la página se recargue

    const usuarioIngresado = usernameInput.value;
    const contrasenaIngresada = passwordInput.value;

    //validación
    if (usuarioIngresado === USUARIO_CORRECTO && contrasenaIngresada === CONTRASENA_CORRECTA) {
        
        console.log("Inicio de sesión exitoso.");

        // Aquí puedes redirigir al usuario
             window.location.href = "dashboard.html";
             
    }else if(usuarioIngresado === USUARIO_CORRECTO2 && contrasenaIngresada === CONTRASENA_CORRECTA2){
        console.log("Inicio de sesión éxitoso.")
        window.location.href = "dashboardTech.html"
    } 
    
    else {
        showGlobalMessage("Usuario o contraseña incorrectos.", 'error');
        console.log("Intento de inicio de sesión fallido.");
    }
});

//  Funcionalidad de mostrar/ocultar contraseña
if (eyeIcon) {
    eyeIcon.addEventListener("click", () => {
        const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
        passwordInput.setAttribute("type", type);
        eyeIcon.classList.toggle("fa-eye");
        eyeIcon.classList.toggle("fa-eye-slash");
    });
}

