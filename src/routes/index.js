const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('recetas/all-recetas');
})

module.exports = router;