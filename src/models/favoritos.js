const mongoose = require('mongoose');
const { Schema } = mongoose;

const favoritosSchema = new Schema({
    id_usuario: { type: String, required: true },
    id_favoritos: { type: Array},
});

module.exports = mongoose.model('favoritos',favoritosSchema);