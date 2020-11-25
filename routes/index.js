const express = require('express');
const router = express.Router();
const User = require('../models/User')
//const jsonwt = require('jsonwebtoken')
const passport = require('passport')
const {ensureAuth} = require('../middleware/isAuth')
//const verifyToken = require('../middleware/jwt_verify')

//@desc     login for user
//@route    POST /login
//@access   PUBLIC
router.get('/', (req, res) => {
    res.render('login',  {layout: "layout_login"});
});


//@desc     Registration for user
//@route    POST /register
//@access   PUBLIC
router.get('/register', (req, res) => {
    res.render('register',  {layout: "layout_register"});
});


//@desc     forgot
//@route    GET /forgot
router.get('/forgot', (req, res) => {    
    res.render('forgot', {
        //name: req.user.firstName,
        layout: "layout_login",
    })
});

//@desc     reset
//@route    GET /reset
router.get('/resetpassword/:token', async (req, res) => {
    console.log(req.params.token)
    res.render('reset', {
        token: req.params.token,
        layout: "layout_login",
    })
})


//@desc     Dashboard
//@route    GET /dashboard
//@access   PRIVATE
router.get('/dashboard', ensureAuth, (req, res) => {
    // jsonwt.verify(req.token, process.env.SECRET, (err,authData) => {
    //     if(err) {
    //         res.sendStatus(403);
    //     } else {
        // const bearerHeader = req.headers['authorization'];   //the token is stored in the authorizathin part of the haeader.
        // console.log(bearerHeader);
            
    //     }
    // })
    
    res.render('dashboard', {
        //name: req.user.firstName,
        layout: "layout_login",
        user: req.user,
        
    })
});

module.exports = router;
