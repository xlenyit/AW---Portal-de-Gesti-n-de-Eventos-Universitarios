//VALIDAR CONFIRMACION CONTRASEÑA
let passwordCheckBool=false;

$("#confirmPassword").on("keyup", () => {
    $("#errorConfirm").remove()
    let password = $("#password").val()
    let confirmPassword = $("#confirmPassword").val()
    
    passwordCheckBool = password === confirmPassword
    if(password !== confirmPassword) $("#confirmContainer").append(`<p class="text-red" id="errorConfirm">Las contraseñas deben coincidir</p>`)
    else $("#errorConfirm").remove()
        
})

//VALIDAR QUE HA SELECCIONADO UNA FACULTAD
let facultadReady=false
$("#facultad").on("input", () => {
    facultadReady = true;
})


//HABILITAR EL BOTON DE REGISTRO SOLO CUANDO ESTE BIEN RELLENO EL FORM
$('#regUserForm input, #regUserForm select').on('click', function() {
    // if(nombreBool && passwordBool && passwordCheckBool && emailBool && surname1 && surname2 && facultadReady && gradoReady && cursoReady) $('#register').prop('disabled', false);
    if(passwordCheckBool && facultadReady) $('#register').prop('disabled', false);
    else $('#register').prop('disabled', true);
});