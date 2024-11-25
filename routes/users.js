'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','AW_24');
const bcrypt = require('bcrypt');


const alreadyLoggedIn = (request, response, next) => {
  if (request.session.user === undefined) return next();
  response.redirect('/');
};


/* GET users listing. */
router.get('/', function(request, response, next) {
  response.send('respond with a resource');
});

// REGISTRO
//Renderiza pagina de register
router.get('/register', alreadyLoggedIn ,(request, response) => {
  midao.getFacultades((err,resultado)=> {
    if(err) console.log('Error: ', err)
    else response.render('register', {facultades:resultado});
  })
});


// Maneja el registro
router.post('/register', checkValidity, async (request, response) => {
  const user = request.body;
  console.log(user);

  try {
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(user.contrasenaConf, 10);
    user.contrasena = hashedPassword;
    user.contrasenaConf = hashedPassword;

    // Llama al método para registrar al usuario
    midao.registerUser(user, (err) => {
      if (err) return response.status(400).send('Error');
      
      // Conseguir el ID del usuario recién registrado
      midao.getIdFromEmail(user.email, (err, data) => {
        if (err) return response.status(400).send('Error al obtener ID');
        
        // Establece la sesión para el usuario recién registrado
        request.session.user = {id:data.id};
        
        // Redirige a  home si el registro fue exitoso
        return response.redirect('/');
      });
    });
  } catch (err) {
    console.error('Error durante el registro:', err);
    // Devuelve un estado y un mensaje de error
    return response.status(400).json({ error: 'No se pudo registrar el usuario. Por favor, intenta nuevamente.' });
  }
  
});

//LOGIN
router.get('/login', alreadyLoggedIn, (request, response) => {//Renderiza pagina de login
  response.render('login');
})

// Middelware para el post de login
router.post('/login',function (request, response) {//Inicia sesion
  const { email, password } = request.body;
  
  const hashedPassword = bcrypt.hash(password, 10);

  // Conseguir la contraseña e ID relacionada con el email
  midao.getIdAndPasswordFromUser(email, (err, data) => {
    if (err) return response.status(400).send('Usuario incorrectos');
    if (data.password === hashedPassword){
      request.session.user = data.id;
      return response.status(200);
    }
    return response.status(400).send('Contraseña incorrecta');
  })
});


function checkValidity(request, response, next){
  const user = request.body;
  
  // Aqui hay que mirar que los valores sean correctos
  if (user.contrasena !== user.contrasenaConf)
      return response.status(400).send('Las contraseñas han de coincidir')

  console.log(user.telefono)
  if (!user.telefono.match(/(\+[0-9]?[0-9]?)?[0-9]{9}/))
    return response.status(400).send('Ingrese un número de telefono válido')

  next();
}

module.exports = router;

