const express = require('express')
const router = express.Router();

const checkAuth = (req, res, next) => {
    if (!req.session.authenticated) return res.status(401).json({'error': 'not logged in'});
    next();
};

router.get('/info', checkAuth, (req, res) => {    
    res.json( { profile: req.session.profile, mod: req.session?.mod ?? false } );
})  

module.exports = router;