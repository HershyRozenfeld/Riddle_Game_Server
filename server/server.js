import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const app = express();
app.use(express.json());

const PORT = 3000;
const filePath = path.resolve('server/db/riddles.txt');

async function readRiddles() {
  try {
    console.log(filePath);
    const data = await readFile(filePath, 'utf8');
    console.log('Riddles loaded successfully:', data);
    return JSON.parse(data);
  } catch {
    return { Easy: [], Medium: [], Hard: [] };
  }
}

async function writeRiddles(data) {
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

app.get('/play', (req, res) => {
  res.send('🎮 Starting the game... (Not implemented yet)');
});

app.get('/riddles', async (req, res) => {
  console.log("Fetching all riddles...");
  const data = await readRiddles();
  res.json(data);
});

app.post('/riddles', async (req, res) => {
  const { level = 'Easy', name, TaskDescription, CorrectAnswer } = req.body;
  const data = await readRiddles();
  const allIds = Object.values(data).flat().map(r => r.id);
  const newId = Math.max(0, ...allIds) + 1;
  const riddle = { id: newId, name, TaskDescription, CorrectAnswer };
  if (!data[level]) data[level] = [];
  data[level].push(riddle);
  await writeRiddles(data);
  res.status(201).json(riddle);
});

app.put('/riddles/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const updates = req.body;
  const data = await readRiddles();
  for (const [lvl, riddles] of Object.entries(data)) {
    const riddle = riddles.find(r => r.id === id);
    if (riddle) {
      Object.assign(riddle, updates);
      await writeRiddles(data);
      return res.json(riddle);
    }
  }
  res.status(404).send('Riddle not found');
});

app.delete('/riddles/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const data = await readRiddles();
  for (const [lvl, riddles] of Object.entries(data)) {
    const index = riddles.findIndex(r => r.id === id);
    if (index !== -1) {
      const removed = riddles.splice(index, 1)[0];
      await writeRiddles(data);
      return res.json(removed);
    }
  }
  res.status(404).send('Riddle not found');
});

app.get('/leaderboard', (req, res) => {
  res.send('🏆 Leaderboard data goes here...');
});

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});
