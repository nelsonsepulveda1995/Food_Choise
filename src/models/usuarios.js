const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema=new Schema({
    id:{ type:Number, required:true}, //nose sise requiere mas que el id de usuario
    nombre:{type:String, required: true}
})

const LoginSchema=new Schema({
    email:{type:String, required: true},
    password:{type:String, required: true}
})

module.exports = mongoose.model('Usuario', UserSchema);
module.exports = mongoose.model('Login', LoginSchema);