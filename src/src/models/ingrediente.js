const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
    Descripcion: { type: String, required: true },    
});

module.exports = mongoose.model('ingrediente',recipeSchema);