const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({  //falta agregar ingredientes, calificacion, pasos, fotos, etc
    title: { type: String, required: true }, 
    owen:{ type:String ,required:true},
    owenImg:{ type:String},
    descripcion: { type: String, required: true },
    date: { type: Date, default: Date.now },
    ingredientes: {type: Object, require: true},
    categoria: {type: String, require: true},
    subcategoria: {type: Boolean},
    padre: {type: String},
    imagenURL:{type: String, required: true},   //url de la imagen dada por cloudinary
    imagenCloud:{type:String, required: true},   //id unico de la foto guardada en cloudinari para poder borrarla
    calificacion:{type:Number},
    visitas:{type:Number}
});

module.exports = mongoose.model('receta',recipeSchema);