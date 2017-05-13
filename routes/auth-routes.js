const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ensure = require('connect-ensure-login');

const User = require('../models/user-model.js');


const authRoutes = express.Router();


authRoutes.get('/signup',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
    ensure.ensureNotLoggedIn('/'),

    (req, res, next) => {
        // If not for 'ensureNotLoggedIn()' we would have to do this:

        // if (req.user) {
        //   res.redirect('/');
        //   return;
        // }

        res.render('auth/signup-view.ejs');
    }
);


// <form method="post" action="/signup">
authRoutes.post('/signup',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
    ensure.ensureNotLoggedIn('/'),

    (req, res, next) => {
        const signupUsername = req.body.signupUsername;
        const signupPassword = req.body.signupPassword;

        // Don't let users submit blank usernames or passwords
        if (signupUsername === '' || signupPassword === '') {
            res.render('auth/signup-view.ejs', {
                errorMessage: 'Please provide both username and password.'
            });
            return;
        }

        // Check password length, characters, etc. (we are ignoring that here)

        User.findOne(
            // 1st arg -> criteria of the findOne (which documents)
            {
                username: signupUsername
            },
            // 2nd arg -> projection (which fields)
            {
                username: 1
            },
            // 3rd arg -> callback
            (err, foundUser) => {
                if (err) {
                    next(err);
                    return;
                }

                // Don't let the user register if the username is taken
                if (foundUser) {
                    res.render('auth/signup-view.ejs', {
                        errorMessage: 'Username is taken, sir or madam.'
                    });
                    return;
                }

                // We are good to go, time to save the user.

                // Encrypt the password
                const salt = bcrypt.genSaltSync(10);
                const hashPass = bcrypt.hashSync(signupPassword, salt);

                // Create the user
                const theUser = new User({
                    name: req.body.signupName,
                    username: signupUsername,
                    encryptedPassword: hashPass
                });

                // Save it
                theUser.save((err) => {
                    if (err) {
                        next(err);
                        return;
                    }

                    // Store a message in the box to display after the redirect
                    req.flash(
                        // 1st arg -> key of message
                        'success',
                        // 2nd arg -> the actual message
                        'You have registered successfully!'
                    );

                    // Redirect to home page if save is successful
                    res.redirect('/');
                });
            }
        );
    }
);

authRoutes.get('/login',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
    ensure.ensureNotLoggedIn('/'),

    (req, res, next) => {
        // If not for 'ensureNotLoggedIn()' we would have to do this:

        // if (req.user) {
        //   res.redirect('/');
        //   return;
        // }

        res.render('auth/login-view.ejs', {
            errorMessage: req.flash('error')
            //                       |
        }); //    default name for error messages in Passport
    }
);

// <form method="post" action="/login">
authRoutes.post('/login',
    //        redirects to '/' (home page) if you ARE logged in
    //                      |
    ensure.ensureNotLoggedIn('/'),

    //                   local as in "LocalStrategy" (our method of logging in)
    //                     |
    passport.authenticate('local', {
        successRedirect: '/',
        successFlash: true, // req.flash('success')
        failureRedirect: '/login',
        failureFlash: true // req.flash('error')
    })
);

authRoutes.get('/logout', (req, res, next) => {
    // req.logout() method provided by Passport
    req.logout();

    req.flash('success', 'You have logged out successfully. 🤠');

    res.redirect('/');
}); //facebook as in FbStrategy
authRoutes.get('/auth/facebook/', passport.authenticate('facebook'));
//            link to this address should be login in with facebook

// the address facebook is gonna come back to after user says yes or no
authRoutes.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
    //here i can put the flash to see if it works
}));
//                                                     gooogle is built in to the package passport auth as in [GoogleStrategy]
authRoutes.get('/auth/google/', passport.authenticate('google', {
    scope: ["https://www.googleapis.com/auth/plus.login",
        "https://www.googleapis.com/auth/plus.profile.emails.read"
    ]
}));
//            link to this address should be login in with facebook

// the address facebook is gonna come back to after user says yes or no
authRoutes.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
    //here i can put the flash to see if it works
}));


module.exports = authRoutes;
