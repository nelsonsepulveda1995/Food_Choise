const express = require('express');
const router = express.Router();
const fs = require('fs-extra'); //file system sirve para borrar los archivos temporales
const Users = require('../models/user-model')
const Recetas = require('../models/recetas');
const Categoria = require('../models/categoria');
const Calificacion = require('../models/calificacion');
const Ingrediente = require('../models/ingrediente');
const cloudinary = require('cloudinary');

cloudinary.config({ //sesion de cloudinary
    cloud_name: 'elchetodelciber95',
    api_key: '193479116246688',
    api_secret: 'AihAtz1kcPn-J5EIMk8AJrvPNzM'
})


//check if logged
const authCheck = (req, res, next) => {
    if (req.user) {
        //if logged in
        next();

    } else {
        //console.log(req)
        //if user is not logged in
        res.redirect('/auth/login');
    }
};


router.get('/recetas', async (req, res) => {
    const receta = await Recetas.find().sort({
        date: 'desc'
    });
    //var categRec = await Categoria.findById(receta.categoria);
    for (let i = 0; i < receta.length; i++) {
        var categRec = await Categoria.findById(receta[i].categoria);
        receta[i].categoria = categRec.descripcion;
        var owenReceta = await Users.findById(receta[i].owen);
        receta[i].owen = owenReceta.username;
        receta[i].owenImg = owenReceta.thumbnail;
        const calificacionesProm = await Calificacion.find({
            id_receta: receta[i]._id
        });
        var totalCal = 0
        for (let i = 0; i < calificacionesProm.length; i++) {
            totalCal = totalCal + calificacionesProm[i].calificacion;
        }
        var promCal = totalCal / calificacionesProm.length;
        receta[i].calificacion = promCal;
        console.log(receta[i].calificacion)
    }
    if (req.user) {
        res.render('recetas/all-recetas', {
            receta,
            user: req.user
        });
    } else {
        res.render('recetas/all-recetas', {
            receta
        });
    }
})

router.get('/recetas/ver/:id', async (req, res) => {
    const receta = await Recetas.findById(req.params.id);
    var categRec = await Categoria.findById(receta.categoria);
    const calificaciones = await Calificacion.findOne({
        id_calificante: req.user,
        id_receta:req.params.id
    });
    const calificacionesProm = await Calificacion.find({
        id_receta: req.params.id
    });
    var totalCal = 0
    for (let i = 0; i < calificacionesProm.length; i++) {
        totalCal = totalCal + calificacionesProm[i].calificacion;
    }
    var promCal = totalCal / calificacionesProm.length;
    console.log(promCal);
    if (req.user && calificaciones) {
        console.log("califico")
        res.render('recetas/ver-receta', {
            receta,
            user: req.user,
            categRec,
            calificaciones,
            promCal
        });
    } else if (req.user) {
        console.log("no califico")
        res.render('recetas/ver-receta', {
            receta,
            user: req.user,
            categRec,
            promCal
        });
    } else {
        console.log("no es usuario")
        res.render('recetas/ver-receta', {
            receta,
            categRec,
            promCal
        });
    }
})

router.get('/recetas/new', authCheck, async (req, res) => {
    //Obtengo todas las categorias       
    const cat = await Categoria.find();

    //Obtengo todos los ingredientes
    const ing = await Ingrediente.find();

    res.render('recetas/new-receta', {
        user: req.user,
        cat,
        ing
    });
})

router.post('/recetas/new-receta', authCheck, async (req, res) => {
    const {
        title,
        descripcion,
        categoria
    } = req.body;
    console.log("Elementos seleccionados: ")
    const errors = [];
    if (!title) {
        errors.push({
            text: 'Completa el titulo'
        });
    }
    if (!descripcion) {
        errors.push({
            text: 'Escribe una descripcion'
        });
    }
    if (!categoria) {
        errors.push({
            text: 'Selecciona una categoria'
        });
    }
    if (categoria < 1 || categoria > 5) {
        errors.push({
            text: 'Selecciona una categoria valida'
        });
    }
    if (!req.file) { //valida que se mande una imagen al crear la receta (agregar cuando se edita editar)
        errors.push({
            text: 'Selecciona una imagen'
        });
    }
    if (!req.body.ingredientes) {
        errors.push({
            text: 'Selecciona al menos un ingrediente'
        });
    }


    if (errors.length > 0) {
        res.render('recetas/new-receta', {
            errors,
            user: req.user,
            title,
            descripcion,
            categoria
        })
    } else {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path); //esta linea sube el archivo a cloudinary y guarda los datos resultantes
        console.log("RESULTADO UPLOAD: " + resultado);
        const owen = req.user.id;
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
        console.log("NUEVA RECETA: " + newReceta);
        await newReceta.save();
        await fs.unlink(req.file.path);
        res.redirect('/recetas/mis-recetas');
    }
})

router.get('/recetas/mis-recetas', authCheck, async (req, res) => { //falta agregar el id para la busqueda de recetas
    const usuario = req.user.id;
    const query = {
        owen: usuario
    };
    const resultado = await Recetas.find(query).sort({
        date: 'desc'
    });

    res.render('recetas/mis-recetas', {
        resultado,
        user: req.user
    });
})

//ruta para ingresar a la edicion
router.get('/recetas/editar/:id', authCheck, async (req, res) => {
    const datosEditar = await Recetas.findById(req.params.id);
    const errors = [];
    if (req.user.id == datosEditar.owen) {
        //Obtengo todas las categorias       
        const cat = await Categoria.find();

        //Obtengo todos los ingredientes
        const ing = await Ingrediente.find();
        res.render('recetas/editar-receta', {
            datosEditar,
            user: req.user,
            cat,
            ing
        });
    } else {
        errors.push({
            text: 'Usted no tiene autorización para editar esta receta'
        });
    }
    if (errors.length > 0) {
        res.render(`recetas/error`, {
            errors,
            user: req.user
        })
    }
});

router.put('/recetas/editar', authCheck, async (req, res) => {
    const {
        title,
        descripcion,
        categoria
    } = req.body; //se toma los datos del form
    if (title) {
        await Recetas.findByIdAndUpdate(req.query.id, {
            title
        });
    }
    if (descripcion) {
        await Recetas.findByIdAndUpdate(req.query.id, {
            descripcion
        });
    }
    if (categoria) {
        await Recetas.findByIdAndUpdate(req.query.id, {
            categoria
        });
    }
    if (req.body.ingredientes) {
        await Recetas.findByIdAndUpdate(req.query.id, {
            ingredientes: req.body.ingredientes
        });
    }

    if (req.file) {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path);
        await Recetas.findByIdAndUpdate(req.query.id, {
            imagenURL: resultado.url,
            imagenCloud: resultado.public_id
        });
        await fs.unlink(req.file.path);
    }
    res.redirect('/recetas/mis-recetas');

})
router.delete('/recetas/delete', authCheck, async (req, res) => { //hay que hacer que elimine tambien su calificacion si esta en un documento aparte
    const usuario = req.user.id;
    const resultado = await Recetas.findById(req.query.id);
    const errors = [];
    if (usuario == resultado.owen) {
        await Recetas.findByIdAndRemove(req.query.id); //borra la receta de la base
        await cloudinary.v2.uploader.destroy(resultado.imagenCloud);
        res.redirect('/recetas/mis-recetas');
    } else {
        errors.push({
            text: 'Usted no tiene autorización para eliminar esta receta'
        });
    }
    if (errors.length > 0) {
        res.render(`recetas/error`, {
            errors,
            user: req.user
        })
    }
});
// -----------------------------           RUTAS DE CALIFICACIÓN            ----------------------------------------------------------------------//

router.post('/recetas/calificar/:id', async (req, res) => {

    const {
        calif
    } = req.body
    const receta = req.params.id;
    const user = req.user.id;
    const calificaciones = await Calificacion.find({
        id_calificante: user,
        id_receta: receta
    });
    console.log(calificaciones)
    if (calificaciones.length == 0) {
        const newCalif = new Calificacion({
            id_receta: receta,
            id_calificante: user,
            calificacion: parseInt(calif)
        });
        await newCalif.save();
        res.send(`<script>alert("Calificacion de la receta completada"); window.location.href = "/recetas/ver/${receta}"</script>`);
    } else {
        console.log("ya calificó")
        res.send(`<script>alert("Ya ha calificado anteriormente esta receta"); window.location.href = "/recetas/ver/${receta}"</script>`);
    }



})

// -----------------------------           RUTAS DE BUSQUEDA            ----------------------------------------------------------------------//

router.post('/busqueda/1', async (req, res) => { //busqueda por titulo
    const {
        title
    } = req.body;
    console.log(title);
    const errors = [];
    if (!title) {
        errors.push({
            text: 'seleccione al menos un titulo'
        });
        res.render('recetas/all-recetas', {
            errors,
            user: req.user
        })
    } else {
        const Receta = await Recetas.find({
            title: {
                $in: title
            }
        })
        for (let i = 0; i < Receta.length; i++) {
            var categRec = await Categoria.findById(Receta[i].categoria);
            Receta[i].categoria = categRec.descripcion;
            var owenReceta = await Users.findById(Receta[i].owen);
            Receta[i].owen = owenReceta.username;
            Receta[i].owenImg = owenReceta.thumbnail;
        }
        console.log('resultados de receta:');
        console.log(Receta);

        res.render("recetas/recetas-titulo", {
            Receta,
            title
        });
    }
})

router.get('/busqueda/2', async (req, res) => { //busqueda por ingredientes
    const ing = await Ingrediente.find().sort({
        Descripcion: 'asc'
    });
    console.log(ing);
    res.render('recetas/buscar-ingredientes', {
        ing,
        user: req.user
    });
})
router.post('/busqueda/2', async (req, res) => { //donde llega el formulario de ingredientes
    const {
        ingrediente
    } = req.body;
    const ing = await Ingrediente.find().sort({
        descripcion: 'asc'
    });
    console.log(ingrediente);

    const errors = [];
    if (!ingrediente) {
        errors.push({
            text: 'seleccione al menos un Ingrediente'
        });
        res.render('recetas/buscar-ingredientes', {
            ing,
            errors,
            user: req.user
        })
    } else {
        const Receta = await Recetas.find({
            ingredientes: {
                $in: ingrediente
            }
        })
        for (let i = 0; i < Receta.length; i++) {
            var categRec = await Categoria.findById(Receta[i].categoria);
            Receta[i].categoria = categRec.descripcion;
            var owenReceta = await Users.findById(Receta[i].owen);
            Receta[i].owen = owenReceta.username;
            Receta[i].owenImg = owenReceta.thumbnail;
        }
        console.log('Recetas resultado de la busqueda');
        console.log(Receta);
        res.render('recetas/recetas-ingredientes', {
            Receta,
            ing,
            user: req.user
        });
    }
})

router.get('/busqueda/3', async (req, res) => { //busqueda por categoria
    const cat = await Categoria.find().sort({
        descripcion: 'asc'
    });;
    console.log(cat);
    res.render('recetas/buscar-categoria', {
        cat,
        user: req.user
    });
})
router.post('/busqueda/3', async (req, res) => { //falta completar !!!!!
    const {
        categoria
    } = req.body;
    const cat = await Categoria.find().sort({
        descripcion: 'asc'
    }); //la busqueda se ordena de la 'a' a la 'z'
    console.log("categoria tomada del body: ");
    console.log(categoria);
    console.log("categorias de la base de datos: ")
    console.log(cat)

    const errors = [];
    if (!categoria) {
        errors.push({
            text: 'seleccione al menos una categoria'
        });
        res.render('recetas/buscar-categoria', {
            cat,
            errors,
            user: req.user
        })
    } else {
        const Receta = await Recetas.find({
            categoria: {
                $in: categoria
            }
        }) //ingresar parametro de busqueda (revisar si funciona)
        for (let i = 0; i < Receta.length; i++) {
            var categRec = await Categoria.findById(Receta[i].categoria);
            Receta[i].categoria = categRec.descripcion;
            var owenReceta = await Users.findById(Receta[i].owen);
            Receta[i].owen = owenReceta.username;
            Receta[i].owenImg = owenReceta.thumbnail;
        }
        console.log("recetas con la categoria " + categoria + " : ");
        console.log(Receta);
        res.render("recetas/recetas-categoria", {
            Receta,
            cat,
            user: req.user
        });
    }
})
router.get('/recetas/favoritos', (res, req) => { //lista favoritos

})

module.exports = router;