const express = require('express');
const router  = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {

console.log('home==============================');
console.log('seesion (from express-session)',req.session);
console.log('user (user passport)',req.user);
//
// if (req.user) {
//   res.render('logged-in-home.ejs');
// }else{
//   res.render('not loge in user');
// }
  res.render('index',{
    user:req.user
  });
});

module.exports = router;
