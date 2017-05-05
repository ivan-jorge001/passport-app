const express = require('express');
const bcrypt = require('bcrypt');
const authRoutes = express.Router();
const User = require('../models/user-model.js');

authRoutes.get('/signup', (req, res, next) => {
    res.render('auth/signup-view.ejs');
});


authRoutes.post('/signup', (req, res, next) => {
    const signupUsername = req.body.signupUsername;
    const signupPassword = req.body.signupPassword;
    //dont let user submit blank signupUsernames or signupPassword
    if (!signupUsername || !signupPassword) {
        res.render('auth/signup-view.ejs', {
            errorMessage: 'Please provide Both username and password'
        });
        return;
    }
    // chekc password length characters,etc
    User.findOne({
        username: signupUsername
    }, {
        username: 1
    }, (err, foundUser) => {
        if (err) {
            next(err);
            return;
        }
        if (foundUser) {
            //dont let the user register if the username is taken
            res.render('auth/signup-view.ejs', {
                errorMessage: 'User name is taken, sir or madam'
            });
            return;
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPass = bcrypt.hashSync(signupPassword, salt);
        const theUser = new User({
            name: req.body.signupName,
            username: signupUsername,
            encryptedPassword: hashPass
        });
        theUser.save((err) => {
            if (err) {
                next(err);
                return;
            }
            //redirect to home page if
            res.redirect('/');
        });
    });


});





module.exports = authRoutes;