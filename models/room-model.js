const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./user-model.js');

const roomSchema = new Schema({
    name: {
        type: String
    },
    description: {
        type: String
    },
    photoAddress: {
        type: String
    },

    // reference ID of the user
    owner: {
        type: Schema.Types.ObjectId
    }

    // owner:{type:User.schema}


}, {
    timestamps: true
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
