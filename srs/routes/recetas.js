const express = require('express');
const router = express.Router();

router.get('/recetas', (req, res) => {
  res.render('recetas');
});

module.exports = router;
