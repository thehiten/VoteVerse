const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Import the User model

// Your user routes go here...

module.exports = router;

const { jwtAuthMiddleware, generateToken } = require('./../jwt');

router.post('/signup', async (req, res) => {
    try {
        const data = req.body; // Get user data from request body

        // Create a new User document using the User model
        const newUser = new User(data);

        // Save the new user document
        const savedUser = await newUser.save();
        console.log('Data saved');

        const payload = {
          id: savedUser.id, // Corrected variable name to savedUser
        };

        const token = generateToken(payload);

        console.log("Token generated:", token);

        // Combine savedUser and token into a single object before sending as response
        const responseData = {
            user: savedUser, // Corrected variable name to savedUser
            token: token
        };

        res.status(200).json(responseData);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { aadharCardNumber, password } = req.body;

        // Find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
       
        if (!user) {
            // If user doesn't exist, respond with an error
            res.status(401).json({ message: 'Invalid username or password' });
            return; // Exit the function early
        }

        // Check if the password matches
        const passwordMatches = await user.comparePassword(password);
        if (!passwordMatches) {
            // If password doesn't match, respond with an error
            res.status(401).json({ message: 'Invalid username or password' });
            return; // Exit the function early
        }

        // If both user exists and password matches, generate token
        const payload = {
            id: user.id
        };

        const token = generateToken(payload);

        // Return token as response
        res.json({ token });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try {
        const userData = req.user;
        const userId = userData.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ user });
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; // Extract id from token
        const { currentPassword, newPassword } = req.body;

        // Find the user by id
        const user = await User.findById(userId);

        // Check if current password matches
        const passwordMatches = await user.comparePassword(currentPassword);
        if (!passwordMatches) {
            res.status(401).json({ message: 'Invalid current password' });
            return;
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({ message: "Password updated" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
