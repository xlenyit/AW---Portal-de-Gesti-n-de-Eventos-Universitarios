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

    getIdAndPasswordFromEmail(email, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `SELECT id, contrasena FROM usuarios WHERE correo = ?`
                connection.query(stringQuery, [email], function (err, data) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        callback(null,data[0]);
                    }        
                })
            }
        })
    }

    getIdFromEmail(email, callback){
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
                        callback(null,id);
                    }        
                })
            }
        })
    }
    
    
    checkUniqueUserEmail(email, callback){
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
    
    registerUser(userData, callback){
        // userdata has the structure:
        // {name, email, telefono, password, confirmPassword, facultad, rankUser}
        const {nombre, email, telefono, contrasena, confirmPassword, facultad, userType} = userData;

        // Antes que nada hemos de verificar que el email o telefono no existen ya en la BD
        // Aunque esta tenga valores UNIQUE para estos campos, mejor handlearlo aqui
        this.checkUniqueUserEmail(email, (err, found) => {
            if (err || found !== 0) return callback(err, 'Email repetido');
            this.checkUniqueUserPhone(telefono,  (err, found) =>{
                if (err || found !== 0) return callback(err, 'Telefono repetido');
                continueInsertion();
            });

        });

        const continueInsertion = () => {
            // Necesitamos coger el id de la facultad
            let idFacultad = facultad.split('#')[0]; //2#Facultad de sociales
            
            let isOrganizator = userType === 'organizador'? 1 : 0;
    
            this.createRowOnDatabaseUser(nombre, email, telefono, contrasena, idFacultad, isOrganizator,(err) => {
                if (err) callback(err, 'Error añadiendo registro a la BD')
                else callback(null);
            })
        }

    }

    createRowOnDatabaseUser(name, email, telefono, password, idFacultad, isOrganizator, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = `INSERT INTO usuarios (nombre, correo, telefono, contrasena, es_organizador, id_facultad, id_accesibilidad)
                                    VALUES (?, ?,${telefono},?,${isOrganizator},${idFacultad},1)` //Al registrar un usuario tendran la conf de accesibilidad 1 por defecto
                connection.query(stringQuery, [name, email, password], function (err, resultado) {
                    connection.release();
                    console.log("a",err)
                    if (err) callback(err);
                    else callback(null,resultado.insertId);
                           
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

    getUserById(idUser, callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery = "SELECT u.*, f.nombre as nombreFacultad FROM usuarios as u JOIN facultades as f ON u.id_facultad = f.id WHERE u.id = ?"
                connection.query(stringQuery, idUser, function (err, res) {
                    connection.release();
                    if (err) callback(err, null)
                    else callback(null,res[0])
                })
            }
        })
    }

    modifyUser(nombre, correo, telefono, facultad, es_org, id,  callback){
        this.pool.getConnection((err, connection) => {
            if (err) callback(err, null)
            else {
                let stringQuery= `UPDATE usuarios SET nombre = ?, correo = ?, telefono = ?, id_facultad = ?, es_organizador = ? WHERE id = ?`; 
                connection.query(stringQuery, [nombre, correo, telefono, facultad, es_org, id], function (err, res) {
                    connection.release();
                    console.log(facultad,err,res)
                    if (err) callback(err, null)
                    else callback(null,'Perfil actualizado correctamente');
                })
            }
        })
    }
}
module.exports = DAO