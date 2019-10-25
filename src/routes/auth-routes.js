const router = require('express').Router();
const passport = require('passport');

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
router.get('/google/redirect', passport.authenticate('google'), (req,res) =>{
    //serialize user
    //res.send(req.user);
    
    res.send('<script>opener.location.reload();window.close();</script>');
    
});

module.exports = router;