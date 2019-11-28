const express = require('express');
const router = express.Router();
const fs = require('fs-extra'); //file system sirve para borrar los archivos temporales
const Users = require('../models/user-model')
const Recetas = require('../models/recetas');
const Categoria = require('../models/categoria');
const Calificacion = require('../models/calificacion');
const Favoritos = require('../models/favoritos');
const Visitas = require('../models/visitas')
const Ingrediente = require('../models/ingrediente');
const cloudinary = require('cloudinary');

cloudinary.config({ //sesion de cloudinary
    cloud_name: 'elchetodelciber95',
    api_key: '193479116246688',
    api_secret: 'AihAtz1kcPn-J5EIMk8AJrvPNzM'
})

Array.prototype.unique = function (a) {
    return function () {
        return this.filter(a)
    }
}(function (a, b, c) {
    return c.indexOf(a, b + 1) < 0
});

//check if logged
const authCheck = (req, res, next) => {
    if (req.user) {
        //if logged in
        next();

    } else {
        //
        //if user is not logged in
        res.redirect('/auth/google');
    }
};

//-----------------------------------------  RUTAS AJAXS --------------------------------------------------

router.get('/orderBy', async (req, res) => {
    var {
        key,
        arrayRecetas
    } = req.query;

    console.log(arrayRecetas)
    var receta = []
    if (!arrayRecetas) {
        if (key == 1) {
            receta = await Recetas.find().sort({
                date: 'desc'
            });
        } else if (key == 2) {
            receta = await Recetas.find().sort({
                visitas: 'desc'
            });
        } else {
            receta = await Recetas.find().sort({
                calificacion: 'desc'
            });

        }
    } else {
        arrayRecetas = arrayRecetas.split(',')
        if (key == 1) {
            console.log("busca por date")
            receta = await Recetas.find({
                _id: {
                    $in: arrayRecetas
                }
            }).sort({
                date: 'desc'
            });
        } else if (key == 2) {
            console.log("busca por visitas")
            receta = await Recetas.find({
                _id: {
                    $in: arrayRecetas
                }
            }).sort({
                visitas: 'desc'
            });
        } else {
            console.log("busca por calificacion")
            receta = await Recetas.find({
                _id: {
                    $in: arrayRecetas
                }
            }).sort({
                calificacion: 'desc'
            });

        }
    }


    //var categRec = await Categoria.findById(receta.categoria);
    for (let i = 0; i < receta.length; i++) {

        var categRec;
        if (receta[i].subcategoria) {
            categRec = await Categoria.findById(receta[i].padre);
            for (let j = 0; j < categRec.subcategorias.length; j++) {
                if (receta[i].categoria == categRec.subcategorias[j]._id) {
                    receta[i].categoria = categRec.subcategorias[j].descripcion;
                }
            }
        } else {
            categRec = await Categoria.findById(receta[i].categoria);
            receta[i].categoria = categRec.descripcion;
        }
        var owenReceta = await Users.findById(receta[i].owen);
        receta[i].owenName = owenReceta.username;
        receta[i].owenImg = owenReceta.thumbnail;
        const calificacionesProm = await Calificacion.find({
            id_receta: receta[i]._id
        });
        if (calificacionesProm.length > 0 && calificacionesProm) {
            var totalCal = 0
            for (let i = 0; i < calificacionesProm.length; i++) {
                totalCal = totalCal + calificacionesProm[i].calificacion;
            }
            var promCal = totalCal / calificacionesProm.length;
            receta[i].calificacion = promCal;

        }
    }

    res.send(order(receta));
})

function order(receta) {

    var html = '';
    receta.forEach(element => {
        dateHand = element.date.toString();
        html += `<input type="hidden" name="idRecetas" value="${element._id}">
                <div class="col-md-4 mt-5">
                    <div class="card zoom">
                        <p id="id_tarjetaReceta" style="display:none">${element._id}</p>
                        <a href="/recetas/ver/${element._id}" class="card-body">
                            <h4 class="card-title txt-centrado">
                                ${element.title}
                            </h4>
                            <div class="container">
                                <div class="row d-flex justify-content-center">
                                    <p id="promedio_calificacion_${element._id}" style="display:none">${element.calificacion}</p>
                                        <div class="form-check mr-3">
                                            <i class="fa fa-star-o fa-xs estrella" id="${element._id}prom1" aria-hidden="true"></i>
                                            <i class="fa fa-star-o fa-xs estrella" id="${element._id}prom2" aria-hidden="true"></i>
                                            <i class="fa fa-star-o fa-xs estrella" id="${element._id}prom3" aria-hidden="true"></i>
                                            <i class="fa fa-star-o fa-xs estrella" id="${element._id}prom4" aria-hidden="true"></i>
                                            <i class="fa fa-star-o fa-xs estrella" id="${element._id}prom5" aria-hidden="true"></i>
                                        </div>  
                                    </div>
                            </div> 
                            <h6 class="txt-centrado txt-categoria">
                                ${element.categoria}
                            </h6>
                            <br>
                            <img src="${element.imagenURL}" class="img-fluid img-completa rounded">
                            <h6 class="txt-centrado txt-categoria my-auto"><img class="img-circular" width="25" height="25" src="${element.owenImg}" alt="">${element.owen}</h6>
                            <h5 class="d-flex justify-content-center text-dark mt-2"><i class="fa fa-eye my-auto" aria-hidden="true"></i>${element.visitas}</h5>
                            <h6 id="date-${element._id}" class="txt-centrado text-dark mt-2"></h6>
                            <script>
                                dateHand = Date.parse("${dateHand}");
                                var options = {year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric", hour12: true};
                                dateHand = new Date(dateHand)
                                dateHand = dateHand.toLocaleString('es-ES', options);
                                $('#date-${element._id}').text(dateHand);
                            </script>
                        </a>
                    </div>
                </div>`
    });
    return html;
}

//------------------------------------------------ RUTA DE INICIO ---------------------------------------------------

router.get('/recetas', async (req, res) => {
    const receta = await Recetas.find().sort({
        date: 'desc'
    });

    var allCat = await Categoria.find()
    var ing = await Ingrediente.find()


    //var categRec = await Categoria.findById(receta.categoria);
    for (let i = 0; i < receta.length; i++) {
        var categRec;
        if (receta[i].subcategoria) {
            categRec = await Categoria.findById(receta[i].padre);
            for (let j = 0; j < categRec.subcategorias.length; j++) {
                if (receta[i].categoria == categRec.subcategorias[j]._id) {
                    receta[i].categoria = categRec.subcategorias[j].descripcion;
                }
            }
        } else {
            categRec = await Categoria.findById(receta[i].categoria);
            receta[i].categoria = categRec.descripcion;
        }
        var owenReceta = await Users.findById(receta[i].owen);
        receta[i].owenName = owenReceta.username;
        receta[i].owenImg = owenReceta.thumbnail;
        const calificacionesProm = await Calificacion.find({
            id_receta: receta[i]._id
        });
        if (calificacionesProm.length > 0 && calificacionesProm) {

            var totalCal = 0
            for (let i = 0; i < calificacionesProm.length; i++) {
                totalCal = totalCal + calificacionesProm[i].calificacion;
            }
            var promCal = totalCal / calificacionesProm.length;

            await Recetas.findByIdAndUpdate(receta[i]._id, {
                calificacion: promCal
            })
            receta[i].calificacion = promCal;

        } else {

            await Recetas.findByIdAndUpdate(receta[i]._id, {
                calificacion: 0
            })
        }

    }
    if (req.user) {
        //var allCat = await Categoria.find()  //CODIGO REPETIDO EN LINEA 137
        res.render('recetas/all-recetas', {
            allCat,
            receta,
            ing,
            user: req.user
        });
    } else {
        //var allCat = await Categoria.find() //CODIGO REPETIDO EN LINEA 137
        res.render('recetas/all-recetas', {
            allCat,
            ing,
            receta
        });
    }
})

//--------------------------------------- VER UNA RECETA ----------------------------------------------------------

router.get('/recetas/ver/:id', async (req, res) => {
    const receta = await Recetas.findById(req.params.id); //trae la receta elegida
    var favoritos = {}
    if (req.user) {
        favoritos = await Favoritos.findOne({
            id_usuario: req.user.id
        })
    }
    var categRec;

    if (receta.subcategoria) {
        categRec = await Categoria.findById(receta.padre);
        for (let j = 0; j < categRec.subcategorias.length; j++) {
            if (receta.categoria == categRec.subcategorias[j]._id) {
                receta.categoria = categRec.subcategorias[j].descripcion;
            }
        }
    } else {
        categRec = await Categoria.findById(receta.categoria);
        receta.categoria = categRec.descripcion;
    }
    const verVisitas = await Visitas.findOne({
        id_receta: req.params.id
    }); //trae las visitas de la receta elegida
    var visitasTotales = verVisitas.id_visitantes.length;
    await Recetas.findByIdAndUpdate(req.params.id, {
        visitas: visitasTotales
    })

    var visitante = 0

    verVisitas.id_visitantes.forEach(id => {
        if (req.user && id == req.user.id) {
            visitante = 1;
        }
    });

    if (req.user && visitante == 1) {

        const calificaciones = await Calificacion.findOne({
            id_calificante: req.user.id,
            id_receta: req.params.id
        });

        const calificacionesProm = await Calificacion.find({
            id_receta: req.params.id
        });
        var totalCal = 0
        for (let i = 0; i < calificacionesProm.length; i++) {
            totalCal = totalCal + calificacionesProm[i].calificacion;
        }
        var promCal = totalCal / calificacionesProm.length;

        if (req.user.id && calificaciones) {
            var ing = await Ingrediente.find()
            var allCat = await Categoria.find()
            res.render('recetas/ver-receta', {
                ing,
                allCat,
                receta,
                user: req.user,
                categRec,
                calificaciones,
                favoritos,
                promCal,
                visitasTotales
            });

        } else if (req.user) {
            var ing = await Ingrediente.find()
            var allCat = await Categoria.find()
            res.render('recetas/ver-receta', {
                ing,
                allCat,
                receta,
                user: req.user,
                favoritos,
                categRec,
                promCal,
                visitasTotales
            });
        }
    } else if (req.user) {

        await Visitas.findOneAndUpdate({
            id_receta: req.params.id
        }, {
            $push: {
                id_visitantes: req.user.id
            }
        })
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render('recetas/ver-receta', {
            ing,
            allCat,
            receta,
            categRec,
            promCal,
            user: req.user,
            favoritos,
            visitasTotales
        });
    } else {

        await Visitas.findOneAndUpdate({
            id_receta: req.params.id
        }, {
            $push: {
                id_visitantes: "usuarioTemp"
            }
        })
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render('recetas/ver-receta', {
            ing,
            allCat,
            receta,
            categRec,
            promCal,
            visitasTotales
        });
    }
})

//-------------------------------------- CREACION DE RECETA ---------------------------------------------

router.get('/recetas/new', authCheck, async (req, res) => {
    //Obtengo todas las categorias       
    const cat = await Categoria.find();

    //Obtengo todos los ingredientes
    const ing = await Ingrediente.find();

    //var allCat = await Categoria.find()  <--- CODIGO REPETIDO REPERCUTE EN LINEA 290 REPERCUTE EN 297
    res.render('recetas/new-receta', {
        allCat: cat,
        user: req.user,
        cat,
        ing
    });
})

router.post('/recetas/new-receta', authCheck, async (req, res) => {
    const {
        title,
        descripcion,
        categoria,
        contador
    } = req.body;
    const ingredientesForm = [];

    if (req.body.ingredientesNom) {
        if (contador > 1) {
            req.body.ingredientesNom.forEach(element => {
                ingredientesForm.push(
                    element
                )
            });
        } else {
            ingredientesForm.push(req.body.ingredientesNom)
        }
    }

    const cantIng = req.body.cantIng
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

    //if (categoria < 1 || categoria > 5) {     deberia validar que el id de categoria exista en la base
    //    errors.push({
    //        text: 'Selecciona una categoria valida'
    //    });
    //}

    if (!req.file) { //valida que se mande una imagen al crear la receta (agregar cuando se edita editar)
        errors.push({
            text: 'Selecciona una imagen'
        });
    }
    if (!ingredientesForm[0]) {
        errors.push({
            text: 'Selecciona al menos un ingrediente'
        });
    } else {
        var ingredientes = [];
        for (let i = 0; i < ingredientesForm.length; i++) {


            var nomIngredienteDB = await Ingrediente.findById(ingredientesForm[i]);

            var index_cant = i + i;
            if (parseFloat(cantIng[index_cant]) < 0) {
                errors.push({
                    text: 'No puede ingresar un valor negativo en la cantidad a usar del ingrediente'
                })
            } else {
                ingredientes.push({
                    id: ingredientesForm[i],
                    nombre: nomIngredienteDB.Descripcion,
                    cantidad: cantIng[index_cant],
                    unidad: cantIng[index_cant + 1]
                })
            }
        }
    }

    var valCat = categoria.split("|");
    var tipo = valCat[1];
    var categoriaFinal = valCat[0];
    if (tipo == "cat") {
        tipo = false;

    } else {
        tipo = true
        var padre = valCat[2];
    }


    if (errors.length > 0) {
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render('recetas/new-receta', {
            ing,
            cat: allCat,
            allCat,
            errors,
            user: req.user,
            title,
            descripcion,
            categoria
        })
    } else {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path); //esta linea sube el archivo a cloudinary y guarda los datos resultantes
        const owen = req.user.id;
        var newReceta = {};

        if (tipo) {

            newReceta = new Recetas({
                title,
                owen,
                descripcion,
                categoria: categoriaFinal,
                subcategoria: true,
                padre,
                ingredientes,
                imagenURL: resultado.url,
                imagenCloud: resultado.public_id
            });
        } else {

            newReceta = new Recetas({
                title,
                owen,
                descripcion,
                categoria: categoriaFinal,
                subcategoria: false,
                ingredientes,
                imagenURL: resultado.url,
                imagenCloud: resultado.public_id
            });
        }

        await newReceta.save();
        await fs.unlink(req.file.path);
        const crearVisitas = new Visitas({
            id_receta: newReceta._id,
            id_visitantes: req.user.id
        })
        await crearVisitas.save();
        res.redirect('/recetas/mis-recetas');
    }
})

// --------------------------------------- VER MIS RECETAS ---------------------------------------

router.get('/recetas/mis-recetas', authCheck, async (req, res) => {
    console.log(req.query.id);
    var usuario 
    if (req.query.id) {
        usuario = req.query.id;
    }else{
        usuario = req.user.id;
    }
    const query = {
        owen: usuario
    };
    var owner_rec = await Users.findById(usuario)
    const resultado = await Recetas.find(query).sort({
        date: 'desc'
    });
    for (let i = 0; i < resultado.length; i++) {

        var categRec;

        if (resultado[i].subcategoria) {


            categRec = await Categoria.findById(resultado[i].padre);
            for (let j = 0; j < categRec.subcategorias.length; j++) {
                if (resultado[i].categoria == categRec.subcategorias[j]._id) {
                    resultado[i].categoria = categRec.subcategorias[j].descripcion;
                }

            }
        } else {
            categRec = await Categoria.findById(resultado[i].categoria);
            resultado[i].categoria = categRec.descripcion;
        }

        var owenReceta = await Users.findById(resultado[i].owen);
        resultado[i].owenName = owenReceta.username;
        resultado[i].owenImg = owenReceta.thumbnail;
        const calificacionesProm = await Calificacion.find({
            id_receta: resultado[i]._id
        });
        var totalCal = 0
        if (calificacionesProm.length > 0 && calificacionesProm) {
            for (let i = 0; i < calificacionesProm.length; i++) {
                totalCal = totalCal + calificacionesProm[i].calificacion;
            }
            var promCal = totalCal / calificacionesProm.length;
            resultado[i].calificacion = promCal;

        }
    }
    var ing = await Ingrediente.find()
    var allCat = await Categoria.find()
    console.log(owner_rec)
    res.render('recetas/mis-recetas', {
        header : owner_rec,
        ing,
        allCat,
        resultado,
        user: req.user
    });
})

// -----------------------------------------ruta para ingresar a la edicion------------------------------------

router.get('/recetas/editar/:id', authCheck, async (req, res) => {
    const datosEditar = await Recetas.findById(req.params.id);
    const errors = [];
    if (req.user.id == datosEditar.owen) {
        //Obtengo todas las categorias       
        const cat = await Categoria.find();

        //Obtengo todos los ingredientes
        const ing = await Ingrediente.find();
        //var allCat = await Categoria.find()    <--- LINEA REPETIDA EN  505

        var categoriaActual = Object;
        if (!datosEditar.subcategoria) {
            categoriaActual = await Categoria.findById(datosEditar.categoria)
        } else {
            categoriaActual = await Categoria.findOne({
                subcategorias: {
                    $elemMatch: {
                        _id: datosEditar.categoria
                    }
                }
            })
        }


        res.render('recetas/editar-receta', {
            allCat: cat,
            datosEditar,
            user: req.user,
            cat,
            ing,
            categoriaActual
        });
    } else {
        errors.push({
            text: 'Usted no tiene autorización para editar esta receta'
        });
    }
    if (errors.length > 0) {
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render(`recetas/error`, {
            ing,
            allCat,
            errors,
            user: req.user
        })
    }
});

// --------------------------------------- EDITAR MIS RECETAS ---------------------------------------

router.put('/recetas/editar', authCheck, async (req, res) => {
    const {
        title,
        descripcion,
        categoria,
        contador
    } = req.body; //se toma los datos del form
    const ingredientesForm = [];
    console.log(contador)
    if (req.body.ingredientesNom) {
        if (contador > 1) {
            req.body.ingredientesNom.forEach(element => {
                ingredientesForm.push(
                    element
                )
            });
        } else if (contador == 1) {
            ingredientesForm.push(req.body.ingredientesNom)
        }
    }
    console.log("ingredientes")
    console.log(req.body.ingredientesNom)
    const cantIng = req.body.cantIng
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
    if (ingredientesForm[0]) {

        await Recetas.findByIdAndUpdate(req.query.id, {
            ingredientes: []
        });

        for (let i = 0; i < ingredientesForm.length; i++) {
            console.log("tamaño de la lista de ingredientes")
            console.log(ingredientesForm)
            console.log(ingredientesForm.length)
            var nomIngredienteDB = await Ingrediente.findById(ingredientesForm[i]);
            console.log("ingrediente de BD")
            console.log(nomIngredienteDB)
            var index_cant = i + i;
            if (cantIng) {
                if (parseFloat(cantIng[index_cant]) < 0) {
                    errors.push({
                        text: 'No puede ingresar un valor negativo en la cantidad a usar del ingrediente'
                    })
                } else {
                    await Recetas.findByIdAndUpdate(req.query.id, {
                        $push: {
                            ingredientes: {
                                id: nomIngredienteDB._id,
                                nombre: nomIngredienteDB.Descripcion,
                                cantidad: cantIng[index_cant],
                                unidad: cantIng[index_cant + 1]
                            }
                        }
                    });
                }
            }
        }

    }

    if (req.file) {
        const resultado = await cloudinary.v2.uploader.upload(req.file.path);
        await Recetas.findByIdAndUpdate(req.query.id, {
            imagenURL: resultado.url,
            imagenCloud: resultado.public_id
        });
        await fs.unlink(req.file.path);
    }
    res.redirect('/recetas/ver/' + req.query.id);

})

// --------------------------------------- BORRAR MIS RECETAS ---------------------------------------

router.delete('/recetas/delete', authCheck, async (req, res) => {
    const usuario = req.user.id;
    const resultado = await Recetas.findById(req.query.id);
    const errors = [];
    if (usuario == resultado.owen) {
        await Recetas.findByIdAndRemove(req.query.id); //borra la receta de la base
        await Calificacion.remove({
            id_receta: resultado._id
        }); //borra la calificacion de la base
        await cloudinary.v2.uploader.destroy(resultado.imagenCloud); //borra la imagen de la base
        await Visitas.findOneAndDelete({
            id_receta: resultado._id
        }); //borra las visitas de la receta (revisar si elimina)
        res.redirect('/recetas/mis-recetas');
    } else {
        errors.push({
            text: 'Usted no tiene autorización para eliminar esta receta'
        });
    }
    if (errors.length > 0) {
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find() //XQ SE LE PASAN LAS CATEGORIAS ??
        res.render(`recetas/error`, {
            ing,
            allCat,
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

    if (calificaciones.length == 0) {
        const newCalif = new Calificacion({
            id_receta: receta,
            id_calificante: user,
            calificacion: parseInt(calif)
        });
        await newCalif.save();
        //res.send(`<script>alert("Calificacion de la receta completada"); window.location.href = "/recetas/ver/${receta}"</script>`);
        res.send(`<script>window.location.href = "/recetas/ver/${receta}"</script>`);
    } else {

        //res.send(`<script>alert("Ya ha calificado anteriormente esta receta"); window.location.href = "/recetas/ver/${receta}"</script>`);
        res.send(`<script> window.location.href = "/recetas/ver/${receta}"</script>`);
    }



})

// -----------------------------           RUTAS DE BUSQUEDA            ----------------------------------------------------------------------//

router.post('/busqueda/1', async (req, res) => { //busqueda por titulo
    const {
        title
    } = req.body;

    const errors = [];
    if (!title) {
        errors.push({
            text: 'seleccione al menos un titulo'
        });
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render('recetas/all-recetas', {
            ing,
            allCat,
            errors,
            user: req.user
        })
    } else {
        console.log(title)
        var titulos = title.split(" ");
        const Receta = await Recetas.find();
        var recetasFinal = []
        for (let j = 0; j < Receta.length; j++) {
            for (let i = 0; i < titulos.length; i++) {
                var _regex = new RegExp(titulos[i], "i");
                var match = Receta[j].title.match(_regex);
                if (match) {
                    recetasFinal.push(Receta[j])
                    i = titulos.length
                }

            }

        }
        for (let i = 0; i < recetasFinal.length; i++) {
            var categRec;
            if (recetasFinal[i].subcategoria) {
                categRec = await Categoria.findById(recetasFinal[i].padre);
                for (let j = 0; j < categRec.subcategorias.length; j++) {
                    if (recetasFinal[i].categoria == categRec.subcategorias[j]._id) {
                        recetasFinal[i].categoria = categRec.subcategorias[j].descripcion;
                    }
                }
            } else {
                categRec = await Categoria.findById(recetasFinal[i].categoria);
                recetasFinal[i].categoria = categRec.descripcion;
            }
            var owenReceta = await Users.findById(recetasFinal[i].owen);
            recetasFinal[i].owenName = owenReceta.username;
            recetasFinal[i].owenImg = owenReceta.thumbnail;
            const calificacionesProm = await Calificacion.find({
                id_receta: recetasFinal[i]._id
            });
            var totalCal = 0
            for (let i = 0; i < calificacionesProm.length; i++) {
                totalCal = totalCal + calificacionesProm[i].calificacion;
            }
            var promCal = totalCal / calificacionesProm.length;
            recetasFinal[i].calificacion = promCal;
        }


        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render("recetas/recetas-titulo", {
            allCat,
            Receta: recetasFinal,
            title,
            user: req.user,
            ing
        });
    }
})

router.post('/busqueda/H', async (req, res) => { //Busqueda hibrida...
    const {
        selectIngVal,
        selectCatVal,
        contadorIng,
        contadorCat
    } = req.body;
    console.log(req.body)
    const ing = await Ingrediente.find().sort({
        Descripcion: 'asc'
    });

    var catBusqueda = []

    if (contadorCat == '1') {
        catBusqueda.push(selectCatVal)
    } else if (contadorCat > "1") {
        catBusqueda = selectCatVal
    }

    var ingBusqueda = []

    if (contadorIng == '1') {
        ingBusqueda.push(selectIngVal)
    } else if (contadorIng > "1") {
        ingBusqueda = selectIngVal
    }

    const errors = [];
    if (!selectIngVal && !selectCatVal) {
        console.log("no hay selecVal")
        errors.push({
            text: 'Seleccione al menos un ingrediente o una categoría'
        });
        var allCat = await Categoria.find()
        res.render('recetas/recetas-ingredientes', {
            ing,
            allCat,
            errors,
            user: req.user
        })
    } else {
        var Receta = []
        if (selectIngVal && selectCatVal) {
            console.log("ambos select")
            var Categ = []
                var find = await Categoria.find({
                    descripcion: {
                        $in: catBusqueda
                    }
                })
                if (find.length > 0) {
                    for (let i = 0; i < find.length; i++) {
                        Categ.push(find[i])
                    }
                }
                find = await Categoria.find({
                    subcategorias: {
                        $elemMatch: {
                            descripcion: {
                                $in: catBusqueda
                            }
                        }
                    }
                })
                if (find.length != 0) {
                    console.log("length no es cero")
                    for (let i = 0; i < find.length; i++) {
                        for (let j = 0; j < find[i].subcategorias.length; j++) {
                            if (catBusqueda.includes(find[i].subcategorias[j].descripcion)) {
                                Categ.push(find[i].subcategorias[j])
                            }
                        }
                    }
                }
                for (let i = 0; i < Categ.length; i++) {
                    var tempRec = await Recetas.find({
                        categoria: Categ[i]._id,
                        ingredientes: {
                            $elemMatch: {
                                nombre: {
                                    $in: ingBusqueda
                                }
                            }
                        }
                    })


                    if (tempRec.length != 0) {
                        for (let j = 0; j < tempRec.length; j++) {
                            Receta.push(tempRec[j]);
                        }
                    }
                }
        } else {
            if (selectIngVal) {
                console.log("solo selectIng")
                console.log("ingBusqueda: ")
                console.log(ingBusqueda)
                var tempRec = await Recetas.find({
                    ingredientes: {
                        $elemMatch: {
                            nombre: {
                                $in: ingBusqueda
                            }
                        }
                    }
                })
                console.log(tempRec)
                if (tempRec.length != 0) {
                    for (let j = 0; j < tempRec.length; j++) {
                        Receta.push(tempRec[j]);
                    }
                }
            }
            if (selectCatVal) {
                console.log("solo selectCat")
                var Categ = []
                var find = await Categoria.find({
                    descripcion: {
                        $in: catBusqueda
                    }
                })
                if (find.length > 0) {
                    for (let i = 0; i < find.length; i++) {
                        Categ.push(find[i])
                    }
                }
                find = await Categoria.find({
                    subcategorias: {
                        $elemMatch: {
                            descripcion: {
                                $in: catBusqueda
                            }
                        }
                    }
                })
                if (find.length != 0) {
                    console.log("length no es cero")
                    for (let i = 0; i < find.length; i++) {
                        for (let j = 0; j < find[i].subcategorias.length; j++) {
                            if (catBusqueda.includes(find[i].subcategorias[j].descripcion)) {
                                Categ.push(find[i].subcategorias[j])
                            }
                        }
                    }
                }
                for (let i = 0; i < Categ.length; i++) {
                    var tempRec = await Recetas.find({
                        categoria: Categ[i]._id
                    })


                    if (tempRec.length != 0) {
                        for (let j = 0; j < tempRec.length; j++) {
                            Receta.push(tempRec[j]);
                        }
                    }
                }
            }
        }
        var hash = {};
        Receta = Receta.filter(function (current) {
            var exists = !hash[current._id] || false;
            hash[current._id] = true;
            return exists;
        });
        if (Receta.length != 0) {
            console.log("rellenamiento de receta")
            for (let i = 0; i < Receta.length; i++) {
                var categRec;

                if (Receta[i].subcategoria) {
                    categRec = await Categoria.findById(Receta[i].padre);
                    for (let j = 0; j < categRec.subcategorias.length; j++) {
                        if (Receta[i].categoria == categRec.subcategorias[j]._id) {
                            Receta[i].categoria = categRec.subcategorias[j].descripcion;
                        }
                    }
                } else {
                    categRec = await Categoria.findById(Receta[i].categoria);
                    Receta[i].categoria = categRec.descripcion;
                }
                var owenReceta = await Users.findById(Receta[i].owen);
                Receta[i].owenName = owenReceta.username;
                Receta[i].owenImg = owenReceta.thumbnail;
                const calificacionesProm = await Calificacion.find({
                    id_receta: Receta[i]._id
                });
                var totalCal = 0
                for (let i = 0; i < calificacionesProm.length; i++) {
                    totalCal = totalCal + calificacionesProm[i].calificacion;
                }
                var promCal = totalCal / calificacionesProm.length;
                Receta[i].calificacion = promCal;
            }
            var allCat = await Categoria.find()
            res.render('recetas/recetas-ingredientes', {
                allCat,
                Receta,
                ing,
                user: req.user
            });
        } else {
            errors.push({
                text: 'No se encontraron recetas'
            });
            var allCat = await Categoria.find()
            res.render('recetas/recetas-ingredientes', {
                allCat,
                ing,
                errors,
                user: req.user
            })
        }
    }
})

// --------------------------------------- RECETAS POR CATEGORIA (NAVBAR) ---------------------------------------

router.get('/categoria/:id', async (req, res) => {
    const categoria = req.params.id;
    const cat = await Categoria.find().sort({
        descripcion: 'asc'
    });

    const errors = [];
    if (!categoria) {
        errors.push({
            text: 'seleccione al menos una categoria'
        });
        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render('recetas/recetas-categoria', {
            ing,
            allCat,
            cat,
            errors,
            user: req.user
        })
    } else {
        const Receta = await Recetas.find({
            categoria: {
                $in: categoria
            }
        })
        for (let i = 0; i < Receta.length; i++) {
            var categRec;
            if (Receta[i].subcategoria) {
                categRec = await Categoria.findById(Receta[i].padre);
                for (let j = 0; j < categRec.subcategorias.length; j++) {
                    if (Receta[i].categoria == categRec.subcategorias[j]._id) {
                        Receta[i].categoria = categRec.subcategorias[j].descripcion;
                    }
                }
            } else {
                categRec = await Categoria.findById(Receta[i].categoria);
                Receta[i].categoria = categRec.descripcion;
            }
            var owenReceta = await Users.findById(Receta[i].owen);
            Receta[i].owenName = owenReceta.username;
            Receta[i].owenImg = owenReceta.thumbnail;
            const calificacionesProm = await Calificacion.find({
                id_receta: Receta[i]._id
            });
            var totalCal = 0
            for (let i = 0; i < calificacionesProm.length; i++) {
                totalCal = totalCal + calificacionesProm[i].calificacion;
            }
            var promCal = totalCal / calificacionesProm.length;
            Receta[i].calificacion = promCal;
        }

        var ing = await Ingrediente.find()
        var allCat = await Categoria.find()
        res.render("recetas/recetas-categoria", {
            allCat,
            Receta,
            cat,
            user: req.user,
            ing
        });
    }
})
//------------------------------------- FAVORITOS ---------------------------------------------------------

router.get('/recetas/favoritos/:id', async (req, res) => { //lista favoritos
    if (req.user) {
        const favoritos = await Favoritos.findOne({
            id_usuario: req.user.id
        })
        var favPrev = 0;

        favoritos.id_favoritos.forEach(async fav => {
            if (fav == req.params.id) {
                favPrev = 1
                await Favoritos.update({
                    id_usuario: req.user.id
                }, {
                    $pullAll: {
                        id_favoritos: [fav]
                    }
                })
            }
        });
        if (favPrev == 0) {
            await Favoritos.findOneAndUpdate({
                id_usuario: req.user.id
            }, {
                $push: {
                    id_favoritos: req.params.id
                }
            })

            //res.send(`<script>alert("Calificacion de la receta completada"); window.location.href = "/recetas/ver/${req.params.id}"</script>`);
            res.send(`<script> window.location.href = "/recetas/ver/${req.params.id}"</script>`);
        } else {

            //res.send(`<script>alert("Ya ha calificado anteriormente esta receta"); window.location.href = "/recetas/ver/${req.params.id}"</script>`);
            res.send(`<script> window.location.href = "/recetas/ver/${req.params.id}"</script>`);
        }
    } else {
        //res.send(`<script>alert("Logueate"); window.location.href = "/recetas/ver/${req.params.id}"</script>`);
        res.send(`<script> window.location.href = "/recetas/ver/${req.params.id}"</script>`);
    }
})

router.get('/recetas/favoritos', async (req, res) => { //lista favoritos
    if (req.user) {
        const favoritos = await Favoritos.findOne({
            id_usuario: req.user.id
        })
        var recetasFinal = []

        for (let i = 0; i < favoritos.id_favoritos.length; i++) {
            const recetaFav = await Recetas.findById(favoritos.id_favoritos[i]);

            if (recetaFav) {
                recetasFinal.push(recetaFav);
            } else {
                await Favoritos.update({
                    id_usuario: req.user.id
                }, {
                    $pullAll: {
                        id_favoritos: [favoritos.id_favoritos[i]]
                    }
                })
                // var updFavoritos = await Favoritos.findOne({id_usuario : req.user.id}) 
                // ESTA CONSULTA NUNCA SE USA
            }
        }
        if (recetasFinal) {
            for (let i = 0; i < recetasFinal.length; i++) {
                var categRec;
                if (recetasFinal[i].subcategoria) {
                    categRec = await Categoria.findById(recetasFinal[i].padre);
                    for (let j = 0; j < categRec.subcategorias.length; j++) {
                        if (recetasFinal[i].categoria == categRec.subcategorias[j]._id) {
                            recetasFinal[i].categoria = categRec.subcategorias[j].descripcion;
                        }
                    }
                } else {
                    categRec = await Categoria.findById(recetasFinal[i].categoria);
                    recetasFinal[i].categoria = categRec.descripcion;
                }
                var owenReceta = await Users.findById(recetasFinal[i].owen);
                recetasFinal[i].owenName = owenReceta.username;
                recetasFinal[i].owenImg = owenReceta.thumbnail;
                const calificacionesProm = await Calificacion.find({
                    id_receta: recetasFinal[i]._id
                });
                var totalCal = 0
                for (let i = 0; i < calificacionesProm.length; i++) {
                    totalCal = totalCal + calificacionesProm[i].calificacion;
                }
                var promCal = totalCal / calificacionesProm.length;
                recetasFinal[i].calificacion = promCal;
            }

            var ing = await Ingrediente.find()
            var allCat = await Categoria.find()
            res.render('recetas/favoritos', {
                allCat,
                receta: recetasFinal,
                user: req.user,
                ing
            })
        } else {
            var ing = await Ingrediente.find()
            var allCat = await Categoria.find()
            res.render('recetas/favoritos', {
                allCat,
                user: req.user,
                ing
            })
        }
    } else {
        //res.send(`<script>alert("Logueate"); window.location.href = "/recetas/ver/${req.params.id}"</script>`);
        res.send(`<script>window.location.href = "/recetas/ver/${req.params.id}"</script>`);
    }
})

module.exports = router;