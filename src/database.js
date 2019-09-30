const mongoose = require('mongoose');

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://elias:<elias>@foodchoise-sybkf.gcp.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    console.log("conectado wey")
  client.close();
});

/*mongoose.connect('mongodb://localhost/recipes-db-app', {    
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
    .then(db => console.log('DB is connected'))
    .catch(err => console.log(err));*/