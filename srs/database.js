//Configuracion de la BD

const mongoose=require('mongosse');

mongoose.connect('mongofd://localhost',{
    useCreateIndex:true,
    useNewUrlParser: true, 
    useFindAndModify: false
})

.then(db =>console.log('conectado'))
.cathc(err =>console.log(err))