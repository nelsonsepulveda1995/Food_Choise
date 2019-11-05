const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
    tipo: {type: String, required: true},
    icono: {type: String, required: true},
    descripcion: { type: String, required: true } ,
    subcategorias: {type: Object, required: false}
});

module.exports = mongoose.model('categoria',recipeSchema);