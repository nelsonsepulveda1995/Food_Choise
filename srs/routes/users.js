const router = require('express').Router();
const passport = require('passport');

router.get('/users', (req, res) => {
  res.render('recetas');
});

module.exports = router;
