import { Router } from "express";
const router = Router();

router.get('/supabase', async (req, res) => {
  try {
    console.log("🔍 Testing Supabase connection...");
    
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("*")
      .limit(1);
    
    if (playersError) {
      console.log("❌ Players table error:", playersError);
      return res.status(500).json({ 
        error: "Players table error", 
        details: playersError 
      });
    }
    
    const { data: scores, error: scoresError } = await supabase
      .from("player_scores")
      .select("*")
      .limit(1);
    
    if (scoresError) {
      console.log("❌ Scores table error:", scoresError);
      return res.status(500).json({ 
        error: "Scores table error", 
        details: scoresError 
      });
    }
    
    res.json({
      message: "Supabase connection OK",
      playersCount: players ? players.length : 0,
      scoresCount: scores ? scores.length : 0,
      samplePlayer: players?.[0] || null
    });
    
  } catch (error) {
    console.log("💥 Supabase debug error:", error);
    res.status(500).json({ 
      error: "Connection failed", 
      details: error.message 
    });
  }
});

export default router;