var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO("localhost","root","","AW_24");


const alreadyLoggedIn = (req, res, next) => {
  if (!res.locals.user) return next();
  res.redirect('/');
};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// REGISTRO
router.get("/register", alreadyLoggedIn ,(request, response) => {//Renderiza pagina de register
  response.status(200)
  midao.getFacultades((err,resultado)=> {
    if(err) console.log("Error: ", err)
    else response.render('register', {facultades:resultado});
  })
});

router.post("/register",(request, response) => { //Crea el nuevo usuario tras submit en vista de register
  //TODO
});

//LOGIN
router.get("/login", alreadyLoggedIn, (request, response) => {//Renderiza pagina de login
  response.status(200)
  response.render('login');
})

router.post("/login", function (request, response) {//Inicia sesion
  //TODO
});

// EVENTO
router.get("/event",(request, response) => {//Renderiza pagina de register
  // Esto es temporal, la idea es tomar toda la info de una bd en función de cual sea el id tomado
  // Hay que acceder a Inscripciones, Evento y Usuario
  response.status(200)
  midao.getEvento(1, (err,resultado)=> {
    if(err) console.log("Error: ", err)
    else{
      resultado = resultado[0];
      response.render("event", {
        nombre: resultado.titulo,
        fecha: resultado.fecha,
        precio: resultado.precio,
        hora: resultado.hora,
        ubicacion: resultado.ubicacion,
        capacidad_maxima: resultado.capacidad_maxima,
        ocupacion: 100,
        descripcion: resultado.descripcion,
        usuario: { esta_inscrito: true, esta_lista_espera: true},
        image_path: "/img/placeholderEvento.jpg",
        image_alt: "Imagen"
      });
    };
  })
});

module.exports = router;

