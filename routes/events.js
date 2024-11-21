'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','AW_24');

// EVENTO
router.get('/event',(request, response) => {//Renderiza pagina de register
    // Esto es temporal, la idea es tomar toda la info de una bd en función de cual sea el id tomado
    // Hay que acceder a Inscripciones, Evento y Usuario
    response.status(200)
    var config = {};
    let contador = 0;

    config.isLogged = request.isLogged;
    config.hasNotification = request.hasNotification;
    config.ocupacion= 100,
    config.usuario= { esta_inscrito: true, esta_lista_espera: true},
    config.image_path= '/img/placeholderEvento.jpg',
    config.image_alt= 'Imagen'

    midao.getEvento(1, (err,resultado)=> {
        if(err) console.log('Error: ', err)
        else{
            resultado = resultado[0];
            config.nombre = resultado.titulo;
            config.fecha = resultado.fecha;
            config.precio= resultado.precio;
            config.hora= resultado.hora;
            config.ubicacion= resultado.ubicacion;
            config.capacidad_maxima= resultado.capacidad_maxima;
            config.descripcion = resultado.descripcion;
        };

        contador++;
        checkAndRender();
    });
    
    const checkAndRender = () =>{
        if (contador === 1)
            response.render('event', config);
    };


});

router.get('/eventViewer', (request, response) => {
    response.status(200);
    var config = {};
    let completed = 0; // Contador para asegurarnos de que ambas funciones terminen


    midao.getOrganizators((err, organizadores) =>{
        if (err){
            console.error('Error: ', err)
            response.status(400);
            config.organizators =  null;
        } 
        else
            config.organizators = organizadores;

        completed++;
        checkAndRender();
        
    });


    midao.getCategories((err, categorias)=> {
        if (err){
            console.error('Error: ', err)
            response.status(400);
            config.categories = null;
        } 
        else
            config.categories = categorias;

        completed++;
        checkAndRender();

    });


    const checkAndRender = () => {
        if (completed === 2) {
            // Ambas funciones han terminado, renderizamos la respuesta
            response.render('eventViewer', getOptions(config.organizators, config.categories));
        }
    };  

});

function getOptions(organizadores, categorias) {
    return {
        isLogged: true,
        hasNotification:true,
        precio_maximo:1000,
        organizators:organizadores,
        categories:categorias,
        eventos:[
            {
                'name': 'Event 1',
                'date': '2024-11-18',
                'location': 'New York',
                'description': 'A tech conference about AI advancements.',
                'capacity':'1000',
                'ocupation': '100'
            },
            {
                'name': 'Event 2',
                'date': '2024-11-20',
                'location': 'San Francisco',
                'description': 'A networking event for software developers.',
                'capacity':'1000',
                'ocupation': '100'
            },
            {
                'name': 'Event 3',
                'date': '2024-12-01',
                'location': 'Los Angeles',
                'description': 'A startup pitch competition.',
                'capacity':'1000',
                'ocupation': '100'
            },
            {
                'name': 'Event 4',
                'date': '2024-11-01',
                'location': 'Los Angeles',
                'description': 'A startup potch competition.',
                'capacity':'900',
                'ocupation': '100'
            }
        ]

    };
}

module.exports = router;