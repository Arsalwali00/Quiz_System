const jwt = require('jsonwebtoken');
const JWT_SECRET = 'a3$G9^h39&lL4P!zR@59jKsz4F92';  // Same secret used for signing tokens

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;  // Attach the userId from the token to the request object
    next();
  });
};

module.exports = { authenticateToken };
