'use strict';

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const RandExp = require('randexp')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const eventsRouter = require('./routes/events');
const accessibilityRouter = require('./routes/accessibility');
const session = require('express-session')

const app = express();
const PORT = process.env.PORT ?? 3000;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true)

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true  }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
    secret: new RandExp(/([a-zA-Z0-9]{16}){1-3}/).gen(), // Cambia esto por algo único y seguro
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Usa true si estás en HTTPS
    
}))
app.use((req, res, next) => {
    console.log('Datos de sesión en app:', req.session);
    next();
});




// Middleware para todo
app.use('/', (request, response, next) => {
    const DAO = require('./public/javascripts/DAO')
    const midao = new DAO('localhost','root','','aw_24');

    response.locals.user = request.session.user;

    midao.getBanned((err, banned) =>{
        if (err) console.error(err);
        for (let i = 0; i < banned.length; i++)
            if (request.ip == banned[i])
                return response.send('Estas Baneado por Inyeccion SQL');
        next();
    });

    
});

app.use('/',  (req, response, next) => {
    const DAO = require('./public/javascripts/DAO')
    const midao = new DAO('localhost','root','','aw_24');

    if (req.session.user) { 
        midao.getUserAccesibilitySettings(req.session.user, (err, accesibility) => {
            if (err || accesibility[0] == undefined) {
                response.locals.fontSize = '18px';
            }
            else{
                let fontSize;
                switch (accesibility[0].tamanyo_texto){
                    case 1:
                        fontSize = '12px';
                        break;
                    case 2:
                        fontSize = '18px';
                        break;
                    case 3:
                        fontSize = '25px';
                        break;
                    default:
                        fontSize = '18px';
                        break;
                }
                
                response.locals.fontSize = fontSize;
            }
        });
    }else
        response.locals.fontSize = '18px';

    next();
})


app.use( (req, response, next) => {
    const DAO = require('./public/javascripts/DAO')
    const midao = new DAO('localhost','root','','aw_24');
    if (req.session.user) { 
        midao.checkIfUserHasNotification(req.session.user, (err, hasNotification) => {
            if (err) {
                console.error('Error checking notifications:', err);
                response.locals.hasNotification = false; // Valor predeterminado en caso de error
            } else {
                response.locals.hasNotification = hasNotification;
            }
            next();
        });
    }else {
        // Si no hay usuario logueado, continuar el flujo
        response.locals.hasNotification = false;
        next();
    }
})
// Middleware para '/'
app.use('/', indexRouter);

// Middleware para '/users'
app.use('/users', usersRouter);

// Middleware para '/events'
app.use('/events', eventsRouter);

app.use('/accessibility', accessibilityRouter);


// En caso de que la página no exista, el estado pasa a ser el 404: FNF
// Un 'FinalWare'
app.use((req, res) =>{
    res.status(404).send('<h1>404</h1>')
})


app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});


module.exports = app;
