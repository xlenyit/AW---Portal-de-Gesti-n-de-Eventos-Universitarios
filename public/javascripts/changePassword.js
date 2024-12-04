document.addEventListener('DOMContentLoaded', function() {
    // Lógica para manejar el clic en el botón "Siguiente"
    document.getElementById('nextStep').addEventListener('click', function() {
        var email = document.getElementById('email').value;

        // Validar si el campo de correo no está vacío
        if (!email) {
            alert('Por favor, ingrese un correo.');
            return;
        }

        // Enviar solicitud AJAX para verificar el correo y enviar el código
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/users/verifyEmail', true); // La ruta para verificar el correo
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    // Si el correo es válido y el correo se envió correctamente
                    const response = JSON.parse(xhr.responseText);
                    alert(response.message); // Mostrar mensaje de éxito

                    // Guardar el código de verificación en una variable temporal (solo por esta sesión)
                    sessionStorage.setItem('verificationCode', response.code);

                    // Esconde el campo del correo
                    document.getElementById('emailDiv').style.display = 'none'; // Ocultar correo
                    document.getElementById('extraFields').style.display = 'block'; // Mostrar campos adicionales
                    document.getElementById('nextStep').textContent = 'Confirmar'; // Cambiar texto del botón
                    document.getElementById('nextStep').setAttribute('type', 'submit'); // Cambiar tipo de botón
                } else {
                    // Si el correo no es válido, mostrar un mensaje de error
                    alert('Correo no válido. Por favor, intente nuevamente.');
                }
            }
        };

        // Enviar el correo en formato JSON
        xhr.send(JSON.stringify({ email: email }));
    });
});
