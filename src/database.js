const mongoose = require('mongoose');
const keys = require('./keys')

mongoose.connect(keys.mongodb.dbURI, () =>{
})
  .then(db => console.log('Conectado a la base de datos MongoDB'))
  .catch(err => console.log(err));

/*mongoose.connect('mongodb://localhost/recipes-db-app', {    
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
    .then(db => console.log('DB is connected'))
    .catch(err => console.log(err));*/