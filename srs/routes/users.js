const router = require('express').Router();
const passport = require('passport');

router.get('/users/registro', (req, res) => {
  res.render('views/users/login');
});

router.get('/users/ingreso', (req,res) =>{
  res.render('views/users/ingerso')
})

module.exports = router;
