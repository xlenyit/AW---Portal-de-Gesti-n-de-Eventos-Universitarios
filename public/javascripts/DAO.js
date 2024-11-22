const sql = require('mysql')

class DAO {
    constructor(host, user, password, database) {
        this.pool = sql.createPool({
            host: host,
            user: user,
            password: password,
            database: database,
            // port: port
        })
    }

    // TODO
    checkUser(user, callback){
        callback(response.status(200));
    }

    registerUser(userData, callback){
        // userdata has the structure:
        // {name, email, telefono, password, confirmPassword, facultad, rankUser}
        const {name, email, telefono, password, confirmPassword, facultad, rankUser} = userData;
        
        // Antes que nada hemos de verificar que el email o telefono no existen ya en la BD
        // Aunque esta tenga valores UNIQUE para estos campos, mejor handlearlo aqui
        checkUniqueUserEmail(email, (err, found) => {
            if (err || found !== 0) return callback(err, 'Email repetido');
            checkUniqueUserPhone( (err, found) =>{
                if (err || found !== 0) return callback(err, 'Telefono repetido');
                continueInsertion();
            });

        });

        const continueInsertion = () => {
            // Necesitamos coger el id de la facultad
            let idFacultad = facultad.split('#')[0]; //2#Facultad de sociales
            let isOrganizator = rankUser === 'organizador'? 1 : 0;
    
            createRowOnDatabaseUser(name, email, telefono, password, idFacultad, isOrganizator,() => {
                if (err) callback(err, 'Error añadiendo registro a la BD')
                else callback(null);
            })
        }

    }

    createRowOnDatabaseUser(name, email, telefono, password, idFacultad, isOrganizator, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `INSERT INTO usuarios (nombre, correo, telefono, contrasena, es_organizador, id_facultad)
                                    VALUES (${name}, ${email},${telefono},${password},${isOrganizator},${idFacultad})`
                connection.query(stringQuery, function (err, tot) {
                    connection.release();
                    if (err) callback(err);
                    else callback(null);
                           
                })
            }
        })
    }

    checkUniqueUserEmail(email, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT COUNT(*) as total FROM usuarios WHERE correo = ${email}`
                connection.query(stringQuery, function (err, tot) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        let total;
                        tot.map(ele => total = ele.total);
                        callback(null,total);
                    }        
                })
            }
        })
    }

    checkUniqueUserPhone(phone, callback){
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
                        callback(null,total);
                    } 
                })
            }
        })
    }

    getFacultades(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT * FROM facultades"
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null,resultado.map(ele => ({ id: ele.id, nombre: ele.nombre })))
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
                                    WHERE e.id = ${id}`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null,resultado.map(ele => ({  id:ele.id,
                                                                titulo: ele.titulo,
                                                                descripcion: ele.descripcion,
                                                                fecha: ele.fecha,
                                                                precio: ele.precio,
                                                                hora: ele.hora,
                                                                ubicacion: ele.ubicacion,
                                                                capacidad_maxima: ele.capacidad_maxima,
                                                                id_organizador: ele.id_organizador,
                                                                ocupacion: ele.total
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
                    else callback(null,resultado.map(ele => ({id:ele.id, nombre:ele.nombre})));
                })
            }
        })
    }

    getCategories(callback) {
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT * FROM categorias`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null,resultado.map(ele => ({id:ele.id, nombre:ele.nombre})));
                });
            }
        })
    }

    getOcupacion(idEvento, callback){
        this.pool.getConnection((err, connection) =>{
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT COUNT(*) as ocupacion FROM inscripciones WHERE id_evento=${idEvento} AND esta_lista_espera=0`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null,resultado.map(ele => ({ocupacion: ele.ocupacion})));
                });
            }
        })
    }

    getEventos(callback){
        this.pool.getConnection((err, connection) =>{
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT e.*, COALESCE(COUNT(i.id_usuario), 0) AS total 
                                    FROM eventos e LEFT JOIN inscripciones i 
                                    ON i.id_evento = e.id 
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
                            ocupacion: evento.total
                        }));

                        callback(null,mappedResults);
                    }
                });
            }
        });
    }

    getMaxPrice(callback){
        this.pool.getConnection((err, connection) =>{
            if (err) callback(err, null);
            else {
                let stringQuery = `SELECT MAX(precio) as max_price FROM eventos`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else callback(null,resultado[0]);
                    
                });
            }
        });
    }
}
module.exports = DAO