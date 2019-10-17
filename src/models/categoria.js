const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
    descripcion: { type: String, required: true }  
});

module.exports = mongoose.model('categoria',recipeSchema);