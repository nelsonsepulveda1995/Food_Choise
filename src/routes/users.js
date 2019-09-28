const express = require('express');
const router = express.Router();

const Usuarios=require('../models/usuarios'); //llamando a los modelos de login y usuario.

router.get('/users/signin', (req, res) => {
    res.render('users/signin');
})

router.post('/users/signin',(req,res)=>{
    req  //completar
})
module.exports = router;