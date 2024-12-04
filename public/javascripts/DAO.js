const sql = require('mysql')


class DAO {
    static CODIGO_INSCRIPCION = 1;
    static CODIGO_EN_ESPERA = 2;
    static CODIGO_QUITAR_DE_ESPERA = 3;//(ASIS)
    static CODIGO_DESAPUNTAR = 4;
    static CODIGO_CANCELACION = 5;
    static CODIGO_ELIMINAR = 6;
    static CODIGO_SALIR_LISTA_ESPERA = 7;//Pasa de estar en espera a ser asistente oficial
    static CODIGO_AVANZAR_ESPERA = 8;
    static MODIFICAR_EVENTO = 9;

    constructor(host, user, password, database) {
        this.pool = sql.createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            // port: port
        })
    }

    getIdAndPasswordFromEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT id, contrasena FROM usuarios WHERE correo = ?`
                connection.query(stringQuery, [email], function (err, data) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        callback(null, data[0]);
                    }
                })
            }
        })
    }

    getIdFromEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT id FROM usuarios WHERE correo = ?`
                connection.query(stringQuery, [email], function (err, resId) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        let id;
                        resId.map(ele => id = ele.id);
                        callback(null, id);
                    }
                })
            }
        })
    }

    getUserEmail(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT correo FROM usuarios WHERE id = ?`
                connection.query(stringQuery, [id], function (err, resId) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        let correo;
                        resId.map(ele => correo = ele.correo);
                        callback(null, correo);
                    }
                })
            }
        })
    }

    getUserTelephone(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT telefono FROM usuarios WHERE id = ?`
                connection.query(stringQuery, [id], function (err, resId) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        let telefono;
                        resId.map(ele => telefono = ele.telefono);
                        callback(null, telefono);
                    }
                })
            }
        })
    }

    esOrganizador(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT es_organizador FROM usuarios WHERE id = ?`
                connection.query(stringQuery, [id], function (err, result) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, result[0].es_organizador === 1);

                })
            }
        })
    }



    checkUniqueUserEmail(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT COUNT(*) as total FROM usuarios WHERE correo = ?`
                connection.query(stringQuery, [email], function (err, tot) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        let total;
                        tot.map(ele => total = ele.total);
                        callback(null, total);
                    }
                })
            }
        })
    }

    checkUniqueUserPhone(phone, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT COUNT(*) as total FROM usuarios WHERE telefono = ${phone}`
                connection.query(stringQuery, function (err, tot) {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        let total;
                        tot.map(ele => total = ele.total);
                        callback(null, total);
                    }
                })
            }
        })
    }

    registerUser(userData, callback) {
        // userdata has the structure:
        // {name, email, telefono, password, confirmPassword, facultad, rankUser}
        const { nombre, email, telefono, contrasena, confirmPassword, facultad, userType } = userData;

        // Antes que nada hemos de verificar que el email o telefono no existen ya en la BD
        // Aunque esta tenga valores UNIQUE para estos campos, mejor handlearlo aqui
        this.checkUniqueUserEmail(email, (err, found) => {
            if (err || found !== 0) return callback('Email repetido', null);
            this.checkUniqueUserPhone(telefono, (err, found) => {
                if (err || found !== 0) return callback('Telefono repetido', null);
                continueInsertion();
            });

        });

        const continueInsertion = () => {
            // Necesitamos coger el id de la facultad
            let idFacultad = facultad.split('#')[0]; //2#Facultad de sociales

            let isOrganizator = userType === 'organizador' ? 1 : 0;

            this.createRowOnDatabaseUser(nombre, email, telefono, contrasena, idFacultad, isOrganizator, (err, id) => {
                if (err) callback('Error añadiendo registro a la BD', null)
                else callback(null, id);
            })
        }

    }

    createRowOnDatabaseUser(name, email, telefono, password, idFacultad, isOrganizator, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `INSERT INTO usuarios (nombre, correo, telefono, contrasena, es_organizador, id_facultad, id_accesibilidad)
                                    VALUES (?, ?, ?, ?, ?, ?, 1)` //Al registrar un usuario tendran la conf de accesibilidad 1 por defecto
                connection.query(stringQuery, [name, email, telefono, password, isOrganizator, idFacultad], function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado.insertId);

                })
            }
        })
    }
    
    usuarioEnListaDeEspera(idUsuario,idEvento,  callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM  inscripciones WHERE id_usuario = ? AND id_evento = ?` //Al registrar un usuario tendran la conf de accesibilidad 1 por defecto
                connection.query(stringQuery, [idUsuario, idEvento], (err, resultado)=>{
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado[0].esta_lista_espera === 1);

                })
            }
        })
    }

    //CRUD facultades
    //read all facultades
    getFacultades(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT * FROM facultades"
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, resultado.map(ele => ({ id: ele.id, nombre: ele.nombre })))
                })
            }
        })
    }

    getEvento(id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT e.*, COALESCE(COUNT(i.id_usuario), 0) AS total 
                                    FROM eventos e LEFT JOIN inscripciones i 
                                    ON i.id_evento = e.id 
                                    WHERE e.id = ${id} AND i.activo=1`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, resultado.map(ele => ({
                        id: ele.id,
                        titulo: ele.titulo,
                        descripcion: ele.descripcion,
                        fecha: ele.fecha,
                        precio: ele.precio,
                        hora: ele.hora,
                        ubicacion: ele.ubicacion,
                        capacidad_maxima: ele.capacidad_maxima,
                        id_organizador: ele.id_organizador,
                        ocupacion: ele.total,
                        id_categoria: ele.id_categoria,
                        foto:ele.foto
                    })));
                })
            }
        })
    }

    getOrganizators(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM usuarios WHERE es_organizador=1`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado.map(ele => ({ id: ele.id, nombre: ele.nombre })));
                })
            }
        })
    }

    //CRUD categorias
    //read all categorias
    getCategories(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM categorias`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado.map(ele => ({ id: ele.id, nombre: ele.nombre })));
                });
            }
        })
    }

    getOcupacion(idEvento, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT COUNT(*) as ocupacion FROM inscripciones WHERE id_evento=${idEvento} AND esta_lista_espera=0 AND activo=1`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado.map(ele => ({ ocupacion: ele.ocupacion })));
                });
            }
        })
    }

    getEventos(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT e.*, COALESCE(COUNT(CASE WHEN i.activo = 1 THEN i.id_usuario END), 0) AS total
                                    FROM eventos e
                                    LEFT JOIN inscripciones i ON i.id_evento = e.id
                                    GROUP BY e.id`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        const mappedResults = resultado.map(evento => ({
                            id: evento.id,
                            titulo: evento.titulo,
                            descripcion: evento.descripcion,
                            fecha: evento.fecha,
                            precio: evento.precio,
                            hora: evento.hora,
                            ubicacion: evento.ubicacion,
                            capacidad_maxima: evento.capacidad_maxima,
                            id_organizador: evento.id_organizador,
                            ocupacion: evento.total,
                            foto: evento.foto ? `data:image/jpeg;base64,${evento.foto.toString('base64')}` : null
                        }));

                        callback(null, mappedResults);
                    }
                });
            }
        });
    }

    getMaxPrice(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT MAX(precio) as max_price FROM eventos`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null, resultado[0]);

                });
            }
        });
    }
    //CRUD usuarios
    //read by id
    getUserById(idUser, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT u.*, f.nombre as nombreFacultad FROM usuarios as u JOIN facultades as f ON u.id_facultad = f.id WHERE u.id = ?"
                connection.query(stringQuery, idUser, function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, res[0])
                })
            }
        })
    }
    //update
    modifyUser(nombre, correo, telefono, facultad, es_org, id, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                // let stringQuery= `UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, id_facultad = ?, es_organizador = ? WHERE id = ?`;  //No se puede cambiar de rol, complica mucho a la hora de gestionar eventos
                let stringQuery = `UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, id_facultad = ? WHERE id = ?`;
                // connection.query(stringQuery, [nombre, correo, telefono, facultad, es_org, id], function (err, res) {
                connection.query(stringQuery, [nombre, correo, telefono, facultad, id], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, 'Perfil actualizado correctamente');
                })
            }
        })
    }

    checkIfUserIsEnrolledInEvent(userId, eventId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM inscripciones WHERE id_usuario = ? AND id_evento = ? AND activo=1`
                connection.query(stringQuery, [userId, eventId], function (err, res) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        callback(null, res);
                    }
                })
            }
        })
    }
    //CRUD inscripciones
    createInscription(idUsuario, idEvento, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO inscripciones (id_usuario, id_evento, esta_lista_espera, fecha_inscripcion, activo) VALUES (?, ?, 0, SYSDATE(), 1) ON DUPLICATE KEY UPDATE activo = 1, esta_lista_espera=0,fecha_inscripcion = SYSDATE();"
                connection.query(stringQuery, [idUsuario, idEvento], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, res.insertId)
                })
            }
        })
    }
    createInscriptionWaitingList(idUsuario, idEvento, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO inscripciones (id_usuario, id_evento, esta_lista_espera, fecha_inscripcion, activo) VALUES (?, ?, 1, SYSDATE(), 1) ON DUPLICATE KEY UPDATE activo = 1, esta_lista_espera=1, fecha_inscripcion = SYSDATE();"
                connection.query(stringQuery, [idUsuario, idEvento], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, res.insertId)
                })
            }
        })
    }

    //updateWaitingList(idUsuario, idEvento, callback) {
    //    this.usuarioEnListaDeEspera(idUsuario, idEvento, (err, esta_lista_espera) =>{
    //        if (err) return callback(err, 'Error getting the user data');
    //        if (esta_lista_espera) return callback(err, 'The user is not inscribed just in waiting list');
//
    //        this.getFirstInWaitingList(idEvento, (err, result) => {
    //            if (err) callback(err, result);
    //            else{
    //                this.pool.getConnection((err, connection) => {
    //                    if (err) {
    //                        callback(err, 'DB Error');
    //                    } else {
    //                        let updateQuery = "UPDATE inscripciones SET esta_lista_espera = 0 WHERE id_usuario = ? AND id_evento = ?";
    //                        connection.query(updateQuery, [result, idEvento], (err) => {
    //                            connection.release();
    //                            if (err) {
    //                                callback(err, "Error Updating BD");
    //                            } else {
    //                                this.createNotificacion(result, idEvento, DAO.CODIGO_AVANZAR_ESPERA);
    //                                callback(null);
    //                            }
    //                        });
    //                    }
    //                });
    //            }
    //        });
    //    });
//
    //}

    updateWaitingList(idEvento, callback) { //ELENA
        this.pool.getConnection((err, connection) => {
            if (err) {
                callback(err, null);
            } else {
                let selectQuery = "SELECT id_usuario FROM inscripciones WHERE id_evento = ? AND esta_lista_espera = 0 AND activo=1 ORDER BY fecha_inscripcion DESC LIMIT 1";
                connection.query(selectQuery, [idEvento], (err, res) => {
                    if (err) {
                        connection.release(); // Release connection if an error occurs
                        callback(err, null);
                    } else if (!res.length || res[0] === null) {
                        connection.release(); // Release connection if no results found
                        callback(null, null);
                    } else {
                        let updateQuery = "UPDATE inscripciones SET esta_lista_espera = 1 WHERE id_usuario = ? AND id_evento = ?";
                        connection.query(updateQuery, [res[0].id_usuario, idEvento], (err) => {
                            connection.release(); // Release connection after the UPDATE query
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, updateRes.affectedRows);
                            }
                        });
                    }
                });
            }
        });
    }
    
    //Elimina el evento
    removeFromWaitingList(idUsuario, idEvento,callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = "UPDATE inscripciones SET activo=1, esta_lista_espera = 0, fecha_inscripcion=SYSDATE() WHERE id_usuario = ? && id_evento = ?";
                connection.query(stringQuery, [idUsuario, idEvento], (err, res) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        console.log(res, "que gfalla")
                        callback(null, res.affectedRows); 
                    }
                });
            }
        });
    }

    getEmails(callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = "SELECT correo FROM usuarios";
                connection.query(stringQuery, (err, res) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        callback(null, res); 
                    }
                });
            }
        });
    };
 //Elimina el evento
    //deleteInscription(idUsuario, idEvento, callback) {
    //    this.pool.getConnection((err, connection) => {
    //        if (err) callback(err, null);
    //        else {
    //            let stringQuery = "UPDATE inscripciones SET activo=0 WHERE id_usuario = ? && id_evento = ?";
    //            connection.query(stringQuery, [idUsuario, idEvento], (err, res) => {
    //                connection.release();
    //                if (err) callback(err, null);
    //                else {
    //                    this.updateWaitingList(idUsuario, idEvento, (err, errMsg) => { // Para actualizar la lista de espera
    //                        if (err) callback(err, errMsg); 
    //                        else callback(null, res.affectedRows); 
    //                    });
    //                }
    //            });
    //        }
    //    });
    //}

    //getFirstInWaitingList(idEvento, callback) {
    //    this.pool.getConnection((err, connection) => {
    //        if (err) {
    //            callback(err, null);
    //        } else {
    //            let selectQuery = "SELECT id_usuario FROM inscripciones WHERE id_evento = ? AND esta_lista_espera = 1 ORDER BY fecha_inscripcion DESC LIMIT 1";
    //            connection.query(selectQuery, [idEvento], (err, res) => {
    //                connection.release(); 
    //                if (err || !res.length || res[0] === null) 
    //                    callback(true, "There is no one in waiting list");
    //                else 
    //                    callback(null, res[0].id_usuario);
    //            });
    //        }
    //    });
    //}

    

    deleteInscription(idUsuario, idEvento, callback) { //ELENA
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = "UPDATE inscripciones SET esta_lista_espera=0, activo=0 WHERE id_usuario = ? && id_evento = ?";
                connection.query(stringQuery, [idUsuario, idEvento], (err, res) => {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        this.updateWaitingList(idEvento, (err) => {
                            if (err) callback(err, null); // Pass the error if `updateWaitingList` fails
                            else callback(null, res.affectedRows); // Otherwise, return the number of affected rows
                        });
                    }
                });
            }
        });
    }

    //deleteInscriptionWaitingList(idUsuario, idEvento, callback) {
    //    this.pool.getConnection((err, connection) => {
    //        if (err) callback(err, null);
    //        else {
    //            let stringQuery = "UPDATE inscripciones SET esta_lista_espera=0, activo=0 WHERE id_usuario = ? && id_evento = ?";
    //            connection.query(stringQuery, [idUsuario, idEvento], (err, res) => {
    //                connection.release();
    //                if (err) callback(err, null);
    //                else callback(null, res.affectedRows);
    //            });
    //        }
    //    });
    //}
    

    //CRUD EVENTOS
    //create
    createEvent(titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_organizador, id_categoria, foto, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "INSERT INTO eventos (titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_organizador, id_categoria, foto) VALUES (?,?,?,?,?,?,?,?,?,?)"
                connection.query(stringQuery, [titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_organizador, id_categoria, foto], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, res.insertId)
                })
            }
        })
    }
    //readByEnrolledUserId
    getEventsEnrolledByUser(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                // let stringQuery= `SELECT * FROM eventos WHERE id IN (SELECT id_evento FROM inscripciones WHERE id_usuario = ? AND activo=1)`; 
                let stringQuery = `SELECT e.*, i.esta_lista_espera FROM eventos e JOIN inscripciones i ON e.id = i.id_evento WHERE i.id_usuario = ? AND i.activo = 1;`;
                connection.query(stringQuery, userId, function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        const mappedResults = res.map(evento => ({
                            id: evento.id,
                            titulo: evento.titulo,
                            descripcion: evento.descripcion,
                            fecha: evento.fecha.toLocaleDateString("es-ES"),
                            precio: evento.precio,
                            hora: evento.hora,
                            ubicacion: evento.ubicacion,
                            capacidad_maxima: evento.capacidad_maxima,
                            id_organizador: evento.id_organizador,
                            esta_lista_espera: evento.esta_lista_espera
                            // ocupacion: evento.total
                        }));

                        callback(null, mappedResults);
                    }
                })
            }
        })
    }
    //read by CreatorId
    getEventsCreatedByUser(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM eventos WHERE id_organizador = ?`;
                connection.query(stringQuery, userId, function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        const mappedResults = res.map(evento => ({
                            id: evento.id,
                            titulo: evento.titulo,
                            descripcion: evento.descripcion,
                            fecha: evento.fecha.toLocaleDateString("es-ES"),
                            precio: evento.precio,
                            hora: evento.hora,
                            ubicacion: evento.ubicacion,
                            capacidad_maxima: evento.capacidad_maxima,
                            id_organizador: evento.id_organizador,
                            // ocupacion: evento.total
                        }));

                        callback(null, mappedResults);
                    }
                })
            }
        })
    }

    //update
    
    modifyEvent(id,titulo,descripcion,precio,fecha,hora,ubicacion,capacidad_maxima,id_categoria,foto, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `UPDATE eventos SET titulo = ?, descripcion = ?, precio = ?, fecha = ?, hora = ?, ubicacion = ?, capacidad_maxima = ?, id_categoria = ?, foto=? WHERE id = ?`;
                connection.query(stringQuery, [titulo, descripcion, precio, fecha, hora, ubicacion, capacidad_maxima, id_categoria,foto, id], (err, res) => {
                        connection.release(); 
                        if (err) callback(err, null);
                        else callback(null, 'Evento actualizado correctamente');
                    }
                );
            }
        });
    }
    

    createNotificacion(idUser, idEvento, tipo, callback) {
        let titulo = "", mensaje = "";

        switch (tipo) {
            case DAO.CODIGO_INSCRIPCION:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Su inscripcion al evento ${titulo} se ha realizado con exito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} se ha inscrito al evento`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;

            case DAO.CODIGO_EN_ESPERA:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Su inscripcion a la lista de espera del evento ${titulo} se ha realizado con exito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} se ha añadido a la lista de espera del evento ${titulo}`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;
                
            case DAO.CODIGO_QUITAR_DE_ESPERA:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Se ha eliminado de la lista de espera del evento ${titulo} con exito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} se ha quitado de la lista de espera del evento ${titulo}`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;

            case DAO.CODIGO_AVANZAR_ESPERA:
                if (!idUser) return false;
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Se ha transferido de la lista de espera del evento ${titulo} a estar inscrito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} se ha movido de la lista de espera del evento a estar inscrito${titulo}`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                })
                break;

            case DAO.CODIGO_DESAPUNTAR:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Se ha eliminado su inscripcion al evento ${titulo} con exito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        console.log()
                        console.log()
                        console.log()
                        console.log(data)
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} se ha desapuntado del evento`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;

            case DAO.CODIGO_CANCELACION:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Se ha cancelado el evento ${titulo} :(. Lamentamos las molestias.`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    mensaje = `Se ha cancelado el evento ${titulo} con éxito`;
                    idUser = eventData.id_organizador;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    callback(null);
                })
                break;

            case DAO.CODIGO_ELIMINAR:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `El organizador del evento ${titulo} ha retirado su inscripción. Lamentamos las molestias`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `Se ha retirado al usuario: ${username} del evento ${titulo} con éxito.`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;

            case DAO.CODIGO_SALIR_LISTA_ESPERA:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `¡Enhorabuena! Has salido de la lista de espera para el evento: ${titulo}. ¡Bienvenido a la plantilla oficial ;)!`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    this.getUserById(idUser, (err, data) => {
                        if (err) callback(err);
                        let username = data.nombre;
                        mensaje = `El usuario ${username} a avanzado de la lista de espera a usuario inscrito`;
                        idUser = eventData.id_organizador;
                        this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});
                    });
                    callback(null);
                })
                break;

            case DAO.MODIFICAR_EVENTO:
                this.getEvento(idEvento, (err, data) => {
                    let eventData = data[0]
                    if (err) callback(err);
                    titulo = eventData.titulo;
                    mensaje = `Se ha modificado su evento ${titulo} con éxito`;
                    this.createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, (err) => { return err ? err : null});

                    this.getUsuariosInEvent(idEvento, (err, users) =>{
                        if (err) callback(err)
                        mensaje = `Han habido modificaciones en el evento ${titulo} en el cual estás inscrito`;
                        for (let i = 0; i < users.length; i++){
                            this.createRowOnDatabaseNotification(users[i].id_usuario, idEvento, titulo, mensaje, (err) => { if(err) callback(err)});
                        }
                        return null;
                    })
                })
                break;

            default:
                callback('Error registering notification');
        }
    }

    createRowOnDatabaseNotification(idUser, idEvento, titulo, mensaje, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `INSERT INTO notificaciones (id_usuario, id_evento, titulo, mensaje, visto)
                                    VALUES (?, ?, ?, ?, 0)`;
                connection.query(stringQuery, [idUser, idEvento, titulo, mensaje], function (err, res) {
                    connection.release();
                    if (err) callback(err)
                    else callback(null);
                })
            }
        })
    }

    getUsuariosInEvent(idEvento, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT u.*, i.* FROM usuarios as u JOIN inscripciones as i ON i.id_usuario = u.id WHERE i.id_evento = ? AND i.activo=1`;
                connection.query(stringQuery, [idEvento], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        callback(null, res);
                    }
                })
            }
        })
    }

    banear(IP) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `INSERT INTO blacklist (IP) VALUES (?)`;
                connection.query(stringQuery, [IP], function (err) {
                    connection.release();
                    if (err) console.error(err);
                })
            }
        })
    }

    getBanned(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT IP FROM blacklist`;
                connection.query(stringQuery, function (err, res) {
                    connection.release();
                    if (err) callback(err, null);
                    callback(null, res.map(ele => ele.IP))
                })
            }
        })
    }
    checkIfUserHasNotification(userId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT COUNT(*) AS count FROM notificaciones WHERE id_usuario = ? AND visto = 0`;
                connection.query(stringQuery, [userId], function (err, res) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        callback(null, res[0].count > 0);
                    }
                });
            }
        });
    }
    getNotifications(idUsuario, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM notificaciones WHERE id_usuario = ? order by fechaRecibida DESC`;
                connection.query(stringQuery, [idUsuario], function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else {
                        const notifications = res.map(ele => {
                            return {
                                id: ele.id,
                                id_usuario: ele.id_usuario,
                                id_evento: ele.id_evento,
                                titulo: ele.titulo,
                                mensaje: ele.mensaje,
                                visto: ele.visto,
                                fecha: ele.fechaRecibida.toLocaleDateString("es-ES", { hour: '2-digit', minute: '2-digit' })
                            };
                        });

                        // Devolver las notificaciones
                        callback(null, notifications);
                    }
                })
            }
        })
    }

    markNotificationAsRead(userId, notificationId, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `UPDATE notificaciones SET visto = 1 WHERE id = ? AND id_usuario = ?`;
                connection.query(stringQuery, [notificationId, userId], function (err, result) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, 'Notificacion actualizado correctamente');

                });
            }
        });
    }

    getUserAccesibilitySettings(id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT * FROM configuraciones_accesibilidad WHERE id=?`;
                connection.query(stringQuery, [id], function (err, result) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, result);
    
                });
            }
        });
    }

    createAccessibilityTableForUser(id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `INSERT INTO configuraciones_accesibilidad (id, paleta, tamanyo_texto, configuracion_navegacion) VALUES(?, null, null, null)`;
                connection.query(stringQuery, [id], function (err) {
                    connection.release();
                    if (err) callback(err)
                    else callback(null);
    
                });
            }
        });
    }

    setAccesibilityFontSize(value, id, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `UPDATE configuraciones_accesibilidad SET tamanyo_texto = ? WHERE id=?`;
                connection.query(stringQuery, [parseInt(value), id], function (err) {
                    connection.release();
                    if (err) callback(err)
                    else callback(null);
                });
            }
        });
    }

    getWaitingList(eventId,callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT * FROM inscripciones WHERE id_evento=? AND esta_lista_espera=1 AND activo =1 ORDER BY fecha_inscripcion ASC `;
                connection.query(stringQuery, [eventId], function (err, result) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null, result);
    
                });
            }
        });
    }
}

module.exports = DAO