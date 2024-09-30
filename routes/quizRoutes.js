const express = require('express');
const jwt = require('jsonwebtoken');
const { 
  getAllQuizzes, 
  getQuizById, 
  submitQuiz, 
  registerUser, 
  loginUser 
} = require('../db/quizModel'); // Importing the database functions
const { authenticateToken } = require('../middlewares/auth'); // Importing the JWT middleware

const router = express.Router();
const JWT_SECRET = 'a3$G9^h39&lL4P!zR@59jKsz4F92';  // Replace with a secure secret key

// ------------------- User Registration -------------------
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userId = await registerUser(name, email, password);

    // Generate a JWT token for the registered user
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'User registered successfully', token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// ------------------- User Login -------------------
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userId = await loginUser(email, password);

    // Generate a JWT token for the logged-in user
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

// ------------------- Fetch All Quizzes -------------------
router.get('/all', async (req, res) => {
  try {
    const quizzes = await getAllQuizzes();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: 'Error fetching quizzes' });
  }
});

// ------------------- Fetch Quiz by ID -------------------
router.get('/:id', async (req, res) => {
  const quizId = req.params.id;

  try {
    const quiz = await getQuizById(quizId);
    res.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'Error fetching quiz' });
  }
});

// ------------------- Submit Quiz (Protected) -------------------
router.post('/submit', authenticateToken, async (req, res) => {
  const { quizId, answers } = req.body;
  const userId = req.userId;  // Extracted from the JWT token

  try {
    const score = await submitQuiz(userId, quizId, answers);
    res.json({ message: 'Quiz submitted successfully', score });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Error submitting quiz' });
  }
});

module.exports = router;
