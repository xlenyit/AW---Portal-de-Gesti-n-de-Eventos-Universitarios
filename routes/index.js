'use strict';

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var hasNotification = false;
  var isLogged = true;
  console.log(isLogged);

  if (isLogged) {
    hasNotification = true;
  }

  res.render('landingPage', { user: 'Usuario', isLogged: isLogged, hasNotification: hasNotification });
});


module.exports = router;
