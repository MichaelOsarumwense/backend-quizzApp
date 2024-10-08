export const endpoints = {
  // Example endpoint to retrieve quiz data
  home: (app) => app.get('/api/home', async (req, res) => {
    try {
      res.json({ hello: 'man' });
    } catch (error) {
      console.error('Error retrieving quiz data:', error.message);
      res.status(500).json({ success: false, message: 'Error retrieving quiz data' });
    }
  }),

  // Endpoint to retrieve all quiz questions
  getQuizzes: (app, pool) => app.get('/api/quizzes', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM quizzes');
      res.json(result.rows);
    } catch (error) {
      console.error('Error retrieving quiz data:', error.message);
      res.status(500).json({ success: false, message: 'Error retrieving quiz data' });
    }
  }),

  // Endpoint to add a new quiz question
  submitQuizzes: (app, pool) => app.post('/api/quizzes', async (req, res) => {
    const { question, options, correct_answer } = req.body;
    console.log('New Question:', req.body);

    try {
      const queryText = 'INSERT INTO quizzes (question, options, correct_answer) VALUES ($1, $2, $3) RETURNING *';
      const values = [question, options, correct_answer];
      const result = await pool.query(queryText, values);
      console.log('Saved quiz question:', result.rows[0]);

      res.status(201).json({ success: true, message: 'Question added successfully!', question: result.rows[0] });
    } catch (error) {
      console.error('Error adding question:', error.message);
      res.status(500).json({ success: false, message: 'Error adding question' });
    }
  }),

  // Endpoint to submit quiz results
  submitResult: (app, pool) => app.post('/api/submit-quiz', async (req, res) => {
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
  }),

  getResults: (app, pool) => app.get('/api/quiz-results', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM quiz_results'); // Modify based on your schema
      res.json(result.rows);
    } catch (error) {
      console.error('Error retrieving quiz results:', error.message);
      res.status(500).json({ success: false, message: 'Error retrieving quiz results' });
    }
  }),
  

  // Endpoint to update an existing quiz question
  updateQuiz: (app, pool) => app.put('/api/quizzes/:id', async (req, res) => {
    const { id } = req.params;
    const { question, options, correct_answer } = req.body;

    try {
      const queryText = 'UPDATE quizzes SET question = $1, options = $2, correct_answer = $3 WHERE id = $4 RETURNING *';
      const values = [question, options, correct_answer, id];
      const result = await pool.query(queryText, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      res.json({ success: true, message: 'Question updated successfully!', question: result.rows[0] });
    } catch (error) {
      console.error('Error updating question:', error.message);
      res.status(500).json({ success: false, message: 'Error updating question' });
    }
  }),

  // Endpoint to delete a quiz question
  deleteQuiz: (app, pool) => app.delete('/api/quizzes/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const queryText = 'DELETE FROM quizzes WHERE id = $1 RETURNING *';
      const values = [id];
      const result = await pool.query(queryText, values);

      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, message: 'Question not found' });
      }

      res.json({ success: true, message: 'Question deleted successfully!', question: result.rows[0] });
    } catch (error) {
      console.error('Error deleting question:', error.message);
      res.status(500).json({ success: false, message: 'Error deleting question' });
    }
  }),
};
