const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const layouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');

const User = require('./models/user-model.js');

mongoose.connect('mongodb://localhost/passport-app');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// default value for title local
app.locals.title = 'Express - Generated with IronGenerator';

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(layouts);
app.use(session({
    // sessions option where you can put when the cookie expires and bunch of more option
    secret: 'my cool passport app',
    resave: true,
    saveUninitialized: true
}));
// it has to be after the session -express
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=>{
  if (req.user) {
res.locals.user = req.user;
  }
next();
});


//..... and before your routes

// ================HOW PASSPORT WORKS==============================
//passport goes through this
// /.1our form
// 2. LocalStrategy callback
// 3.(if successful ) passport.serializeUser()
// ======================================================

//determines what to save in the session what put in the box
passport.serializeUser((user, cb) => {
    //only when you log in
    cb(null, user._id);
});

//where to get the rest of the users given (what in the box)
passport.deserializeUser((userId, cb) => {
    //callled every time AFTER LOG IN
    //querying the database with the id
    User.findById(userId, (err, theUser) => {
        if (err) {
            cb(err);
            return;
        }
        // we are sending user info to passport
        cb(null, theUser);
    });
});
const LocalStrategy = require('passport-local').Strategy; // it gonna tell you if
// yuo have a succesful login you can also do it i two steps instead of one
const bcrypt = require('bcrypt');

//IT ASSUMES THAT YOUR INPUT NAME WILL ME USERNAME AND YOUR PASSWORD WILL BE PASSWORD
//if you wanna change it you have to let it know --------
passport.use(new LocalStrategy(//                       |
    //1st argument option to customize LocalStrategy    |
      {                                 //<==============
        // <input name = "loginUsername">
usernameField:'loginUsername',
        // <input name = "loginPassword">
passwordField:'loginPassword'


    },
    //2nd arg -> call back for e logic that validates log in
    (loginUsername, loginPassword, next) => {
        User.findOne({
            username: loginUsername
        }, (err, theUser) => {
            // tell passport if there was an erros (nothing we can do)
            if (err) {
                next(err);
                return;
            }
            // tell passport if there is no user with given username
            if (!theUser) {
              //        fasle in 2nd arg mean log in failed
              //          |
              next(null,false,{message:'Wrong User name budy'});
              // req.flash (error) that what is referring to
              return;
            }
            //tell passportif the passport dont match
            if(!bcrypt.compareSync(loginPassword,theUser.encryptedPassword)){
              //  false in 2 arg means log in faileds
              next(null,false,{message:'wrong password friend'});
              return;
            }
            // give the passport the users details(success!)
          next(null,theUser,{message: `login successful ${theUser.username} successful`});
          // req.flash (successful) that what is referring to 

        });
    }

));
//if you have 3 method of log in you need three passport.use









// ================================================================================
const index = require('./routes/index');
app.use('/', index);
const myAuthRoutes = require('./routes/auth-route.js');
app.use('/', myAuthRoutes);
const UserRoute = require('./routes/user-routes.js');
app.use('/', UserRoute);
// ================================================================================
// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
