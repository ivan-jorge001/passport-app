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
    secret: 'my cool passport app',
    resave: true,
    saveUninitialized: true
}));
// it has to be after the session -express
app.use(passport.initialize());
app.use(passport.session());
//..... and before your routes

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


// ================================================================================
const index = require('./routes/index');
app.use('/', index);
const myAuthRoutes = require('./routes/auth-route.js');
app.use('/', myAuthRoutes);
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
