const router = require('express').Router();
const passport = require('passport');
const Favoritos = require('../models/favoritos');

//auth logout
router.get('/logout', (req, res) =>{
    //handlwe with passport
    req.logOut();
    req.session = null;
    res.redirect("/");
});

//auth with google
router.get('/google', passport.authenticate('google', {
    display:'popup',
    scope:['profile']
}));

// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), async (req,res) =>{
    //serialize user
    //res.send(req.user);
    const favoritos = await Favoritos.findOne({id_usuario : req.user._id})
    if (!favoritos) {
        const newFav = new Favoritos({
            id_usuario: req.user._id,
        });
        await newFav.save();
    }
    res.send('<script>opener.location.reload();window.close();</script>');
    
});

module.exports = router;