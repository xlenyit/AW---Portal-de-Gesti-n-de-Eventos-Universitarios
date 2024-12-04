'use strict';

const express = require('express');
const router = express.Router();

router.get('/404', function(request, response) {
    response.render('errors', {err_name: '404', err_message: 'Página no encontrada'})
    
});

router.get('/banned', function(request, response) {
    response.render('errors', {err_name: '420', err_message: 'Esta IP ha sido baneada por intento de Inyeccion SQL'})
    
});

module.exports = router;
  