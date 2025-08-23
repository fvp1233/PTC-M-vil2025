const API_URL = 'http://localhost:8080/api/users/register'; 

//Función asíncrona que se encarga de enviar los datos del usuario al backend.

const registerUser = async (userData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        // condición que verifica si la respuesta de la API fue exitosa 
        if (!response.ok) {
            // Lee el cuerpo de la respuesta como texto plano, ya que los errores del servidor a menudo no son JSON válidos porque la api retorna el error en texto.
            const errorText = await response.text(); 
            console.error('Error del servidor (texto):', errorText);
            throw new Error(errorText || 'Error desconocido en el registro.');
        }

        // Si la respuesta es exitosa, se espera que el servidor envíe un JSON.
        const data = await response.json(); 
        console.log('Registro exitoso:', data);
        // Devuelve los datos para que puedan ser usados por la función que llamó a 'registerUser'.
        return data;
    // Si hay un error de red o la función lanza un 'throw', la ejecución salta a este bloque.
    } catch (error) {
        console.error('Hubo un problema con la petición:', error);
        // Vuelve a lanzar el error para que la función que llamó a 'registerUser' también pueda manejarlo.
        throw error;
    }
};

// Selecciona el formulario HTML con la clase 'frmLogin' y lo almacena en una variable.
const registrationForm = document.querySelector('.frmLogin');

// Añade un "oyente" para el evento 'submit' (envío del formulario).
// Cuando el usuario hace clic en el botón de "Registrarse", esta función asíncrona se ejecuta.
registrationForm.addEventListener('submit', async (e) => {
    // 'e.preventDefault()' evita que el formulario se envíe de la forma tradicional, lo que prevendría la recarga de la página.
    e.preventDefault();

    // Captura los valores de los campos de entrada del formulario usando sus atributos 'name'.
    const name = registrationForm.querySelector('input[name="full-name"]').value;
    const username = registrationForm.querySelector('input[name="usuario"]').value;
    const email = registrationForm.querySelector('input[name="email"]').value;
    const phone = registrationForm.querySelector('input[name="user-phone"]').value;

    // Crea un objeto JavaScript con los datos del usuario, listo para ser enviado a la API.
    // 'password', 'isActive', 'rol', 'companyId', y 'category' son valores fijos.
    const userData = {
        name: name,
        username: username,
        email: email,
        phone: phone,
        password: "UnaContrasenaQueCumplaConElReglamento1!",
        isActive: 1, 
        rol: { rolId: 1 }, 
        companyId: 1, 
        category: null
    };

    // Usa un bloque 'try...catch' para manejar el resultado de la función 'registerUser'.
    try {
        // Llama a la función 'registerUser' y espera a que se complete.
        await registerUser(userData);

        // Si la llamada fue exitosa (no lanzó un error), muestra una alerta de éxito con SweetAlert.
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: 'Tu contraseña temporal ha sido enviada a tu correo electrónico.',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            // Después de que el usuario acepta la alerta, limpia todos los campos del formulario.
            registrationForm.reset();
        });
    // Si la función 'registerUser' lanzó un error, este bloque lo captura.
    } catch (error) {
        // Muestra una alerta de error con SweetAlert, usando el mensaje de error que vino de la API.
        Swal.fire({
            icon: 'error',
            title: 'Error en el Registro',
            text: error.message,
            confirmButtonText: 'Aceptar'
        });
    }
});