const express = require('express');
const router = express.Router();
const User = require('../models/user');

const { jwtAuthMiddleware, generateToken } = require('../jwt');

const Candidate = require('../models/candidate'); // Import


// Define the checkAdminRole function if it's not already defined

   const checkAdminRole = async (userID) => {
        try {
            const user = await User.findById(userID);
            if( user.role === 'admin')
            {
                return true;
            }
            
        }
        catch (err) {
            console.error('Error in checkAdminRole:', err);
            return false;
        }
    };



//  create new candidate by admin

router.post('/', jwtAuthMiddleware, async (req, res) => { // corrected jwtAuthMiddlewareasync to jwtAuthMiddleware
    try {
        // Ensure jwtAuthMiddleware is awaited if it's asynchronous
        // If jwtAuthMiddleware throws an error, it will be caught in the catch block below

        // Check admin role
        if (! await checkAdminRole(req.user.id)) 
            return res.status(403).json({ message: 'User does not have admin role' });
        

        const data = req.body; // Get candidate data from request body

        // Create a new candidate document using the Candidate model
        const newCandidate = new Candidate(data); // corrected variable name

        // Save the new candidate document
        const savedCandidate = await newCandidate.save(); // corrected variable name with uppercase C

        console.log('Data saved');
        res.status(200).json(savedCandidate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});



// update the existing candidate

router.put('/:candidateID',  jwtAuthMiddleware , async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID; // Corrected variable name
        const updateCandidateData = req.body; // Corrected variable name

        const response = await Candidate.findByIdAndUpdate(candidateId, updateCandidateData, {
            new: true,
            runValidators: true
        });

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// delete the existing candidate

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        const isAdmin = await checkAdminRole(req.user.id);
        if (!isAdmin) {
            return res.status(403).json({ message: 'User does not have admin role' });
        }

        const candidateId = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateId);

        if (!response) {
            return res.status(404).json({ error: 'Candidate not found' });
        }

        console.log('Candidate deleted');
        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// let's start voting

    // no admin can vote
    // user can only vote once

    router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
        // Extract candidate ID and user ID from request parameters
        const candidateId = req.params.candidateID;
        const userId = req.user.id;
    
        try {
            // Find the candidate by ID
            const candidate = await Candidate.findById(candidateId);
            if (!candidate) {
                return res.status(404).json({ message: 'Candidate not found' });
            }
    
            // Find the user by ID
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
    
            // Check if user has already voted
            if (user.isVoted) {
                return res.status(400).json({ message: 'You have already voted' });
            }
    
            // Check if user is admin
            if (user.role === 'admin') {
                return res.status(403).json({ message: 'Admin is not allowed to vote' });
            }
    
            // Push the user's ID into the votes array of the candidate
            candidate.votes.push({ user: userId });
    
            // Increment the voteCount property of the candidate
            candidate.voteCount++;
    
            // Save changes to the candidate document
            await candidate.save();
    
            // Mark user as voted
            user.isVoted = true;
            await user.save();
    
            // Send success response
            res.status(200).json({ message: 'Vote recorded successfully' });
        } catch (err) {
            console.error('Error casting vote:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
    
    // count the vote

    router.get('/vote/count', async (req, res) => {
        try {
            // Find all candidates and sort by voteCount in descending order
            const candidates = await Candidate.find().sort({ voteCount: 'desc' });
    
            // Map candidates to extract party and voteCount
            const voteRecord = candidates.map((data) => {
                return {
                    party: data.party,
                    count: data.voteCount
                };
            });
    
            // Send the voteRecord as JSON response
            return res.status(200).json(voteRecord);
        } catch (err) {
            console.error('Error fetching vote count:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });


    // list the candidate

    router.get('/list', async(req,res)=>{
        try
        {
            const candidate = await Candidate.find();
            
            if (!candidate || candidate.length === 0) {
                return res.status(404).json({ message: 'No candidates found' });
            }


            res.status(200).json(candidate);



    




        }

        catch(err)
        {
            console.error('Error casting vote:', err);
            res.status(500).json({ error: 'Internal server error' });

        }
    })



module.exports = router;
