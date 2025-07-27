import { Router } from "express";
import { supabase } from '../db/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();



router.post("/player", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .insert({ username })
      .select()
      .single();

    if (error) {
      if (error.code === "23505" || error.message.includes("duplicate key")) {
        return res.status(409).json({ message: "Username already exists" });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create player", error: err.message });
  }
});

// === החזרת נתוני שחקן + תוצאות ===
router.get("/player/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // הבאת פרופיל
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("*")
      .eq("name", username)
      .single();
    console.log(`Player data: ${JSON.stringify(player)}`); // Debugging line
    console.log(`Player error: ${JSON.stringify(playerErr)}`); // Debugging line
    if (playerErr || !player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // הבאת תוצאות
    const { data: scores, error: scoresErr } = await supabase
      .from("player_scores")
      .select("*")
      .eq("player_id", player.id)
      .order("solved_at", { ascending: false });

    if (scoresErr) throw scoresErr;

    res.status(200).json({
      profile: player,
      scores,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch player data", error: err.message });
  }
});

// === שליחת תוצאה של שחקן ===
router.post("/submit-score", async (req, res) => {
  const { username, riddle_id, time_to_solve } = req.body;

  if (!username || !riddle_id || time_to_solve === undefined) {
    return res
      .status(400)
      .json({
        message: "Missing required fields: username, riddle_id, time_to_solve",
      });
  }

  try {
    // מצא או צור את השחקן
    let { data: player, error: findErr } = await supabase
      .from("players")
      .select("id, best_time")
      .eq("username", username)
      .single();

    if (findErr && !findErr.message.includes("No rows")) throw findErr;

    if (!player) {
      const insertRes = await supabase
        .from("players")
        .insert({ username })
        .select("id, best_time")
        .single();

      if (insertRes.error) throw insertRes.error;
      player = insertRes.data;
    }

    const playerId = player.id;

    // שמור את התוצאה
    const { error: scoreErr } = await supabase
      .from("player_scores")
      .insert({ player_id: playerId, riddle_id, time_to_solve });

    if (scoreErr) throw scoreErr;

    // עדכן best_time אם צריך
    if (player.best_time === null || time_to_solve < player.best_time) {
      const { error: updateErr } = await supabase
        .from("players")
        .update({ best_time: time_to_solve })
        .eq("id", playerId);

      if (updateErr) throw updateErr;
    }

    res.status(201).json({ message: "Score submitted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to submit score", error: err.message });
  }
});

// === טבלת מובילים ===
router.get("/leaderboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("username, best_time")
      .not("best_time", "is", null)
      .order("best_time", { ascending: true })
      .limit(10);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch leaderboard", error: err.message });
  }
});

export default router;
