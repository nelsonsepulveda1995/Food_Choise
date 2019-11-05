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
    const cantidadReceta = await Recetas.find({owen:req.user.id}).count();  //revisa cuantas recetas creo el usuario
    const cantidadFavoritos=await Favoritos.find({id_usuario:req.user.id},{_id:0, id_favoritos:1}); //revisa cuantas recetas en favoritos tiene
    var result=0;
    cantidadFavoritos.forEach(element => {  //cuenta el array de favoritos traidos desde la base
        console.log(element);
        result=element.id_favoritos.length;
    });
    res.render('profile', {user: req.user,cantidadReceta,result});
});

module.exports = router;