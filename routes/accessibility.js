'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');


router.post('/fontSize/:value', (request, response) => {
    const id = request.session.user;
    const fontSize = request.params.value;
    

    midao.getUserAccesibilitySettings(id, (err, values) =>{
        if (err){
            console.error('Error');
            return response.status(400).send();
        };

        if (values[0] == undefined)
            midao.createAccessibilityTableForUser(id, (err) =>{
                if (err){
                    console.error('Error creando fila');
                    return response.status(400).send();
                };
            });

        midao.setAccesibilityFontSize(fontSize, id, (err) =>{
            if (err) {
                console.error('Error setteando columna');
                return response.status(400).send();
            };
        });

    });
    return response.status(200).send();
});


module.exports = router;