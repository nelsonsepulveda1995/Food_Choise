const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema=new Schema({
    id:{ type:Number, required:true},
})

module.exports = mongoose.model('Usuario', UserSchema);