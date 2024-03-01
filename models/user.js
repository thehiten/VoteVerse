const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define User schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    emails: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

// Define pre-save middleware function
userSchema.pre('save', async function(next) {
    const user = this;
    try {
        // Check if password has been modified or is new
        if (!user.isModified('password')) {
            return next();
        }

        // Generate salt
        const salt = await bcrypt.genSalt(10);

        // Hash the password along with the salt
        const hashedPassword = await bcrypt.hash(user.password, salt);

        // Replace plaintext password with hashed password
        user.password = hashedPassword;

        // Call next() to proceed with saving the document
        next();
    } catch (error) {
        // Handle any errors that occur during pre-save operations
        next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // Use bcrypt.compare to compare candidatePassword with hashed password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        // Handle any errors
        throw new Error(error);
    }
};

const User = mongoose.model('User', userSchema);  // User model name
module.exports = User; // Export User model
