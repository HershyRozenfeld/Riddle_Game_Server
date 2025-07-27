import express from 'express';
import dotenv from 'dotenv';
import { connectToMongo, getDb } from './db/mongo.js';
import { ObjectId } from 'mongodb'; 
import { supabase } from './db/supabaseClient.js';
import riddleRoutes from './routes/riddles.js';
import playerRoutes from './routes/players.js';
import debugRouter from './routes/debug.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/riddles', riddleRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/debug', debugRouter);


async function startServer() {
  try {
    await connectToMongo();
    console.log('Connected to MongoDB successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();