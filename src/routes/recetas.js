const express = require('express');
const router = express.Router();

const Recetas = require('../models/recetas')

router.get('/recetas', async (req, res) => {
    const receta = await Recetas.find().sort( {date: 'desc'} );
    res.render('recetas/all-recetas', { receta });
})

router.get('/recetas/new', (req, res) => {
    res.render('recetas/new-receta');
})

router.post('/recetas/new-receta', async (req, res) => {
    console.log(req.body);
    const { title, descripcion,categoria } = req.body;
    const errors = [];
    if (!title) {
        errors.push({text: 'Please write a title'});
    } 
    if (!descripcion) {
        errors.push({text: 'Please write a descripcion'});
    }
    if (!categoria) {
        errors.push({text: 'Please select a category'});
    }
    if (errors.length > 0) {
        res.render('recetas/new-receta', {
            errors,
            title,
            descripcion
        })
    } else {
        const newReceta = new Recetas({ title, descripcion, categoria });
        await newReceta.save();
        res.redirect('/recetas/mis-recetas');
    }
})

const listacategoria=["","","",""]; //cargar aqui las categorias para la verificacion

router.get('/recetas/mis-recetas/edit:id', (req, res) => {  //falta agregar el id para la busqueda de recetas
    const x=Recetas.findById(req.params.id);             //revisar!!!
    rs.render('recetas/editar-receta',{x});
})
router.post('/recetas/mis-recetas/edit:id',(req,res) =>{
    const {title,descripcion,date,categoria}=req.body;
    const errors=[];
    if(title.length<2){
        errors.push({text:'Titulo demasiado corto'})
    }
    if(descripcion.length==""){
        errors.push({text:'Debetener una descripcion'})
    }
    if(categoria in listacategoria){
        errors.push({text:'Error al cargar la categoria'})
    }

})



module.exports = router;