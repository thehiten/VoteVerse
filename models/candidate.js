const mongoose = require('mongoose');

// const bcrypt = require('bcrypt');

// define Person schema

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    party:{
        type: String,
        require: true
    },
    age: {
        type: Number,
        required: true
    },

    votes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'User', // kha se laye ho
                required: true,
            },
            votedAt: {
                type: Date,
                default: Date.now()
            }
        }
    ],

    voteCount:
    {
        type: Number,
        default: 0

    }

});


const Candidate = mongoose.model('Candidate', userSchema);  // User model name
module.exports = Candidate;