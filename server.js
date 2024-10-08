const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // Import PostgreSQL pool

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Parse JSON request bodies

// Create a PostgreSQL pool connection (update with your credentials)
const pool = new Pool({
  user: '',  // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'quizdb',     // Replace with your database name
  password: '', // Replace with your PostgreSQL password
  port: 5432,
});

// Example endpoint to retrieve quiz data
app.get('/api/home', async (req, res) => {
  try {
    // Modify this query based on your schema
    res.json({"hello":"man"});
  } catch (error) {
    console.error('Error retrieving quiz data:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving quiz data' });
  }
});

// Example endpoint to retrieve quiz data
app.get('/api/quizzes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quizzes'); // Modify this query based on your schema
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving quiz data:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving quiz data' });
  }
});

// Endpoint to submit quiz results
app.post('/api/quizzes', async (req, res) => {
  const { question, options, correct_answer } = req.body; // Destructure request body
  console.log('New Question:', req.body);

  // Insert the new quiz question into the database
  try {
    const queryText = 'INSERT INTO quizzes (question, options, correct_answer) VALUES ($1, $2, $3) RETURNING *';
    const values = [question, options, correct_answer]; 

    const result = await pool.query(queryText, values);
    console.log('Saved quiz question:', result.rows[0]);

    // Send a success response
    res.status(201).json({ success: true, message: 'Question added successfully!', question: result.rows[0] });
  } catch (error) {
    console.error('Error adding question:', error.message);
    res.status(500).json({ success: false, message: 'Error adding question' });
  }
});

// Endpoint to submit quiz results
app.post('/api/submit-quiz', async (req, res) => {
  const { results } = req.body; // Access quiz results from the request body
  console.log('Quiz Results:', results);

  try {
    // Loop through each quiz result and save it to the database
    for (const result of results) {
      // Find the corresponding quiz ID from the question text
      const quizQuery = 'SELECT id FROM quizzes WHERE question = $1';
      const quizResult = await pool.query(quizQuery, [result.question]);
      
      if (quizResult.rows.length > 0) {
        const quizId = quizResult.rows[0].id;
        const isCorrect = result.correct;

        // Insert the result into quiz_results
        const insertQuery = `
          INSERT INTO quiz_results (quiz_id, user_id, selected_answer, is_correct) 
          VALUES ($1, $2, $3, $4) RETURNING *`;
        const values = [quizId, null, result.userAnswer, isCorrect]; // Assuming no user ID is provided for now

        const resultInsert = await pool.query(insertQuery, values);
        console.log('Saved quiz result:', resultInsert.rows[0]);
      }
    }

    // Send a success response after saving all results
    res.json({ success: true, message: 'Quiz results saved successfully!' });
  } catch (error) {
    console.error('Error saving quiz results:', error.message);
    res.status(500).json({ success: false, message: 'Error saving quiz results' });
  }
});


// Endpoint to fetch previous quiz results
app.get('/api/quiz-results', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM quiz_results'); // Modify based on your schema
    res.json(result.rows);
  } catch (error) {
    console.error('Error retrieving quiz results:', error.message);
    res.status(500).json({ success: false, message: 'Error retrieving quiz results' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
