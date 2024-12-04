// document.addEventListener('DOMContentLoaded', function() {
//     // Lógica para manejar el clic en el botón "Siguiente"
//     document.getElementById('nextStep').addEventListener('click', function() {
//         var email = document.getElementById('email').value;

//         // Validar si el campo de correo no está vacío
//         if (!email) {
//             alert('Por favor, ingrese un correo.');
//             return;
//         }

//         // Enviar solicitud AJAX para verificar el correo y enviar el código
//         var xhr = new XMLHttpRequest();
//         xhr.open('POST', '/users/verifyEmail', true); // La ruta para verificar el correo
//         xhr.setRequestHeader('Content-Type', 'application/json');

//         xhr.onreadystatechange = function() {
//             if (xhr.readyState === XMLHttpRequest.DONE) {
//                 if (xhr.status === 200) {
//                     // Si el correo es válido y el correo se envió correctamente
//                     const response = JSON.parse(xhr.responseText);
//                     alert(response.message); // Mostrar mensaje de éxito

//                     // Guardar el código de verificación en una variable temporal (solo por esta sesión)
//                     sessionStorage.setItem('verificationCode', response.code);

//                     // Esconde el campo del correo
//                     document.getElementById('emailDiv').style.display = 'none'; // Ocultar correo
//                     document.getElementById('extraFields').style.display = 'block'; // Mostrar campos adicionales
//                     document.getElementById('nextStep').textContent = 'Confirmar'; // Cambiar texto del botón
//                     document.getElementById('nextStep').setAttribute('type', 'submit'); // Cambiar tipo de botón
//                 } else {
//                     // Si el correo no es válido, mostrar un mensaje de error
//                     alert('Correo no válido. Por favor, intente nuevamente.');
//                 }
//             }
//         };

//         // Enviar el correo en formato JSON
//         xhr.send(JSON.stringify({ email: email }));
//     });
// });
$(document).ready(function() {
    $('#nextStep').click(function() {
        const email = $('#email').val(); 
        if(email){
            $.ajax({
                url: '/verifyEmail',
                method: 'POST',
                data: { email: email },
                success: function(response) {
                    $('#extraFields').removeClass('d-none'); 
                    $('#nextStep').addClass('d-none'); 
    
                    alert('Correo válido. Puedes continuar con la modificación de tus datos.');
    
                },
                error: function(xhr, status, error) {
                    alert(xhr.responseJSON.message); // Mostramos el mensaje de error recibido desde el servidor
                }
            });

        }
    });
    let passwordCheckBool=false;

    $("#password2").on("keyup", () => {
        $("#errorConfirm").remove()
        let password = $("#password").val()
        let confirmPassword = $("#password2").val()
        
        passwordCheckBool = password === confirmPassword
        if(password !== confirmPassword) $("#divpassword2").append(`<p class="text-red" id="errorConfirm">Las contraseñas deben coincidir</p>`)
        else $("#errorConfirm").remove()
            
    if(passwordCheckBool) $('#saveChanges').prop('disabled', false);
    else $('#saveChanges').prop('disabled', true);
    })

    $('#saveChanges').click(function(e) {
        e.preventDefault(); 

            const newPassword = $('#password').val();
            const email = $('#email').val(); 
            
            $.ajax({
                url: '/users/changePassword',
                method: 'POST',
                data: { newPassword, email },
                success: function(response) {
                    alert(response.message); 
                    window.location.replace('/users/login')
                },
                error: function(xhr, status, error) {
                    alert(xhr.responseJSON.message); 
                }
            });
    });
});
