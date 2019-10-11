const mongoose = require('mongoose');
const { Schema } = mongoose;

const recipeSchema = new Schema({
    _id:{ type: String, required: true },
    descripcion: { type: String, required: true },    
});

module.exports = mongoose.model('categoria',recipeSchema);