//Configuracion de la BD

const mongoose=require('mongoose');

mongoose.connect('mongodb://localhost',{ //completar o cambiar la ruta para conctar a la base
    useCreateIndex:true,
    useNewUrlParser: true, 
    useFindAndModify: false
})

.then(db =>console.log('conectado'))
.cathc(err =>console.log(err))