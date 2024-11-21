'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','AW_24');
const bcrypt = require('bcrypt');


const alreadyLoggedIn = (req, res, next) => {
  if (!res.locals.user) return next();
  res.redirect('/');
};


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// REGISTRO
router.get('/register', alreadyLoggedIn ,(request, response) => {//Renderiza pagina de register
  response.status(200)
  midao.getFacultades((err,resultado)=> {
    if(err) console.log('Error: ', err)
    else response.render('register', {facultades:resultado});
  })
});

router.post('/register', checkValidity,  async (request, response) => {
  //TODO
});

//LOGIN
router.get('/login', alreadyLoggedIn, (request, response) => {//Renderiza pagina de login
  response.status(200)
  response.render('login');
})

router.post('/login', function (request, response) {//Inicia sesion
  //TODO
});

function checkValidity(req, res, next){
  
}

module.exports = router;

