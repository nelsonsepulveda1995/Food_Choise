const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');

// Inicializaciones
const app = express();

// Configuracion
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.handlebars', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.handlebars'
}));
app.set('view engine', '.handlebars');

// middlewares
app.use(express.urlencoded({extended: false}));
app.use(methodOverride('_method'));
app.use(session({
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



// Server is listening
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
  });
  
