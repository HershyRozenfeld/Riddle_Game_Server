import express from 'express';
import dotenv from 'dotenv';
import { connectToMongo } from './db/mongo.js';
import supabaseB from './db/supabaseClient.js'
import riddleRoutes from './routes/riddles.js';
import playerRoutes from './routes/players.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// const PORT = 3000;

app.use(express.json());

app.use('/api/riddles', riddleRoutes);
app.use('/api/players', playerRoutes);

async function startServer() {
  try {
    await connectToMongo();
    app.listen(PORT, () => {
      console.log(`Server is listening on http://localhost:${PORT}`);
    })
  } catch (error) {
    console.error('Failed to start server:', error);
  }
  
}

startServer();
