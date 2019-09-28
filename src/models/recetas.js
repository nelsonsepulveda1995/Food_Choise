const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({  //falta agregar ingredientes, calificacion, pasos,categoria
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    date: { type: Date, default: Date.now },
    categoria: {type: String, require: true}
});

module.exports = mongoose.model('receta',recipeSchema);