const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const _ = require('loadsh');
const jsonwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
//const {ensureAuth} = require('../middleware/isAuth')
const router = express.Router();

//load congif
const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});

//load mail info
const transporter = require('../middleware/mail');
const { token } = require('morgan');


//@desc     Auth with google
//@route    GET /auth/google
router.get('/google', passport.authenticate('google', {scope: ['profile', 'email']}));

//@desc     google auth callback
//@route    GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {failureRedirect: '/'}), (req, res) => {
    res.redirect('/dashboard');
})

//@desc     Registration for user
//@route    POST /auth/register
//@access   PUBLIC
router.post('/register', async (req, res) => {
    console.log(req.body);
    const {firstName, lastName, email, password, passwordConfirmation} = req.body;
    let errors = [];

    //check required fields
    if (!firstName || !lastName || !email || !password || !passwordConfirmation) {
        errors.push({msg: 'Please fill in all fields'})
    }
    //check password match
    if (password !== passwordConfirmation) {
        errors.push({msg: 'Password do not match'})
    }
    //password length
    if (password.length <6) {
        errors.push({msg: 'Password should be atleast 6 characters'})
    }

    if (errors.length >0) {
        res.render('register', {
            layout: "layout_register",
            errors,
            firstName, 
            lastName,
            email, 
            password
        })
    } else {
        try {
            let user = await User.findOne({email: email})
            if (user) {
                //user existe
                errors.push({msg: 'Email is already registered'})
                res.render('register', {
                    layout: "layout_register",
                    errors,
                    firstName, 
                    lastName,
                    email
                })
            } else {
                //new user
                const newUser = new User({
                    firstName, 
                    lastName,
                    email, 
                    password
                });

                //encrypt password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        try {
                            newUser.save()
                            req.flash('success_msg', 'You are now registered and can login')
                            res.redirect('/')
                        } catch (err) {
                            console.error(err);
                        }
                    }) 
                })
            }
        } catch (err) {
            console.log(err)
        }
    }
})

//@desc     login for user
//@route    POST /auth/login
//@access   PUBLIC
router.post('/login', async(req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/',
        failureFlash: true
    })(req, res, next);
    // try {
    //     let user = await User.findOne({email});
    //     if (!user) {
    //         return res.status(404).json({EmailError: 'email not found'});
    //     }
    //     //match password
    //     bcrypt.compare(password, user.password, (err, isMatch) => {
    //         if(err) throw err;
    //         if (isMatch) {
    //             const payload = {
    //                 id: user.id,
    //                 name:user.name,
    //                 email: user.email
    //             };
    //             // jsonwt.sign(payload, process.env.SECRET, {expiresIn: 3600}, (err, token) => {
    //             //     if (err) throw err;
    //             //     res.setHeader('Authorization', 'Bearer '+ token);  
    //             //     res.send();
    //             //     // res.json({
    //             //     //     success: true,
    //             //     //     token: 'Bearer ' + token
    //             //     // })
    //             //     console.log(token);
    //             // })
    //             res.redirect('/dashboard')
    //         } else {
    //             return res.status(400).json({PasswordError: 'password incorect'})
    //         }
    //     })
    // } catch (err) {
    //     console.error(err);
    // }
});

//@desc     forgot password
//@route    PUT /auth/forgot
//@access   PUBLIC
router.put('/forgot', async (req, res) => {
    const {email} = req.body;
    try {
        let user = await User.findOne({email : email});
        if (!user) {
            req.flash('error_msg', 'User not found')
        }
        const token = jsonwt.sign({id: user._id}, process.env.RESET_SECRET, {expiresIn: '20m'});
        
        var mailOptions = {
            from: 'partha.beis.16@acharya.ac.in',
            to: email,
            subject: 'Sending Email using Node.js',
            html: `<h2>Please click on given link to reset your password</h2>
                   <p>${process.env.CLIENT_URI}/resetpassword/${token}</p>`
        };

        try {
            await user.updateOne({resetLink: token});
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response)
                }
            }); 
            req.flash('success_msg', 'Email has been sent');
            res.redirect('/');
        } catch (err) {
            req.flash('error_msg', 'reset link error');
            console.error(err);
        }

    } catch (err) {
        console.error(err)
    }
})

//@desc     reset password
//@route    PUT /auth/reset
//@access   PUBLIC
router.put('/resetpassword', async(req, res) => {
    const { verifytoken, newpassword} = req.body;
    console.log(verifytoken, newpassword);
    try {
        let user =  await User.findOne({resetLink: verifytoken})
        if (!user) {
            req.flash('error_msg', 'User with the given token does not  exist');
            res.redirect('/');
        }
        jsonwt.verify(verifytoken, process.env.RESET_SECRET, (error, decodeData) => {
            if (error) {
                req.flash('error_msg', 'Incorrect token or token has expired');
                res.redirect('/');
            }
            const obj = {
                password: newpassword,
                resetLink: ''
            }
            //encrypt password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(obj.password, salt, (err, hash) => {
                    if (err) throw err;
                    obj.password = hash;
                    user = _.extend(user, obj);
                    try {
                        user.save()
                        req.flash('success_msg', 'Password has been changed');
                        res.redirect('/');
                    } catch (err) {
                        console.error(err);
                    }
                }) 
            })
        })
    } catch (err) {
        console.error(err)
    }
})

//@desc     logout user
//@route    /auth/logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out')
    res.redirect('/');
});

module.exports = router;