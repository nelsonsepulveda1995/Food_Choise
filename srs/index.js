const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');

// Inicializaciones
const app = express();
require('./database');

// Configuracion
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.handlebars', exphbs({
  defaultLayout: 'main',   //es el archivo html/handlebars que define el marco comun en todas las vistas
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'), //donde esta el codigo reutilizable html que no es el marco comun
  extname: '.handlebars'
}));
app.set('view engine', '.handlebars');

// middlewares
app.use(express.urlencoded({extended: false})); //para entender los datos que el usuario manda al servidor /false: no acepta imagenes (se puede cambiar)
app.use(methodOverride('_method')); //sirve para que los formularios html puedan usar put o delete ademas de get y push
app.use(session({  //sirve para gurdar la sesion de los usuarios temporalmente y que al recargar no se pierdan los datos de este
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

//Variables globales



// Rutas   (directorios donde se encuentran las URLs)
app.use(require('./routes'));
app.use(require('./routes/users'));
app.use(require('./routes/notes'));

//Archivos estaticos
app.use(express.static(path.join(__dirname,'public')))


// Server is listening
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
  });
  
