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
                hasNotification: true,
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

router.get('/eventViewer', (request, response) => {
    response.status(200);
    midao.getOrganizators((err,organizadores)=> {
        if (err) console.log("Error: ", err)
        else{
            midao.getCategories((err,categorias)=> {
                if (err) console.log("Error: ", err)
                else response.render('eventViewer', getOptions(organizadores, categorias));
            })
        }
    });
})

function getOptions(organizadores, categorias) {
    return {
        hasNotification:true,
        precio_maximo:1000,
        organizators:organizadores,
        categories:categorias,
        eventos:[
            {
                "name": "Event 1",
                "date": "2024-11-18",
                "location": "New York",
                "description": "A tech conference about AI advancements.",
                "capacity":"1000",
                "ocupation": "100"
            },
            {
                "name": "Event 2",
                "date": "2024-11-20",
                "location": "San Francisco",
                "description": "A networking event for software developers.",
                "capacity":"1000",
                "ocupation": "100"
            },
            {
                "name": "Event 3",
                "date": "2024-12-01",
                "location": "Los Angeles",
                "description": "A startup pitch competition.",
                "capacity":"1000",
                "ocupation": "100"
            },
            {
                "name": "Event 4",
                "date": "2024-11-01",
                "location": "Los Angeles",
                "description": "A startup potch competition.",
                "capacity":"900",
                "ocupation": "100"
            }
        ]

    };
}

module.exports = router;