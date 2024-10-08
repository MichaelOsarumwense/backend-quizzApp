export const home = (app) => app.get('/', async (req, res) => {
    try {
      res.json({"message": "hello"});
    } catch (err) {
      res.status(500).send(err.message);
    }
  })

export const getQuiz = (app, pool) => app.get('/api/quizzes', async (req, res) => {
        try {
          const result = await pool.query('SELECT * FROM quizzes');
          res.json(result.rows);
        } catch (err) {
          res.status(500).send(err.message);
        }
      })

      export const postQUizQuestion = (app, pool) => app.post('/api/quizzes', async (req, res) => {
        const { question, options, correctAnswer } = req.body;
        try {
          const result = await pool.query(
            'INSERT INTO quizzes (question, options, correct_answer) VALUES ($1, $2, $3) RETURNING *',
            [question, options, correctAnswer]
          );
          res.json(result.rows[0]);
        } catch (err) {
          res.status(500).send(err.message);
        }
      })

      export const postResult = (app) => app.post('/api/submit-quiz', async (req, res) => {
        // Implement logic to save quiz results
        res.json({ success: true });
      })

  
  