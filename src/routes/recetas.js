const express = require('express');
const router = express.Router();
const fs=require('fs-extra');   //file system sirve para borrar los archivos temporales

const Recetas = require('../models/recetas');
const Categoria = require('../models/categoria');
const Ingrediente = require('../models/ingrediente');
const cloudinary = require('cloudinary'); 

cloudinary.config({             //sesion de cloudinary
    cloud_name:'elchetodelciber95',
    api_key:'193479116246688',
    api_secret:'AihAtz1kcPn-J5EIMk8AJrvPNzM'
})


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
    res.render('recetas/all-recetas', { receta, user:req.user});
})

router.get('/recetas/new', authCheck,async (req, res) => {
    //Obtengo todas las categorias       
    const cat = await Categoria.find();
    
    //Obtengo todos los ingredientes
    const ing = await Ingrediente.find();
    
    res.render('recetas/new-receta',{user:req.user,cat,ing} );
})

router.post('/recetas/new-receta', authCheck,async (req, res) => {
    const { title, descripcion,categoria} = req.body;
    const errors = [];
    if (!title) {
        errors.push({text: 'Completa el titulo'});
    } 
    if (!descripcion) {
        errors.push({text: 'Escribe una descripcion'});
    }
    if (!categoria) {
        errors.push({text: 'Selecciona una categoria'});
    }
    if(categoria<1||categoria>5){
        errors.push({text: 'Selecciona una categoria valida'});
    }
    if(!req.file){                                          //valida que se mande una imagen al crear la receta (agregar cuando se edita editar)
        errors.push({text: 'Selecciona una imagen'});
    }
    
    if (errors.length > 0) {
        res.render('recetas/new-receta', {
            errors,
            user:req.user,
            title,
            descripcion,
            categoria,
        })
    } else {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path); //esta linea sube el archivo a cloudinary y guarda los datos resultantes
        console.log("RESULTADO UPLOAD: "+resultado);
        const owen= req.user.id;
        const newReceta = new Recetas({ 
            title, 
            owen, 
            descripcion, 
            categoria,
            imagenURL: resultado.url,
            imagenCloud: resultado.public_id 
        });
        console.log("NUEVA RECETA: "+newReceta);
        await newReceta.save();
        await fs.unlink(req.file.path);
        res.redirect('/recetas/mis-recetas');
    }
})

router.get('/recetas/mis-recetas', authCheck, async (req, res) => {  //falta agregar el id para la busqueda de recetas
    const usuario=req.user.id;
    const query={owen:usuario};
    const resultado= await Recetas.find(query);
    console.log(resultado[0].descripcion)

    res.render('recetas/mis-recetas',{resultado, user:req.user});
})

//ruta para ingresar a la edicion
router.get('/recetas/editar/:id', authCheck, async (res,req)=>{
    const datosEditar= await Recetas.findById(req.params.id);
    res.render('recetas/editar-receta',{datosEditar, user:req.user});
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
            user:req.user,
            title,
            descripcion
        })
    } 
    else{
        if(!req.file){  //si se actualiza sin cargar una foto nueva (falta testing)
            await Recetas.findByIdAndUpdate(req.params.id,{title,descripcion,categoria});
            res.redirect('/recetas/mis-recetas');
        }
        else{       //si al actualizar se encuentra una foto (falta testing)
            const resultado = await cloudinary.v2.uploader.upload(req.file.path);
            await Recetas.findByIdAndUpdate(req.params.id,{title,descripcion,categoria,imagenURL:resultado.url,imagenCloud:resultado.public_id});
            await fs.unlink(req.file.path);
            res.redirect('/recetas/mis-recetas');
        }
    }
    
})
router.delete('/recetas/delete/:id', authCheck, async(res,req)=>{ //hay que hacer que elimine tambien su calificacion si esta en un documento aparte
    const respuesta= await Recetas.findByIdAndRemove(req.parms.id); //borra la receta de la base
    await cloudinary.v2.uploader.destroy(respuesta.imagenCloud) //borra la foto de la nube
    res.redirect('/recetas/mis-recetas');
});

module.exports = router;
