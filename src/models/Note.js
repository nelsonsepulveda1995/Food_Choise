const mongoose = require('mongoose');
const { Schema } = mongoose;

const NoteSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const recipeSchema = new Schema({  //falta agregar ingredientes, calificacion, pasos,categoria
    nombre: { type: String, required: true },
    descripcion: { type: String, required: true },
    date: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Note', NoteSchema);
module.exports = mongoose.model('receta',recipeSchema);