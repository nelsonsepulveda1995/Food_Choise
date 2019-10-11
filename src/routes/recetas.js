const express = require('express');
const router = express.Router();

const Recetas = require('../models/recetas')

//check if logged
const authCheck = (req, res, next) => {
    if(req.user){
        //if logged in
        next();
        
    } else {
        //console.log(req)
        //if user is not logged in
        res.redirect('/auth/login');
    }
};

router.get('/recetas', authCheck,async (req, res) => {
    const receta = await Recetas.find().sort( {date: 'desc'} );
    res.render('recetas/all-recetas', { receta });
})

router.get('/recetas/new', authCheck,(req, res) => {
    
    res.render('recetas/new-receta');
})

router.post('/recetas/new-receta', authCheck,async (req, res) => {
    console.log(req.body);
    const { title, descripcion,categoria} = req.body;
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
        const owen= req.user.id;
        const newReceta = new Recetas({ title, owen, descripcion, categoria });
        await newReceta.save();
        res.redirect('/recetas/mis-recetas');
    }
})

router.get('/recetas/mis-recetas', authCheck, async (req, res) => {  //falta agregar el id para la busqueda de recetas
    const usuario=req.user.id;
    console.log(usuario)
    const query={owen:usuario};
    const resultado= await Recetas.find(query);

    res.render('recetas/mis-recetas',{resultado});
})

//ruta para ingresar a la edicion
router.get('/recetas/editar/:id', authCheck, async (res,req)=>{
    const datosEditar= await Recetas.findById(req.params.id);
    res.render('recetas/editar-receta',{datosEditar});
});

router.put('/recetas/editar/:id', authCheck, async(res,req)=>{
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
router.delete('/recetas/delete/:id', authCheck, async(res,req)=>{ //hay que hacer que elimine tambien su calificacion si esta en un documento aparte
    await Recetas.findByIdAndRemove(req.parms.id);
    res.redirect('/recetas/mis-recetas');
})


module.exports = router;
