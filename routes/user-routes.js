const express = require('express');
const userRouter = express.Router();
const ensure= require('connect-ensure-login');
//
// ensure.ensureLoggedIn();
//
// ensure.ensureLoggedOut();
// ensure.ensureNotLoggedIn();
//                                 makes sure to redirect to /login if you are not log in
userRouter.get('/profile/edit',ensure.ensureLoggedIn('/login'),(req,res,next)=>{
res.render('user/edit-profile-view.ejs');
});


// if (!req.user) {
//   res.redirect('/login');
//   return;
// }
module.exports = userRouter;
