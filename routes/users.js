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

const alreadyLoggedIn = (request, response, next) => { //Middleware que asegura de que los usuarios no loggeados no puedan acceder a las páginas de login o registro. Si un usuario ya está loggeado, lo redirige al inicio
  if (request.session.user === undefined) return next();
  response.redirect('/');
};

const isLoggedIn = (req, res, next) => { //Middleware que asegura de que solo los usuarios loggeados puedan acceder a ciertas páginas (como el perfil de usuario). Si el usuario no está loggeado, lo redirige a la página de login.
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
  midao.registerUser(user, (err, id) => {
    if (err) return response.status(400).send(err);
    // Conseguir el ID del usuario recién registrado
    // midao.getIdFromEmail(user.email, (err, id) => { //no hace falta 
    //   if (err) return response.status(400).send('Error al obtener ID');
      
      // Establece la sesión para el usuario recién registrado
      request.session.user = id;
      
console.log('Registrando usuario:', user);
console.log('ID del usuario registrado:', id);
      // Redirige a  home si el registro fue exitoso
      return response.redirect('/');
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
//LOGOUT
router.get("/logout", isLoggedIn, (request, response) => { //Redirige a pagina principal, cerrando sesion en locals y session
  request.session.destroy()
  response.locals.user = request.session
  response.status(200)
  response.redirect('/');
})

//Profile
router.get('/profile',isLoggedIn, (request, response) => {
  midao.getUserById(request.session.user,(err,usuario)=> {
    if (err || !usuario) return response.status(400).send('No hay sesion iniciada');
    else{
      if (usuario.es_organizador === 0) {
        midao.getEventsEnrolledByUser(request.session.user,(err,resultado)=> {
          if (err || !resultado) return response.status(400).send('Error al buscar eventos a los que se ha inscrito el usuario');
          else response.render('profile', {usuario, eventos:resultado});
        })
      } else{
        midao.getEventsCreatedByUser(request.session.user,(err,resultado)=> {
          if (err || !resultado) return response.status(400).send('Error al buscar eventos que ha creado el usuario');
          else response.render('profile', {usuario, eventos :resultado});
        })
      }
    } 
  })
});

router.post('/modifyUser', (request, response) => {
  const { nombre, correo, telefono,facultad, rol} = request.body;
  midao.modifyUser(nombre, correo, telefono, facultad, rol, request.session.user  ,(err,resultado)=> {
    if (err || !resultado) return response.status(400).send('No hay sesion iniciada');
    else{
      if (rol === 0) {
        midao.getEventsEnrolledByUser(request.session.user,(err,res)=> {
          if (err || !res) return response.status(400).send('Error al buscar eventos a los que se ha inscrito el usuario');
          else response.render('profile', {usuario:resultado, eventos:res});
        })
      } else{
        midao.getEventsCreatedByUser(request.session.user,(err,res)=> {
          if (err || !res) return response.status(400).send('Error al buscar eventos que ha creado el usuario');
          else response.render('profile', {usuario:resultado, eventos :res});
        })
      }
    } 
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

