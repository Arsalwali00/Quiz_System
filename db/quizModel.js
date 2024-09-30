const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables

// Database connection pool using environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// Run a database query with error handling
const runQuery = async (query, values = []) => {
  try {
    const result = await pool.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error executing query:', error);
    throw new Error('Database query failed');
  }
};

// Fetch all quizzes
const getAllQuizzes = async () => {
  const query = 'SELECT * FROM quizzes';
  return await runQuery(query);
};

// Fetch a quiz by ID, including its questions and answers
const getQuizById = async (quizId) => {
  const quizQuery = 'SELECT * FROM quizzes WHERE id = $1';
  const quiz = await runQuery(quizQuery, [quizId]);

  if (quiz.length === 0) {
    throw new Error('Quiz not found');
  }

  // Fetch all questions for this quiz
  const questionQuery = 'SELECT * FROM questions WHERE quiz_id = $1';
  const questions = await runQuery(questionQuery, [quizId]);

  // Fetch answers for each question
  for (let question of questions) {
    const answerQuery = 'SELECT * FROM answers WHERE question_id = $1';
    const answers = await runQuery(answerQuery, [question.id]);
    question.answers = answers;  // Add answers to each question object
  }

  return {
    quiz: quiz[0],
    questions: questions
  };
};

// Submit a quiz and calculate the score
const submitQuiz = async (userId, quizId, answers) => {
  let score = 0;

  for (let answer of answers) {
    const query = 'SELECT is_correct FROM answers WHERE id = $1 AND question_id = $2';
    const result = await runQuery(query, [answer.answerId, answer.questionId]);

    if (result.length > 0 && result[0].is_correct) {
      score++;  // Increment score for each correct answer
    }
  }

  // Save the result in the results table
  const saveResultQuery = 'INSERT INTO results (user_id, quiz_id, score) VALUES ($1, $2, $3)';
  await runQuery(saveResultQuery, [userId, quizId, score]);

  return score;  // Return the final score
};

// Register a new user
const registerUser = async (name, email, password) => {
  const hashedPassword = await bcrypt.hash(password, 10); // Hash the user's password
  const query = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id';
  const result = await runQuery(query, [name, email, hashedPassword]);

  return result[0].id;  // Return the new user's ID
};

// Login a user
const loginUser = async (email, password) => {
  const query = 'SELECT * FROM users WHERE email = $1';
  const users = await runQuery(query, [email]);

  if (users.length === 0) {
    throw new Error('User not found');
  }

  const user = users[0];
  const isMatch = await bcrypt.compare(password, user.password);  // Check if the passwords match

  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  return user.id;  // Return the logged-in user's ID
};

module.exports = {
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  registerUser,
  loginUser
};
