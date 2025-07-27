import express from 'express';
import dotenv from 'dotenv';
import { connectToMongo, getDb } from './db/mongo.js';
import { ObjectId } from 'mongodb'; 
import supabaseB from './db/supabaseClient.js'
import riddleRoutes from './routes/riddles.js';
import playerRoutes from './routes/players.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/riddles', riddleRoutes);
app.use('/api/players', playerRoutes);

// endpoint חדש שמחזיר חידה רנדומלית למשחק
app.get('/api/play/random-riddle', async (req, res) => {
  try {
    const db = getDb();
    const riddles = await db.collection('Riddle').find({}).toArray();

    if (riddles.length === 0) {
      return res.status(404).json({ message: 'No riddles available' });
    }

    // בחירת חידה רנדומלית
    const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];

    // החזרת החידה בלי התשובה הנכונה
    res.json({
      id: randomRiddle._id,
      name: randomRiddle.name,
      question: randomRiddle.question,
      level: randomRiddle.level
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get riddle', error: error.message });
  }
});

// endpoint לבדיקת תשובה
app.post('/api/play/check-answer', async (req, res) => {
  const { riddleId, userAnswer } = req.body;
  console.log(`Checking answer for riddle ID: ${riddleId}, User Answer: ${userAnswer}`);// Debugging line
  try {
    const db = getDb();
    const riddle = await db.collection('Riddle').findOne({ _id: new ObjectId(riddleId) });
    console.log(`Found riddle: ${JSON.stringify(riddle)}`); // Debugging line
    if (!riddle) {
      return res.status(404).json({ message: 'Riddle not found' });
    }

    const isCorrect = userAnswer.toString().toLowerCase().trim() ===
      riddle.answer.toString().toLowerCase().trim();
    console.log(`Is answer correct? ${isCorrect}`); // Debugging line
    res.json({
      correct: isCorrect,
      correctAnswer: riddle.answer,
      riddleName: riddle.name
    });
    console.log(`Response sent: ${isCorrect ? 'Correct' : 'Incorrect'}`); // Debugging line
  } catch (error) {
    res.status(500).json({ message: 'Failed to check answer', error: error.message });
  }
});

async function startServer() {
  try {
    await connectToMongo();
    console.log('Connected to MongoDB successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT}`);
      console.log('Available endpoints:');
      console.log('  📚 GET /api/riddles - Get all riddles');
      console.log('  ➕ POST /api/riddles - Create riddle');
      console.log('  🎲 GET /api/play/random-riddle - Get random riddle');
      console.log('  ✅ POST /api/play/check-answer - Check answer');
      console.log('  🏆 GET /api/players/leaderboard - Get leaderboard');
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();