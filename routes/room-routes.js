const express = require('express');
const router = express.Router();
const Room = require('../models/room-model.js');
const ensure = require('connect-ensure-login');
const multer = require('multer');
const path = require('path');


router.get('/rooms', ensure.ensureLoggedIn('/login'), (req, res, next) => {
Room.find({owner:req.user._id},(err,roomlist)=>{
  if (err) {
    next(err);
    return;
  }
  res.render('rooms/rooms-list-view.ejs',{
    rooms:roomlist,
    successMessage:req.flash('success')
  });

});
});
// we meed to be logged in to create rooms

router.get('/rooms/new', ensure.ensureLoggedIn('/login'), (req, res, next) => {
    res.render('rooms/new-room-view.ejs');
});

//      a more robust way of saying where to put the images in the PUBLIC FOLDER
//                                  \
const myUploader = multer({dest:path.join(__dirname,'../public/uploads')});

// =========================<input id ="room-photo-input" type="file" name="roomPhoto" value="">
// ============================================================================||
router.post('/rooms/new', ensure.ensureLoggedIn('/login'),myUploader.single('roomPhoto'), (req, res, next) => {
// ====================================================================|===============================
// ====================================mutler it has many more methods that you can specify========= look at docs

    const newRoom = new Room({
        name: req.body.roomName,
        description: req.body.roomDescription,
        // multer willl generate a file name and this is how you can access it
//                                        |                    |   
        photoAddress:`/uploads/${req.file.filename}`,//      <--
        owner:req.user._id
    });
    newRoom.save((err) => {
        if (err) {
            next(err);
            return;
        }
        req.flash('success','your room was saved successfully');
        res.redirect('/rooms');
    });
});
module.exports = router;
