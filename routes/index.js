'use strict';

const express = require('express');
const router = express.Router();

// Esto retornará la página principal
router.get('/', function(request, response) {

  // Asumimos solo dos estados: user === null y user === {datos}
  let isLogged = request.session.user;

  let hasNotification = false;

  if (isLogged) {
    hasNotification = true;
  }

  response.render('homePage', { user: 'Usuario', isLogged: isLogged, hasNotification: hasNotification });
});

module.exports = router;
