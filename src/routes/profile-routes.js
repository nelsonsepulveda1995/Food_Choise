const router = require('express').Router();
const Favoritos = require('../models/favoritos');
const Recetas = require('../models/recetas');

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

router.get('/', authCheck, async(req, res) =>{
    const cantidadReceta = await Recetas.find({owen:req.user.id}).count();
    const cantidadFavoritos=await Favoritos.find({id_usuario:req.user.id},{_id:0, id_favoritos:1});
    var result=0;
    cantidadFavoritos.forEach(element => {
        console.log(element);
        result=element.id_favoritos.length;
    });
    console.log("cantidad  de favoritos", cantidadFavoritos);
    console.log("cantidad  de Recetas", cantidadReceta);
    console.log("cantidad  de Recetas", result);
    res.render('profile', {user: req.user,cantidadReceta,result });
});

module.exports = router;