'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');

// EVENTO
router.get('/event/:id',(request, response) => {
    response.status(200)
    var config = {};
    let id = request.params.id;

    // Habría que cambiarlo para que funcionase en lugar de con isLogged, pasando un user.
    // Si user === null -> !isLogged
    // Si no, tomar valores desde user.hasNotification, user.esta_inscrito...
    config.isLogged = (request.session.user ==null ? false: true);
    config.hasNotification = request.hasNotification;
    config.usuario= { esta_inscrito: true, esta_lista_espera: true};
    config.image_path= '/img/placeholderEvento.jpg',
    config.image_alt= 'Imagen'

    midao.checkIfUserIsEnrolledInEvent(request.session.user, id, (err, inscrito) =>{
        if(err) console.error('Error: ', null)
        else{
            config.usuario.esta_inscrito = inscrito[0] ? true:false;
            if(config.usuario.esta_inscrito)  config.usuario.esta_lista_espera = inscrito[0].esta_lista_espera;
        } 
    })

    midao.getEvento(id, (err,resultado)=> {
        if(err) console.error('Error: ', null)
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
            config.ocupacion = resultado.ocupacion;

        };
        checkAndRender();
    });
    
    const checkAndRender = () =>{
        response.render('event', config);
    };


});

//LISTA EVENTOS
router.get('/eventViewer', (request, response) => {
    response.status(200);
    let config = {};
    let validados = 0;

    config.isLogged = true;
    config.hasNotification=true;


    calcularElementosParaFiltros((err, filtros) => {
        if (err) response.status(400);
        else{           
            config.organizators = filtros.organizators;
            config.categories = filtros.categories;
            config.precio_maximo = filtros.precio_maximo;
        }
        validados++;
        tryRender();


    });

    obtenerConfiguracionDeEventos((err, eventos) => {
        if (err) response.status(400);
        else config.eventos = eventos;
        validados++;
        tryRender();
    });
    
    const tryRender = () => {
        if (validados === 2)
            response.render('eventViewer', config);
    }

});

//INSCRIBIRSE A EVENTO
router.post('/:id/createInscription', (request, response) => {
    midao.createInscription(request.session.user,request.params.id,(err, res) => {
      if(err) console.log(err)
      else response.json(res)
    })
})

//DESAPUNTASE DE EVENTO
router.post('/:id/deleteInscription', (request, response) => {
    midao.deleteInscription(request.session.user,request.params.id,(err, res) => {
      if(err) console.log(err)
      else response.json(res)
    })
  })
/// Funciones Extra

function calcularElementosParaFiltros(callback){
    let config = {};
    let completed = 0;

    midao.getOrganizators((err, organizadores) =>{
        if (err){
            console.error('Error: ', err)
            callback(err, null);
        } 
        else
            config.organizators = organizadores;

        completed++;
        checkAndRender();
        
    });

    midao.getCategories((err, categorias)=> {
        if (err){
            console.error('Error: ', err)
            callback(err, null);
        } 
        else
            config.categories = categorias;

        completed++;
        checkAndRender();

    });

    midao.getMaxPrice((err, maxPrice) => {
        if (err){
            console.error('Error: ', err)
            callback(err, null);
        }
        else
            config.precio_maximo = maxPrice.maxPrice;

        completed++;
        checkAndRender();
    })

    const checkAndRender = () => {
        if (completed === 3) 
            callback(null, config);
    }; 

}

function obtenerConfiguracionDeEventos(callback){
    let todosLosEventos = [];

    midao.getEventos((err, eventos) => {
        if (err){
            console.error('Error: ', err)
            callback(err, null);
        }
        else{
            for (let i = 0; i < eventos.length; i++){
                todosLosEventos.push(eventos[i]);
            }

            callback(null, todosLosEventos)
        }


    });
}


module.exports = router;