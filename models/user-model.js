const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema(
  // 1st arg -> fields of the documents of this collection
  {
    name: { type: String },

    //traditional register users
    username: { type: String },
    encryptedPassword: { type: String },
    // loginwith fb
    facebookID:{type:String},
    //gooogle ids
    googleID:{type:String}
  },

  // 2nd arg -> additional options
  {
    // Adds createdAt & updatedAt to documents
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);


module.exports = User;
