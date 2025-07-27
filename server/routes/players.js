import { Router } from "express";
import { supabase } from '../db/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// Create new player with proper field mapping
router.post("/player", async (req, res) => {
  const { name, email } = req.body;
  console.log(`Creating player with name: ${name}, email: ${email}`);
  if (!name || !email) {
    return res.status(400).json({ message: "Name and email are required" });
  }

  try {
    const playerData = {
      name: name.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      solved_riddles: [],
      stats: {
        totalRiddles: 0,
        totalTimeSeconds: 0,
        averageTimeSeconds: 0,
        levelProgress: {
          Easy: 0,
          Medium: 0,
          Hard: 0
        }
      },
      last_played: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from("players")
      .insert(playerData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating player: ${error.message}, Error code: ${error.code}`);
      if (error.code === "23505" || error.message.includes("duplicate key")) {
        return res.status(409).json({ message: "Email already exists" });
      }
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to create player", 
      error: err.message 
    });
  }
});

// Get player by email (more reliable than username)
router.get("/player/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const { data: player, error: playerErr } = await supabase
      .from("players")
      .select("*")
      .eq("email", email)
      .single();

    if (playerErr || !player) {
      return res.status(404).json({ message: "Player not found" });
    }

    const { data: scores, error: scoresErr } = await supabase
      .from("player_scores")
      .select("*")
      .eq("player_id", player.id)
      .order("solved_at", { ascending: false });

    if (scoresErr) throw scoresErr;

    res.status(200).json({
      profile: player,
      scores: scores || []
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to fetch player data", 
      error: err.message 
    });
  }
});

// Submit score with EXTENSIVE DEBUG LOGGING
router.post("/submit-score", async (req, res) => {
  console.log("🎯 === SUBMIT SCORE STARTED ===");
  console.log("📨 Request body:", req.body);
  
  const { email, riddle_id, time_to_solve, riddle_level } = req.body;

  if (!email || !riddle_id || time_to_solve === undefined) {
    console.log("❌ Missing required fields");
    return res.status(400).json({
      message: "Missing required fields: email, riddle_id, time_to_solve"
    });
  }

  try {
    console.log("🔍 Looking for player with email:", email);
    
    // Find player by email
    let { data: player, error: findErr } = await supabase
      .from("players")
      .select("*")
      .eq("email", email)
      .single();

    console.log("📊 Player query result:", { player: player?.name, error: findErr?.message });

    if (findErr && !findErr.message.includes("No rows")) {
      console.log("❌ Player lookup error:", findErr);
      throw findErr;
    }

    if (!player) {
      console.log("❌ Player not found");
      return res.status(404).json({ message: "Player not found. Create player first." });
    }

    const playerId = player.id;
    console.log("✅ Found player ID:", playerId);

    // Check if riddle already solved
    console.log("🔍 Checking if riddle already solved...");
    console.log("Player solved riddles:", player.solved_riddles);
    console.log("Current riddle ID:", riddle_id);
    
    if (player.solved_riddles.includes(riddle_id)) {
      console.log("⚠️  Riddle already solved!");
      return res.status(400).json({ message: "Riddle already solved by this player" });
    }

    console.log("✅ Riddle not solved yet, proceeding...");

    // Insert score
    console.log("💾 Inserting score to player_scores table...");
    const scoreInsertData = { 
      player_id: playerId, 
      riddle_id, 
      time_to_solve,
      solved_at: new Date().toISOString()
    };
    console.log("📝 Score data to insert:", scoreInsertData);
    
    const { data: scoreData, error: scoreErr } = await supabase
      .from("player_scores")
      .insert(scoreInsertData)
      .select();
      
    console.log("📊 Score insert result:", { data: scoreData, error: scoreErr?.message });
    
    if (scoreErr) {
      console.log("❌ Score insert failed:", scoreErr);
      throw scoreErr;
    }

    console.log("✅ Score inserted successfully");

    console.log("📈 Updating player stats...");
    const updatedSolvedRiddles = [...player.solved_riddles, riddle_id];
    const currentStats = player.stats || {
      totalRiddles: 0,
      totalTimeSeconds: 0,
      averageTimeSeconds: 0,
      levelProgress: { Easy: 0, Medium: 0, Hard: 0 }
    };

    const newTotalTime = currentStats.totalTimeSeconds + time_to_solve;
    const newTotalRiddles = currentStats.totalRiddles + 1;
    const newAverage = Math.round(newTotalTime / newTotalRiddles);

    // Update level progress
    const levelProgress = { ...currentStats.levelProgress };
    if (riddle_level && levelProgress.hasOwnProperty(riddle_level)) {
      levelProgress[riddle_level]++;
    }

    const updatedStats = {
      totalRiddles: newTotalRiddles,
      totalTimeSeconds: newTotalTime,
      averageTimeSeconds: newAverage,
      levelProgress
    };

    console.log("📊 New stats:", updatedStats);
    console.log("📝 New solved riddles:", updatedSolvedRiddles);

    // Update player record
    console.log("💾 Updating player record...");
    const { error: updateErr } = await supabase
      .from("players")
      .update({ 
        solved_riddles: updatedSolvedRiddles,
        stats: updatedStats,
        last_played: new Date().toISOString()
      })
      .eq("id", playerId);

    console.log("📊 Player update result:", { error: updateErr?.message });

    if (updateErr) {
      console.log("❌ Player update failed:", updateErr);
      throw updateErr;
    }

    console.log("✅ Player updated successfully");
    console.log("🎉 === SUBMIT SCORE COMPLETED ===");

    res.status(201).json({ 
      message: "Score submitted successfully",
      updatedStats
    });
    
  } catch (err) {
    console.log("💥 SUBMIT SCORE ERROR:", err);
    console.log("Stack trace:", err.stack);
    res.status(500).json({ 
      message: "Failed to submit score", 
      error: err.message 
    });
  }
});

// Get leaderboard based on average time (better metric)
router.get("/leaderboard", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("players")
      .select("name, email, stats")
      .not("stats", "is", null)
      .order("last_played", { ascending: false });

    if (error) throw error;

    // Sort by average time and total riddles solved
    const leaderboard = data
      .filter(player => player.stats.totalRiddles > 0)
      .sort((a, b) => {
        // Primary sort: more riddles solved
        if (b.stats.totalRiddles !== a.stats.totalRiddles) {
          return b.stats.totalRiddles - a.stats.totalRiddles;
        }
        // Secondary sort: better average time
        return a.stats.averageTimeSeconds - b.stats.averageTimeSeconds;
      })
      .slice(0, 10)
      .map((player, index) => ({
        rank: index + 1,
        name: player.name,
        email: player.email,
        totalRiddles: player.stats.totalRiddles,
        averageTime: player.stats.averageTimeSeconds,
        levelProgress: player.stats.levelProgress
      }));

    res.status(200).json(leaderboard);
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to fetch leaderboard", 
      error: err.message 
    });
  }
});

// Get player statistics
router.get("/stats/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const { data: player, error } = await supabase
      .from("players")
      .select("name, stats, last_played")
      .eq("email", email)
      .single();

    if (error || !player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.status(200).json({
      name: player.name,
      stats: player.stats,
      lastPlayed: player.last_played
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Failed to fetch player stats", 
      error: err.message 
    });
  }
});

export default router;