'use strict';

var express = require('express');
var router = express.Router();
const DAO = require('../public/javascripts/DAO')
const midao = new DAO('localhost','root','','aw_24');
const multer=require('multer');
const multerFactory= multer({storage: multer.memoryStorage()})

const sqlInjectionCheckMiddleware = (request, res, next) => {
    // Expresión regular para detectar patrones comunes de inyección SQL
    // const sqlInjectionPattern = /(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|FROM|WHERE|--|#|\/\*|\*\/)/;
    const sqlInjectionPattern = /^(['";])(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|FROM|WHERE)/i;
  
    // Verificar cada campo en request.body
    for (const key in request.body) {
      if (request.body.hasOwnProperty(key)) {
        const value = request.body[key];
  
        if (sqlInjectionPattern.test(value)) {
          const ip = request.ip;
          midao.banear(ip);
          return response.redirect('/errors/banned');
        }
      }
    }
  
    
    next();
  };
  

const userIsOrganizer = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');  
    }

    midao.getUserById(req.session.user, function(err, usuario){
        if(err) console.error('Error: No se ha encontrado el usuario ', null)
        else{
            if (usuario.es_organizador == 0)  return res.render('error', {message:"no eres organizador", error:{status:404, stack:404}});
            else next();
        }
    })
    
};

const isLoggedIn = (req, res, next) => { //Middleware que asegura de que solo los usuarios loggeados puedan acceder a ciertas páginas (como el perfil de usuario). Si el usuario no está loggeado, lo redirige a la página de login.
    if (req.session.user) return next();
    res.redirect('/users/login');
  };

// EVENTO
router.get('/event/:id',isLoggedIn, multerFactory.single('imagen'),(request, response) => {
    response.status(200)
    var config = {};
    let id = request.params.id;
    let counter = 0;

    // Habría que cambiarlo para que funcionase en lugar de con isLogged, pasando un user.
    // Si user === null -> !isLogged
    // Si no, tomar valores desde user.hasNotification, user.esta_inscrito...
    config.isLogged = (request.session.user ==null ? false: true);
    config.usuario= { esta_inscrito: false, esta_lista_espera: false};
    config.organizadorDeEste=false;
    config.usuarioOrg=false;
    config.image_path= null,
    config.image_alt= 'Imagen del evento'

    midao.getUserById(request.session.user, function(err, res){
        if(err) console.error('Error: No se ha encontrado el usuario ', null)
        else{
            config.usuarioOrg = res.es_organizador == 1?true:false;
            if(config.usuarioOrg){ //Si es organizador, necesito comprobar si es el organizador del evento id para dejarle editar en esta vista
                midao.getEventsCreatedByUser(request.session.user, function(err, eventosMap) {
                    if(err) console.error('Error: No se ha encontrado el usuario ', null)
                    else{
                        eventosMap.forEach(ele => {
                            if(parseInt(id) == ele.id) {
                                config.organizadorDeEste = true;
                            }
                        });
                    } 
                    counter++;
                    checkAndRender();
                })
            }else{ //No es organizador, por tanto es asistente, comprobar si esta inscrito ya o no para darle las opciones de asistente
                midao.checkIfUserIsEnrolledInEvent(request.session.user, id, (err, inscrito) =>{
                    if(err) console.error('Error: ', null)
                    else{
                        config.usuario.esta_inscrito = inscrito[0] != null;
                        if(config.usuario.esta_inscrito)  config.usuario.esta_lista_espera = inscrito[0].esta_lista_espera == 1;
                    } 
                    counter++;
                    checkAndRender();
                })

            }
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
                    let imageUrl = null
                    if(resultado.foto) {
                        console.log("tiene foto")
                        const imageBase64 = resultado.foto.toString('base64');
                        imageUrl = 'data:image/jpeg;base64,' + imageBase64;
                        config.image_path = imageUrl;
                    }
        
                };
                counter++;
                checkAndRender();
            });
            
            const checkAndRender = () =>{
                if (counter === 2)
                    response.render('event', config);
                
            };
        } 
    })

    


});

//LISTA EVENTOS
router.get('/eventViewer', isLoggedIn,(request, response) => {
    response.status(200);
    let config = {};
    let validados = 0;

    config.isLogged = true;

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

    midao.esOrganizador(request.session.user, (err, esOrganizador) => {
        if (err) config.es_organizador = false;
        else config.es_organizador = esOrganizador;
        validados++;
        tryRender();
    });
    
    const tryRender = () => {
        console.log(`EventViewer: hasNotification -> ${response.locals.hasNotification}`);
        if (validados === 3)
            response.render('eventViewer', config);
    }

});

//INSCRIBIRSE A EVENTO
router.post('/:id/createInscription', (request, response) => {
    midao.createInscription(request.session.user,request.params.id,(err, res) => {
        if(err) {
            console.error(res)
            response.redirect('/')
        }
        else {
            midao.createNotificacion(request.session.user, request.params.id, DAO.CODIGO_INSCRIPCION, (err) =>{
                if (err) console.error(err);
            })
            response.json(res)
        }
    })
})

//DESAPUNTASE DE EVENTO (ASIS)
router.post('/:id/deleteInscription', (request, response) => {
    midao.deleteInscription(request.session.user,request.params.id,(err, res) => {
      if(err) {
        console.error(res)
        response.redirect('/')
      }
      else {
        midao.createNotificacion(request.session.user, request.params.id, DAO.CODIGO_DESAPUNTAR, (err) =>{
            if (err) console.error(err);
        })
        response.json(res)
      }
    })
})

//QUITARSE DE LISTA DE ESPERA DE EVENTO (ASIS)
router.post('/:id/deleteInscriptionWaitingList', (request, response) => {
    midao.deleteInscriptionWaitingList(request.session.user,request.params.id,(err, res) => {
      if(err) console.error(err)
      else {
        midao.createNotificacion(request.session.user, request.params.id, DAO.CODIGO_QUITAR_DE_ESPERA, (err) =>{
            if (err) console.error(err);
        })
        response.json(res)
      }
    })
})

// BORRAR USUARIO DE EVENTO (ORG)
router.post('/:eventId/deleteInscription/:userId', (request, response) => {
    midao.deleteInscription(request.params.userId,request.params.eventId,(err, res) => {
      if(err) console.error(err)
      else {
        midao.getWaitingList(request.params.eventId, (err, waitingList) => {
            if(err) console.error(err)
            else{
                if (waitingList && waitingList.length > 0) {
                    midao.removeFromWaitingList(waitingList[0].id_usuario,request.params.eventId, (err, result => {
                        if(err) console.error(err)
                        else{
                            midao.createNotificacion(request.params.userId, request.params.eventId, DAO.CODIGO_SALIR_LISTA_ESPERA, (err) =>{
                                if (err) console.error(err);
                            })
                            response.json(res)
                        }
                    }))
                }
                else{
                    midao.createNotificacion(request.params.userId, request.params.eventId, DAO.CODIGO_ELIMINAR, (err) =>{
                        if (err) console.error(err);
                    })
                    response.json(res)
                }
                
            }
        })
      }
    })
})
//INSCRIBIRSE A EVENTO COMPLETO == AÑADIRSE A LISTA ESPERA (ASIS)
router.post('/:id/createInscriptionWaitingList', (request, response) => {
    midao.createInscriptionWaitingList(request.session.user,request.params.id,(err, res) => {
        if(err) console.error(err)
        else {
            midao.createNotificacion(request.session.user, request.params.id, DAO.CODIGO_EN_ESPERA, (err) =>{
                if (err) console.error(err);
            })
            response.json(res)
        }
    })
})

//CREAR EVENTO
router.post('/createEvent', sqlInjectionCheckMiddleware, userIsOrganizer,multerFactory.single('imagen'), (request, response) => {
    const {titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_categoria} = request.body;
    const foto = request.file ? request.file.buffer : null; 
    midao.createEvent(titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, request.session.user, id_categoria, foto,(err, res) => {
      if(err) console.error(err)
      else {
            response.status(200).redirect("/events/eventViewer")
      }
    })
})
router.get('/createEvent',userIsOrganizer,(request, response) => {
    midao.getCategories((err,resultado)=> {
      if(err) console.err('Error: No se ha podido recoger las categorias', null)
      else response.render('createEvent', {categorias:resultado});
    })
  });


// VER USUARIOS EN EVENTO
router.get('/eventUserManager/:id', (request, response) =>{
    let eventId = request.params.id;
    let config = {};
    let validated = 0;
    midao.getUsuariosInEvent(eventId, (err, users) =>{
        if (err) console.error('Error al tomar los datos de los usuarios de la bd');
        else {
            // config.users = users;
            // validated++;
            // tryRender();
            midao.getEvento(eventId, (err, event) =>{
                if (err) console.error('Error al tomar los datos de los usuarios de la bd');
                else {
                    // config.event = {};
                    // config.event.nombre = event[0].titulo;
                    // config.event.id = event[0].id;
                    // validated++;
                    // tryRender();
                    
                    response.render('eventUserManager', {usuarios:users, event: event[0]});
                }
            });
        }
    });



    // const tryRender = () => {
    //     if (validated === 2){
    //         response.render('eventUserManager', config);
    //     }
    // }
})

//EDITAR EVENTO
router.get('/:id/edit', (request, response) => {
    let eventId = request.params.id;

    midao.getEvento(eventId, (err, evento) => {
        if (err || !evento) {
            return response.status(400).send('Evento no encontrado');
        }

        midao.getCategories((err, categorias) => {
            evento[0].fecha=evento[0].fecha.toISOString().split('T')[0]
            if (err) return response.status(500).send('Error al obtener las categorías');
            let imageUrl = null
            if(evento.foto) {
                const imageBase64 = evento.foto.toString('base64');
                imageUrl = 'data:image/jpeg;base64,' + imageBase64;
            }
            response.status(200).render('editEvent', {evento: evento[0], categorias,imageUrl});
        });
    });
});

router.post('/:id/edit', sqlInjectionCheckMiddleware, multerFactory.single('imagenEvento'),(request, response) => {
    const {  titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_categoria } = request.body;
    const foto = request.file ? request.file.buffer : null; 
    
    midao.modifyEvent(request.params.id,titulo,descripcion,precio,fecha,hora,ubicacion,capacidad_maxima,id_categoria,foto,(err, result) => {
        if (err) {
            console.error('Error al modificar el evento:', err);
            return response.status(500).send('Error al modificar el evento');
        }
        else{
            midao.createNotificacion(request.session.user, request.params.id, DAO.MODIFICAR_EVENTO);
            response.status(200).redirect('/events/event/'+request.params.id);
        } 
    });
});


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