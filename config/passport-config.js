const User = require('../models/user-model.js');
const passport = require('passport');
const FbStrategy = require('passport-facebook');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
// PASSPORT GOES THROUGH THIS
// 1. Our form
// 2. LocalStrategy callback
// 3. (if successful) passport.serializeUser()


// Determines WHAT TO SAVE in the session (what to put in the box)
// (called when you log in)
passport.serializeUser((user, cb) => {
    // "cb" is short for "callback"
    cb(null, user._id);
});
passport.use(new FbStrategy({
        clientID: '641735956011799',
        clientSecret: 'efd34fa049504c0f637fc6293bee2443',
        callbackURL: '/auth/facebook/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(' =================================================================');
        console.log('facebook Profile =======================');
        console.log(profile);
        console.log(' ===================================================================');

        User.findOne({
            facebookID: profile.id
        }, (err, foundUser) => {
            if (err) {
                done(err);
                return;
            } //if they are alreadyhave log in befoer
            if (foundUser) {
                done(null, foundUser);
            }
            //register them if they are notlog in
            const theUser = new User({
                facebookID: profile.id,
                name: profile.displayName
            });
            theUser.save((err) => {
                if (err) {
                    done(err);
                    return;
                }
                done(null, theUser);
            });
        });
    }
));
passport.use(new GoogleStrategy({

    clientID: '106231132707-b85rvjnbusdski72d0je1gl8inqrumuv.apps.googleusercontent.com',
    clientSecret: '3Wm_8sapv7AFqI6-y0hli6dC',
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  console.log(' =================================================================');
  console.log('facebook Profile =======================');
  console.log(profile);
  console.log(' ===================================================================');
    User.findOne({
        googleID: profile.id,
        name:profile.displayName
    }, (err, foundUser) => {
        if (err) {
            done(err);
            return;
        }
        if (foundUser) {
            done(null, foundUser);
            return;
        }
        const theUser = new User({
            googleID: profile.id,

        });
        if (!theUser.name) {
          theUser.name = profile.emails[0].value;
        }
        theUser.save((err) => {
            if (err) {
                done(err);
                return;
            }
            done(null,theUser);
        });
    });
}));
// Where to get the rest of the user's information (given what's in the box)
// (called on EVERY request AFTER you log in)
passport.deserializeUser((userId, cb) => {
    // "cb" is short for "callback"

    // query the database with the ID from the box
    User.findById(userId, (err, theUser) => {
        if (err) {
            cb(err);
            return;
        }

        // sending the user's info to passport
        cb(null, theUser);
    });
});


const LocalStrategy = require('passport-local').Strategy;
// The same as:
// const passportLocal = require('passport-local');
// const LocalStrategy = passportLocal.Strategy;

const bcrypt = require('bcrypt');


passport.use(new LocalStrategy(
    // 1st arg -> options to customize LocalStrategy
    {
        // <input name="loginUsername">
        usernameField: 'loginUsername',
        // <input name="loginPassword">
        passwordField: 'loginPassword'
    },

    // 2nd arg -> callback for the logic that validates the login
    (loginUsername, loginPassword, next) => {
        User.findOne({
                username: loginUsername
            },

            (err, theUser) => {
                // Tell Passport if there was an error (nothing we can do)
                if (err) {
                    next(err);
                    return;
                }

                // Tell Passport if there is no user with given username
                if (!theUser) {
                    //       false in 2nd arg means "Log in failed!"
                    //         |
                    next(null, false, {
                        message: 'Wrong username, buddy. 😓'
                    });
                    return; //   |
                } //   v
                // message -> req.flash('error')

                // Tell Passport if the passwords don't match
                if (!bcrypt.compareSync(loginPassword, theUser.encryptedPassword)) {
                    //       false in 2nd arg means "Log in failed!"
                    //         |
                    next(null, false, {
                        message: 'Wrong password, friend. 😓'
                    });
                    return; //   |
                } //   v
                // message -> req.flash('error')

                // Give Passport the user's details (SUCCESS!)
                next(null, theUser, {
                    // message -> req.flash('success')
                    message: `Login for ${theUser.username} successful. 🤣`
                });
                // -> this user goes to passport.serializeUser()
            }
        );
    }
));
