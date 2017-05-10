const express = require('express');
const bcrypt = require('bcrypt');
const authRoutes = express.Router();
const User = require('../models/user-model.js');
const passport = require('passport');
const ensure= require('connect-ensure-login');




//                          redireect to the home page if log in
authRoutes.get('/signup',ensure.ensureLoggedOut('/'),  (req, res, next) => {
    res.render('auth/signup-view.ejs');
});


authRoutes.post('/signup',ensure.ensureLoggedOut('/'),(req, res, next) => {
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
            req.flash(
              // 1st argument
              'successfulsignup',
// second its the actual message
'you have register successfully'

            );
            //redirect to home page if
            res.redirect('/');
        });
    });
});

authRoutes.get('/logout',(req,res)=>{
  req.logout();
  res.redirect('/');
});
authRoutes.get('/login',ensure.ensureLoggedOut('/'), (req, res, next) => {
    res.render("auth/login-view.ejs",{
      errorMessage:req.flash('error')
    });
});

authRoutes.post('/login', ensure.ensureLoggedOut('/'),passport.authenticate('local', {
        successRedirect: '/',
        successFlash:true,
        failureRedirect: '/login',
        failureFlash:true
    }

));


module.exports = authRoutes;
