const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const Handlebars = require('handlebars')
const methodOverride = require('method-override');
const session = require('express-session');
const cookieSession = require('cookie-session');
const mongoose = require('mongoose');
const passport = require('passport');
const passportSetup = require('./passport-setup')
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const keys = require('./keys');
const Usuario = require('./models/user-model');
const uuid=require('uuid/v4');

const morgan=require('morgan'); //trabajar imagenes
const multer=require('multer');


//helpers custom
Handlebars.registerHelper('if_eq', function(a, b, opts) {
    if(a == b) // Or === depending on your needs
        return opts.fn(this);
    else
        return opts.inverse(this);
});

//Initializations
const app = express();
//require('./database');

//Cookie Sessions
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys:[keys.session.cookieKey]
}))

//Inicializacion Passport
app.use(passport.initialize());
app.use(passport.session());

//set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

//connect to mongodb
mongoose.connect(keys.mongodb.dbURI, {    
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
    .then(db => console.log('Conectado a MongoDB Atlas'))
    .catch(err => console.log(err));


//Settings 
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs'
}))
app.set('view engine', '.hbs');



//MiddleWares
app.use(morgan('dev'));
const storage=multer.diskStorage({      //esta funcion toma las fotos y les cambia el nombre por uno ramdom para evitar duplicados
    destination: path.join(__dirname,'public/uploads'),
    filename: (req,file,cb,filename)=>{
        cb(null,uuid()+ path.extname(file.originalname));
    }
})
app.use(multer({storage}).single('imagen')) //toma una sola foto

app.use(express.urlencoded({extended: false}));     //false ya que multer es quien se encarga de las fotos
app.use(methodOverride('_method'));
app.use(session({
    secret: 'mysecretapp',
    resave: false,
    saveUninitialized: false
}));

//create home route
app.get('/', (req, res) => {
    res.redirect('/recetas');
});

//Routes
//app.use(require('./routes/index'));
app.use(require('./routes/recetas'));

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

//Server is listenning
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});