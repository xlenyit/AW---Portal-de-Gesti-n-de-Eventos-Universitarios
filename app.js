'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const session = require('express-session')

const app = express();
const PORT = process.env.PORT ?? 3000;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true  }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
    secret: '31791hjnlkdnasp', // Cambia esto por algo único y seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Usa true si estás en HTTPS
}))


// Middleware para '/'
app.use('/', indexRouter);

// Middleware para '/users'
app.use('/users', usersRouter);

// Middleware para '/events'
app.use('/events', eventsRouter);


// En caso de que la página no exista, el estado pasa a ser el 404: FNF
// Un 'FinalWare'
app.use((req, res) =>{
    res.status(404).send('<h1>404</h1>')
})


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


module.exports = app;
