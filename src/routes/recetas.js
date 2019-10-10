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

router.get('/recetas/mis-recetas', (req, res) => {  //falta agregar el id para la busqueda de recetas
                                        
    res.render('recetas/mis-recetas');
})

//ruta para ingresar a la edicion
router.get('/recetas/editar/:id', async (res,req)=>{
    const datosEditar= await Recetas.findById(req.params.id);
    res.render('recetas/editar-receta',{datosEditar});
});

router.put('/recetas/editar/:id',async(res,req)=>{
    const{title,descripcion,categoria}=res.body; //se toma los datos del form
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
        res.render('recetas/editar-receta', {
            errors,
            title,
            descripcion
        })
    } else {
        await Recetas.findByIdAndUpdate(req.params.id,{title,descripcion,categoria});
        res.redirect('/recetas/mis-recetas');
    }
    
})
router.delete('/recetas/delete/:id',async(res,req)=>{ //hay que hacer que elimine tambien su calificacion si esta en un documento aparte
    await Recetas.findByIdAndRemove(req.parms.id);
    res.redirect('/recetas/mis-recetas');
})


module.exports = router;