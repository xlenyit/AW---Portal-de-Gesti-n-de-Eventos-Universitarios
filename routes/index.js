var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('landingPage', { user: 'Usuario',hasNotification: true, isLogged: true});
});


module.exports = router;
