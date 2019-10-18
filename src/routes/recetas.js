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


router.get('/recetas',async (req, res) => {
    const receta = await Recetas.find().sort( {date: 'desc'} );
    //var categRec = await Categoria.findById(receta.categoria);
    for (let i = 0; i < receta.length; i++) {
        var categRec = await Categoria.findById(receta[i].categoria);
        receta[i].categoria = categRec.descripcion;
    }
    if (req.user){
        res.render('recetas/all-recetas', { receta , user: req.user});
    }else{
        res.render('recetas/all-recetas', { receta });
    }
})

router.get('/recetas/ver/:id',async (req, res) => {
    const receta = await Recetas.findById(req.params.id).sort( {date: 'desc'} );
    var categRec = await Categoria.findById(receta.categoria);
    if (req.user){
        res.render('recetas/ver-receta', { receta , user:req.user, categRec});
    }else{
        res.render('recetas/ver-receta', { receta , categRec});
    }
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
    console.log("Elementos seleccionados: ")
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
    if(!req.body.ingredientes){
        errors.push({text: 'Selecciona al menos un ingrediente'});
    }

    
    if (errors.length > 0) {
        res.render('recetas/new-receta', {
            errors,
            user:req.user,
            title,
            descripcion,
            categoria
        })
    } else {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path); //esta linea sube el archivo a cloudinary y guarda los datos resultantes
        console.log("RESULTADO UPLOAD: "+resultado);
        const owen= req.user.id;
        const ingredientes = req.body.ingredientes;
        const newReceta = new Recetas({ 
            title, 
            owen, 
            descripcion, 
            categoria,
            ingredientes,
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
    const resultado= await Recetas.find(query).sort( {date: 'desc'} );

    res.render('recetas/mis-recetas',{resultado, user:req.user});
})

//ruta para ingresar a la edicion
router.get('/recetas/editar/:id', authCheck, async (req,res)=>{
    const datosEditar= await Recetas.findById(req.params.id);
    const errors = [];
    if (req.user.id == datosEditar.owen){
        //Obtengo todas las categorias       
        const cat = await Categoria.find();

        //Obtengo todos los ingredientes
        const ing = await Ingrediente.find();
        res.render('recetas/editar-receta',{datosEditar, user:req.user,cat,ing});
    }else{
        errors.push({text: 'Usted no tiene autorización para editar esta receta'});
    }
    if (errors.length > 0){
        res.render(`recetas/error`, {
            errors,
            user:req.user
        })
    }
});

router.put('/recetas/editar', authCheck, async(req,res)=>{
    const{title,descripcion,categoria}=req.body; //se toma los datos del form
    if (title) {
        await Recetas.findByIdAndUpdate(req.query.id,{title});
    }
    if (descripcion) {
        await Recetas.findByIdAndUpdate(req.query.id,{descripcion});
    }
    if (categoria) {
        await Recetas.findByIdAndUpdate(req.query.id,{categoria});
    }
    if (req.body.ingredientes){
        await Recetas.findByIdAndUpdate(req.query.id,{ingredientes: req.body.ingredientes});
    }

    if(req.file){
        const resultado = await cloudinary.v2.uploader.upload(req.file.path);
        await Recetas.findByIdAndUpdate(req.query.id,{imagenURL:resultado.url,imagenCloud:resultado.public_id});
        await fs.unlink(req.file.path);
    }
    res.redirect('/recetas/mis-recetas');
    
})
router.delete('/recetas/delete', authCheck, async(req,res)=>{ //hay que hacer que elimine tambien su calificacion si esta en un documento aparte
    const usuario=req.user.id;
    const resultado= await Recetas.findById(req.query.id);
    const errors = [];
    if (usuario == resultado.owen){
        await Recetas.findByIdAndRemove(req.query.id); //borra la receta de la base
        await cloudinary.v2.uploader.destroy(resultado.imagenCloud);
        res.redirect('/recetas/mis-recetas');
    }else{
        errors.push({text: 'Usted no tiene autorización para eliminar esta receta'});
    }
    if (errors.length > 0){
        res.render(`recetas/error`, {
            errors,
            user:req.user
        })
    }
});


//rutas de busqueda

router.get('/busqueda/1',(req,res)=>{   //busqueda por titulo

})

router.get('/busqueda/2',(req,res)=>{  //busqueda por ingredientes
    
})
router.post('/busqueda/2',async(req,res)=>{ //donde llega el formulario de ingredientes
    const ing=await Ingrediente.find();
    console.log(ing);
    res.send('recibido');
})

router.get('/busqueda/3', async(req,res)=>{   //busqueda por categoria
    const cat=await Categoria.find();
    console.log(cat);
    res.render('recetas/buscar-categoria',{cat, user: req.user});
})
router.post('/busqueda/3', async(req,res)=>{  //donde llega el formulario de categoria
    console.log(req.body);
    res.send('recibido');
})
router.get('/recetas/favoritos',(res,req)=>{   //lista favoritos
    
})

module.exports = router;
