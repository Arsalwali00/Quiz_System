const express = require('express');
require('dotenv').config();  // Load environment variables from .env file
const quizRoutes = require('./routes/quizRoutes');
const app = express();

// Middleware
app.use(express.json());  // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded data
app.use(express.static('views'));  // Serve static files
app.use(express.static('public'));



// Routes
app.use('/api/quiz', quizRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Default error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const port = process.env.PORT || 3900;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
