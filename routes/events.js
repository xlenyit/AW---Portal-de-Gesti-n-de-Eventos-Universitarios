var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO("localhost","root","","AW_24");

// EVENTO
router.get("/event",(request, response) => {//Renderiza pagina de register
    // Esto es temporal, la idea es tomar toda la info de una bd en función de cual sea el id tomado
    // Hay que acceder a Inscripciones, Evento y Usuario
    response.status(200)
    midao.getEvento(1, (err,resultado)=> {
        if(err) console.log("Error: ", err)
        else{
            resultado = resultado[0];
            response.render("event", {
                nombre: resultado.titulo,
                fecha: resultado.fecha,
                precio: resultado.precio,
                hora: resultado.hora,
                ubicacion: resultado.ubicacion,
                capacidad_maxima: resultado.capacidad_maxima,
                ocupacion: 100,
                descripcion: resultado.descripcion,
                usuario: { esta_inscrito: true, esta_lista_espera: true},
                image_path: "/img/placeholderEvento.jpg",
                image_alt: "Imagen"
            });
        };
    })
});

module.exports = router;