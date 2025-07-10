import express from "express";
import { readRiddlesFromFile, setRiddles } from "./utils/crudUtils.js";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/play", (req, res) => {
  res.send("🎮 Starting the game... (Not implemented yet)");
});

app.post("/riddles", async (req, res) => {
  const newRiddle = req.body;
  const riddleObj = await setRiddles(newRiddle);
  res.status(201).send(`🧩 New riddle created: ${JSON.stringify(riddleObj)}`);
});

app.get("/riddles", async (req, res) => {
  const data = await readRiddlesFromFile();
  res.json(data);
});

app.put("/riddles/:id", (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  res.send(
    `✏️ Riddle with ID ${id} updated to: ${JSON.stringify(updatedData)}`
  );
});

app.delete("/riddles/:id", (req, res) => {
  const { id } = req.params;
  res.send(`🗑️ Riddle with ID ${id} deleted`);
});

app.get("/leaderboard", (req, res) => {
  res.send("🏆 Leaderboard data goes here...");
});

app.listen(PORT, () => {
  console.log(`🔥 Server running at http://localhost:${PORT}`);
});


