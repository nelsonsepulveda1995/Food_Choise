const mongoose = require('mongoose');
const { Schema } = mongoose;

const visitasSchema = new Schema({
    id_receta: { type: String, required: true },
    id_visitantes: { type: Array, required: true },
});

module.exports = mongoose.model('visitas',visitasSchema);