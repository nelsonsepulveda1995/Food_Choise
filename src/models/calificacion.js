const mongoose = require('mongoose');
const { Schema } = mongoose;

const rateSchema = new Schema({
    id_receta: { type: String, required: true },
    id_calificante: { type: String, required: true },
    calificacion: { type: Number, required: true }
});

module.exports = mongoose.model('calificacion',rateSchema);