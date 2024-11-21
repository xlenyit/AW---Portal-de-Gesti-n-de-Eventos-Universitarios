'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','AW_24');

// EVENTO
router.get('/event',(request, response) => {//Renderiza pagina de register
    response.status(200)
    var config = {};
    let contador = 0;

    // Habría que cambiarlo para que funcionase en lugar de con isLogged, pasando un user.
    // Si user === null -> !isLogged
    // Si no, tomar valores desde user.hasNotification, user.esta_inscrito...
    config.isLogged = request.isLogged;
    config.hasNotification = request.hasNotification;
    config.usuario= { esta_inscrito: true, esta_lista_espera: true},
    config.image_path= '/img/placeholderEvento.jpg',
    config.image_alt= 'Imagen'

    midao.getEvento(1, (err,resultado)=> {
        if(err) console.log('Error: ', err)
        else{
            resultado = resultado[0];
            config.idEvento = resultado.id;
            config.nombre = resultado.titulo;
            config.fecha = resultado.fecha;
            config.precio= resultado.precio;
            config.hora= resultado.hora;
            config.ubicacion= resultado.ubicacion;
            config.capacidad_maxima= resultado.capacidad_maxima;
            config.descripcion = resultado.descripcion;

            midao.getOcupacion(config.idEvento, (err, res) =>{
                if (err){
                    console.log('Error: ', err)
                    config.ocupacion = 3;
                } 
                else
                    config.ocupacion = res[0].ocupacion;
     
                checkAndRender();
            });
        };
    });
    
    const checkAndRender = () =>{
        
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


    const checkAndRender = async() => {
        if (completed === 2) {
            getOptions(config.organizators, config.categories, (err, options)=>{
                response.render('eventViewer', options);
            });
            // Ambas funciones han terminado, renderizamos la respuesta
            
        }
    };  

});

function getOptions(organizadores, categorias, callback) {

    let config = {};

    config.isLogged = true;
    config.hasNotification=true;
    config.organizators=organizadores;
    config.categories=categorias;

    midao.getEventos((err, eventos) =>{
        if (err){
            console.error('Error: ', err)
            callback(err, null);
        }
        else{
            let resEvents = [];
            for (let i = 0; i < eventos.length; i++){
                let evento = eventos[i]
                midao.getEvento(evento.id, (err, ocupacion) =>{
                    if (err){
                        console.error('Error: ', err)
                        evento.ocupacion = 0;
                    }
                    else evento.ocupacion = ocupacion[0].ocupacion;
                    resEvents.push([evento]);
                });
            }
            config.eventos = resEvents;

            midao.getMaxPrice((err, ret)=>{
                if (err){
                    console.log(err);
                    response.status = 400;
                    config.precio_maximo = 0;
                }
                else
                    config.precio_maximo = ret.max_price;
                
                callback(null, config);
            });
        }
    });
}

module.exports = router;