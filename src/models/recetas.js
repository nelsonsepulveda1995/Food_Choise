const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({  //falta agregar ingredientes, calificacion, pasos, fotos, etc
    title: { type: String, required: true },
    owen:{ type:String ,required:true},
    descripcion: { type: String, required: true },
    date: { type: Date, default: Date.now },
    categoria: {type: String, require: true},
    imagenURL:{type: String, required: true},   //url de la imagen dada por cloudinary
    imagenCloud:{type:String, required: true},   //id unico de la foto guardada en cloudinari para poder borrarla
    ingredientes:{type:Array,required:true}
});

module.exports = mongoose.model('receta',recipeSchema);