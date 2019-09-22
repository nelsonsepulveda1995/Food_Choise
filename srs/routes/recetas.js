const express = require('express');
const router = express.Router();

//rutas para lo relacionado con recetas ej: busqueda, ordenamiento

router.get('/recetas', (req, res) => {
  res.render('recetas');
});

module.exports = router;
