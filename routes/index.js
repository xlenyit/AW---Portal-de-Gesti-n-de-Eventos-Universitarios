'use strict';

const express = require('express');
const router = express.Router();

// Esto retornará la página principal
router.get('/', function(req, res) {

  // Asumimos solo dos estados: user === null y user === {datos}
  let isLogged = null;

  let hasNotification = false;

  if (isLogged) {
    hasNotification = req.body.user.hasNotification;
  }

  res.render('homePage', { user: 'Usuario', isLogged: isLogged, hasNotification: hasNotification });
});


module.exports = router;
