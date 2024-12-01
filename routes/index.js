'use strict';

const express = require('express');
const router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');

// Esto retornará la página principal
router.get('/', function(request, response) {

  // Asumimos solo dos estados: user === null y user === {datos}
  let isLogged = request.session.user;

  // let hasNotification = false;

  // if (isLogged) {
  //   hasNotification = true;
  // }
  console.log(`Home: hasNotification -> ${response.locals.hasNotification}`);
  // response.render('homePage', { user: 'Usuario', isLogged: isLogged, hasNotification: hasNotification });
  response.render('homePage', { user: 'Usuario', isLogged: isLogged });
});

router.get('/notificaciones',(request, response) => {
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
