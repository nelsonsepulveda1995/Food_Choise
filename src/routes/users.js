const express = require('express');
const router = express.Router();

const Usuarios=require('../models/usuarios'); //llamando a los modelos de login y usuario.

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
})

router.post('/users/signin', (req,res) => {
    console.log(req.body);
    const {email,password}=req.body; //se toman los datos enviados desde el front

    const errors=[];       //si hay errores se guardan aqui
    if(email.length<5){
        errors.push({text:'Ingrese un email valido'});
    }
    if(password.length<6){
        errors.push({text: 'La contraseña de demasiado corta'});
    }
    if(errors.length>0){
        res.render('users/signin', {errors , email, password});  //si hay errores  se carga la misma pagina pero se le envian los errores 
    }
    else{
        res.send('ok');
    }
    
})
module.exports = router;