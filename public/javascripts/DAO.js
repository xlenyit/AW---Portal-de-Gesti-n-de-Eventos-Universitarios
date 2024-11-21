const sql = require("mysql")

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
                let stringQuery = `SELECT * FROM eventos WHERE id = ${id}`;
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
                                                                id_organizador: ele.id_organizador})));
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
                let stringQuery = `SELECT * FROM eventos`;
                connection.query(stringQuery, function (err, resultado) {
                    connection.release();
                    if (err) callback(err, null);
                    else {
                        const mappedResults = resultado.map(evento => ({
                            id: evento.id,
                            titulo: evento.titulo,
                            descripcion: evento.descripcion,
                            fecha: '2023',
                            precio: evento.precio,
                            hora: evento.hora,
                            ubicacion: evento.ubicacion,
                            capacidad_maxima: evento.capacidad_maxima,
                            id_organizador: evento.id_organizador,
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