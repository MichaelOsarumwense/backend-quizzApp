const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // Import PostgreSQL pool
const { endpoints } = require('./endpoints');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Create a PostgreSQL pool connection (update with your credentials)
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST || 'localhost',
  database: process.env.DATABASE || 'quizdb',
  password: process.env.PASSWORD,
  port: process.env.PORT || 5432,
});

//Endpoints
endpoints.home(app),
endpoints.getQuizzes(app, pool),
endpoints.submitQuizzes(app, pool)
endpoints.submitResult(app, pool)
endpoints.getResults(app, pool)
endpoints.updateQuiz(app, pool)
endpoints.deleteQuiz(app, pool)

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
