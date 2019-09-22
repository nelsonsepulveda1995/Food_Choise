const router = require('express').Router();
const passport = require('passport');

//rutas para uso de usuarios ej: registro, ingreso, configuracion,etc

router.get('/users/registro', (req, res) => {
  res.render('login');
});


module.exports = router;
