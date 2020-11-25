const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const JwtStrategy = require('passport-jwt').Strategy;
//const ExtractJwt = require('passport-jwt').ExtractJwt;
//const jsonwt = require('jsonwebtoken');
const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');

//load congif
const dotenv = require('dotenv');
dotenv.config({path: './config/config.env'});

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, 
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile);
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            image: profile.photos[0].value
        }

    try {
        let user = await User.findOne({googleId: profile.id});
        if (user) {
            //jason web token
            // jsonwt.sign(newUser, process.env.SECRET, {expiresIn: 3600}, (err, token) => {
            //     if (err) throw err;
            //     console.log(token);
            // })
            done(null, user)
        } else {
            // jsonwt.sign(newUser, process.env.SECRET, {expiresIn: 3600}, (err, token) => {
            //     if (err) throw err;
            //     res.setHeader('Authorization', 'Bearer '+ token); 
            //     //console.log(token);
            // })
            user = await User.create(newUser)
            done(null, user)
        }
    } catch (err) {
        console.error(err)
    }
    }))

    // var opts = {};
    // opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    // opts.secretOrKey = process.env.SECRET; 
    // passport.use(new JwtStrategy(opts,  async(jwt_payload, done) => {
    //     try {
    //         let user = await User.findById(jwt_payload.id);
    //         if (user) {
    //             done(null, user)
    //         } else {
    //             done(null, false)
    //         }
    //     } catch (err) {
    //         console.error(err);
    //     }
    // })) 

    //passport local
    passport.use(new localStrategy({usernameField: 'email'}, async (email, password, done) => {
        //match user
        try {
            let user = await User.findOne({email: email})
            if (!user) {
                return done(null, false, {message: 'Email is not registered'})
            }

            //match password
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;
                if (isMatch) {
                    return done(null, user)
                    res.redirect('/dashboard')
                } else {
                    return done(null, false, {PasswordError: 'password incorect'})
                }
            })
        } catch (err) {
            console.error(err);
        }
    }))


    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}

