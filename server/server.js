import express from 'express';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import pg from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// MongoDB setup
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/riddle_game';
const mongoClient = new MongoClient(mongoUrl);
let riddlesCollection;

// PostgreSQL setup
const pgPool = new pg.Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});

async function initPostgres() {
  await pgPool.query(`CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      best_time INT DEFAULT 0
  );`);

  await pgPool.query(`CREATE TABLE IF NOT EXISTS player_scores (
      id SERIAL PRIMARY KEY,
      player_id INT REFERENCES players(id),
      riddle_id TEXT,
      time_to_solve INT,
      solved_at TIMESTAMP DEFAULT NOW()
  );`);
}

async function initMongo() {
  await mongoClient.connect();
  const db = mongoClient.db();
  riddlesCollection = db.collection('riddles');
}

async function init() {
  await initMongo();
  await initPostgres();
}

// ----- Riddle Endpoints -----
app.get('/riddles', async (req, res) => {
  const riddles = await riddlesCollection.find().toArray();
  res.json(riddles);
});

app.post('/riddle', async (req, res) => {
  const { question, answer, level = 'easy' } = req.body;
  const result = await riddlesCollection.insertOne({ question, answer, level });
  res.status(201).json({ _id: result.insertedId, question, answer, level });
});

app.put('/riddle/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  await riddlesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updates });
  const updated = await riddlesCollection.findOne({ _id: new ObjectId(id) });
  res.json(updated);
});

app.delete('/riddle/:id', async (req, res) => {
  const { id } = req.params;
  const result = await riddlesCollection.findOneAndDelete({ _id: new ObjectId(id) });
  if (result.value) return res.json(result.value);
  res.status(404).send('Riddle not found');
});

app.post('/load-initial-riddles', async (_req, res) => {
  const filePath = path.join('initial_riddles.json');
  const content = await readFile(filePath, 'utf8');
  const riddles = JSON.parse(content);
  await riddlesCollection.insertMany(riddles);
  res.status(201).send('Riddles loaded');
});

// ----- Player Endpoints -----
app.post('/player', async (req, res) => {
  const { username } = req.body;
  try {
    const { rows } = await pgPool.query(
      'INSERT INTO players(username) VALUES($1) RETURNING *',
      [username]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const { rows } = await pgPool.query('SELECT * FROM players WHERE username=$1', [username]);
      return res.json(rows[0]);
    }
    res.status(500).send('Failed to create player');
  }
});

app.post('/submit-score', async (req, res) => {
  const { username, riddleId, time } = req.body;
  const { rows } = await pgPool.query('SELECT * FROM players WHERE username=$1', [username]);
  if (rows.length === 0) return res.status(404).send('Player not found');
  const player = rows[0];
  await pgPool.query(
    'INSERT INTO player_scores(player_id, riddle_id, time_to_solve) VALUES($1,$2,$3)',
    [player.id, riddleId, time]
  );
  if (!player.best_time || time < player.best_time) {
    await pgPool.query('UPDATE players SET best_time=$1 WHERE id=$2', [time, player.id]);
  }
  res.status(201).send('Score submitted');
});

app.get('/leaderboard', async (_req, res) => {
  const { rows } = await pgPool.query(
    'SELECT username, best_time FROM players WHERE best_time > 0 ORDER BY best_time ASC LIMIT 10'
  );
  res.json(rows);
});

app.get('/player/:username', async (req, res) => {
  const { username } = req.params;
  const { rows } = await pgPool.query('SELECT * FROM players WHERE username=$1', [username]);
  if (rows.length === 0) return res.status(404).send('Player not found');
  const player = rows[0];
  const scores = await pgPool.query(
    'SELECT riddle_id, time_to_solve, solved_at FROM player_scores WHERE player_id=$1 ORDER BY solved_at DESC',
    [player.id]
  );
  res.json({ player, scores: scores.rows });
});

init().then(() => {
  app.listen(PORT, () => {
    console.log(`\u{1F525} Server running at http://localhost:${PORT}`);
  });
});
