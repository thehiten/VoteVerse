const jwt = require('jsonwebtoken');

// Middleware function to authenticate JWT token
const jwtAuthMiddleware = (req, res, next) => {
     
    //  first check request header has authorization or not

    const authorization = req.headers.authorization
    if(!authorization)
    {
        return res.status(401).json({error: 'Token not found'});

    }

    const token = req.headers.authorization.split(' ')[1]; // Extract token from the authorization header
    if (!token) return res.status(401).json({ error: 'Unauthorized' }); // Return unauthorized error if token is missing
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET); // Verify JWT token
        req.user = decode; // Attach decoded user data to request object
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        console.error(err);
        res.status(401).json({ error: 'Invalid token' }); // Return invalid token error if token is invalid
    }
}

// Function to generate JWT token
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET); // Sign user data with JWT secret to generate token
}



module.exports = { jwtAuthMiddleware, generateToken };