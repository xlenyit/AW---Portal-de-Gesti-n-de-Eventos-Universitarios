'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');
const bcrypt = require('bcrypt');

const passLocals = (req, res, next) => {
  res.locals.user = req.session.user;
  next();
};
router.use(passLocals)

const alreadyLoggedIn = (request, response, next) => {
  if (request.session.user === undefined) return next();
  response.redirect('/');
};

const isLoggedIn = (req, res, next) => {
  if (res.locals.user) return next();
  res.redirect('/users/login');
};

/* GET users listing. */
router.get('/', function(request, response, next) {
  response.send('respond with a resource');
});

// REGISTRO
//Renderiza pagina de register
router.get('/register', alreadyLoggedIn ,(request, response) => {
  midao.getFacultades((err,resultado)=> {
    if(err) console.err('Error: ', err)
    else response.render('register', {facultades:resultado});
  })
});


// Maneja el registro
router.post('/register', checkValidity, async (request, response) => {
  const user = request.body;

  
  // Encriptar la contraseña
  const hashedPassword = await bcrypt.hash(user.contrasenaConf, 10);
  user.contrasena = hashedPassword;
  user.contrasenaConf = hashedPassword;
  // Llama al método para registrar al usuario
  midao.registerUser(user, (err) => {
    if (err) return response.status(400).send(err);
    // Conseguir el ID del usuario recién registrado
    midao.getIdFromEmail(user.email, (err, id) => {
      if (err) return response.status(400).send('Error al obtener ID');
      
      // Establece la sesión para el usuario recién registrado
      request.session.user = id;
      
      
      // Redirige a  home si el registro fue exitoso
      return response.redirect('/');
    });
  });

  
});

//LOGIN
router.get('/login', alreadyLoggedIn, (request, response) => {//Renderiza pagina de login
  response.render('login');
})

// Middelware para el post de login
router.post('/login',async function (request, response) {//Inicia sesion
  const { email, contrasena } = request.body;

  // Conseguir la contraseña e ID relacionada con el email
  midao.getIdAndPasswordFromEmail(email, (err, data) => {
    if (err || !data) return response.status(400).send('Email incorrecto');


    bcrypt.compare(contrasena, data.contrasena, (err, isMatch) => {
      if (err)  throw(err);
      if (isMatch) {
        request.session.user = data.id;
        response.locals.user = data.id;
        return response.status(200).redirect('/');
      } 
      return response.status(400).send('Contraseña incorrecta');
    });
    
  })
});


function checkValidity(request, response, next){
  const user = request.body;
  
  // Aqui hay que mirar que los valores sean correctos
  if (user.contrasena !== user.contrasenaConf)
      return response.status(400).send('Las contraseñas han de coincidir')

  if (!user.telefono.match(/(\+[0-9]?[0-9]?)?[0-9]{9}/))
    return response.status(400).send('Ingrese un número de telefono válido')

  next();
}


//Profile
router.get('/profile', (request, response) => {
  console.log("hola,",response.locals.user)
  
  midao.getUserById(request.session.user,(err,resultado)=> {
    if (err || !resultado) return response.status(400).send('No hay sesion iniciada');
    else response.render('profile', {usuario:resultado});
  })
});

router.post('/modifyUser', (request, response) => {
  const { nombre, correo, telefono,facultad, rol} = request.body;
  console.log("aaaa",rol)
  midao.modifyUser(nombre, correo, telefono, facultad, rol, request.session.user  ,(err,resultado)=> {
    if (err || !resultado) return response.status(400).send('No hay sesion iniciada');
    else response.render('profile', {usuario:resultado});
  })
});

router.get('/getFacultades', (req, res) => {
  midao.getFacultades((err, facultades) => {
      if (err) {
          return res.status(500).json({ error: 'Error al obtener facultades' });
      }
      res.json({ facultades });
  });
});

module.exports = router;

