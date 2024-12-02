'use strict';

const express = require('express');
const router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');

const isLoggedIn = (req, res, next) => { //Middleware que asegura de que solo los usuarios loggeados puedan acceder a ciertas páginas (como el perfil de usuario). Si el usuario no está loggeado, lo redirige a la página de login.
  if (req.session.user) return next();
  res.redirect('/users/login');
};

router.get('/', function(request, response) {
  let isLogged = request.session.user;
  
  if (isLogged) {
      midao.getUserById(request.session.user, (err, userData) => {
          if (err || !userData) {
              return response.status(500).send('Error al obtener datos del usuario');
          }

          midao.getEventos((err, events) => {
              if (err) {
                  return response.status(500).send('Error al obtener los eventos');
              }

              response.render('homePage', {user: userData, isLogged: true, events: events});
          });
      });
  } else {
      response.render('homePage', { user: null, isLogged: false });
  }
});


router.get('/notificaciones', isLoggedIn, (request, response) => {
  midao.getNotifications(request.session.user,(err,resultado)=> {
    if(err) response.render('error', {message:"'Error: No se ha podido recoger las notificaciones'", error:{status:404, stack:404}})
    else response.render('notificationsViewer', {notifications:resultado});
  })
});
router.post('/markAsRead/:id', (req, res) => {
  const notificationId = req.params.id;
  console.log("llego")
  // Llamamos a la función en el modelo para actualizar la notificación en la base de datos
  midao.markNotificationAsRead(req.session.user,notificationId, (err, result) => {
      if (err) {
          return res.status(500).send('Error al marcar la notificación como leída');
      }
      res.status(200).send('Notificación marcada como leída');
  });
});

module.exports = router;
