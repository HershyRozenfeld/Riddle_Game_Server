import readlineSync from "readline-sync";
const SERVER_URL = "http://localhost:3000";

async function mainMenu() {
  console.log("\nWhat do you want to do?");
  console.log("1. Play the game");
  console.log("2. Create a new riddle");
  console.log("3. Read all riddles");
  console.log("4. Update a riddle");
  console.log("5. Delete a riddle");
  console.log("6. View leaderboard");

  const choice = readlineSync.questionInt("\nEnter your choice (1-6): ");

  switch (choice) {
    case 1:
      await playGame();
      break;
    case 2:
      await createRiddle();
      break;
    case 3:
      await readRiddles();
      break;
    case 4:
      await updateRiddle();
      break;
    case 5:
      await deleteRiddle();
      break;
    case 6:
      await viewLeaderboard();
      break;
    default:
      console.log("💥 Invalid choice. Try again.");
  }
  
  // חזרה לתפריט הראשי
  await mainMenu();
}

async function playGame() {
  console.log("\n🎮 Starting the game...");
  
  // קבלת שם שחקן
  const username = readlineSync.question("Enter your username: ");
  
  // בדיקה אם השחקן קיים וקבלת הזמן הטוב ביותר שלו
  let playerBestTime = null;
  try {
    const playerRes = await fetch(`${SERVER_URL}/api/players/player/${username}`);
    if (playerRes.ok) {
      const playerData = await playerRes.json();
      playerBestTime = playerData.profile.best_time;
      
      if (playerBestTime) {
        console.log(`\n👋 Hi ${username}! Your previous best time was ${playerBestTime} seconds.`);
        console.log("⏱️ Try to beat your record!");
      } else {
        console.log(`\n👋 Hi ${username}! This is your first game. Good luck!`);
      }
    } else {
      console.log(`\n👋 Hi ${username}! This is your first game. Good luck!`);
    }
  } catch (error) {
    console.log("\n⚠️ Could not check player history, but let's play anyway!");
  }
  
  console.log("\n🎯 Get ready! Press Enter to start...");
  readlineSync.question();
  
  const startTime = Date.now();
  let correctAnswers = 0;
  const totalRiddles = 3; 
  
  console.log(`\n🚀 Starting ${totalRiddles} riddles challenge!\n`);
  
  for (let i = 1; i <= totalRiddles; i++) {
    try {
      // קבלת חידה רנדומלית
      const riddleRes = await fetch(`${SERVER_URL}/api/play/random-riddle`);
      
      if (!riddleRes.ok) {
        console.log("💥 Failed to get riddle. Skipping...");
        continue;
      }
      
      const riddle = await riddleRes.json();
      
      console.log(`📝 Riddle ${i}/${totalRiddles} [${riddle.level}]:`);
      console.log(`   ${riddle.question}`);
      
      const userAnswer = readlineSync.question("Your answer: ");
      
      const checkRes = await fetch(`${SERVER_URL}/api/play/check-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          riddleId: riddle.id,
          userAnswer: userAnswer
        })
      });
      
      if (checkRes.ok) {
        const result = await checkRes.json();
        
        if (result.correct) {
          console.log("✅ Correct! Well done!\n");
          correctAnswers++;
        } else {
          console.log(`❌ Wrong! The correct answer was: ${result.correctAnswer}\n`);
        }
      } else {
        console.log("⚠️ Could not check answer. Moving on...\n");
      }
      
    } catch (error) {
      console.log(`💥 Error with riddle ${i}: ${error.message}\n`);
    }
  }
  
  const endTime = Date.now();
  const totalTimeSeconds = Math.round((endTime - startTime) / 1000);
  
  console.log("🏁 Game finished!");
  console.log(`📊 Results:`);
  console.log(`   Correct answers: ${correctAnswers}/${totalRiddles}`);
  console.log(`   Total time: ${totalTimeSeconds} seconds`);
  
  if (correctAnswers === totalRiddles) {
    console.log("🎉 Perfect score! All riddles solved!");
    
    try {
      const submitRes = await fetch(`${SERVER_URL}/api/players/submit-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          riddle_id: 1, 
          time_to_solve: totalTimeSeconds
        })
      });
      
      if (submitRes.ok) {
        if (playerBestTime === null || totalTimeSeconds < playerBestTime) {
          console.log("🏆 NEW PERSONAL RECORD! Time updated!");
        } else {
          console.log(`⏱️ Your best time is still ${playerBestTime} seconds. Keep trying!`);
        }
      } else {
        console.log("⚠️ Could not save your score, but great job anyway!");
      }
    } catch (error) {
      console.log("⚠️ Could not save your score, but great job anyway!");
    }
  } else {
    console.log("💪 Good effort! Try again to improve your score!");
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

async function createRiddle() {
  const level = readlineSync.question("Select difficulty (Easy/Medium/Hard): ");
  const name = readlineSync.question("Riddle name: ");
  const question = readlineSync.question("Riddle description: ");
  const answer = readlineSync.question("Correct answer: ").trim();
  
  const body = { level, name, question, answer };
  
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("✅ Riddle created successfully!");
      console.log(data);
    } else {
      console.error(`💥 Error: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    console.error("💥 Failed to create riddle:", error.message);
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

async function readRiddles() {
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles`);
    
    if (!res.ok) {
      console.error(`💥 Error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log("\n📚 === All Riddles ===");
    
    if (data.length === 0) {
      console.log("🤷 No riddles found. Create some first!");
      return;
    }
    
    const grouped = {};

    for (const riddle of data) {
      const level = riddle.level || "Unknown";

      if (!grouped[level]) {
        grouped[level] = [];
      }

      grouped[level].push(riddle);
    }
    
    Object.keys(grouped).forEach(level => {
      console.log(`\n🔹 ${level} Level:`);
      grouped[level].forEach(riddle => {
        console.log(`   ID: ${riddle._id}`);
        console.log(`   Name: ${riddle.name}`);
        console.log(`   Question: ${riddle.question}`);
        console.log(`   Answer: ${riddle.answer}`);
        console.log("   " + "─".repeat(30));
      });
    });
    
  } catch (error) {
    console.error("💥 Failed to fetch riddles:", error.message);
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

async function updateRiddle() {
  const id = readlineSync.question('Enter riddle ID to update: ').trim();

  const name = readlineSync.question('New name (leave empty to skip): ').trim();
  const question = readlineSync.question('New description (leave empty to skip): ').trim();
  const answer = readlineSync.question('New answer (leave empty to skip): ').trim();
  const level = readlineSync.question('New level (leave empty to skip): ').trim();

  const body = {};
  if (name) body.name = name;
  if (question) body.question = question;
  if (answer) body.answer = answer;
  if (level) body.level = level;

  if (Object.keys(body).length === 0) {
    console.log("⚠️ No changes made.");
    return;
  }

  try {
    const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    const text = await res.text();
    if (res.ok) {
      console.log("✅ Riddle updated successfully!");
    } else {
      console.log("💥 Failed to update riddle:", text);
    }
  } catch (error) {
    console.error("💥 Error updating riddle:", error.message);
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

async function deleteRiddle() {
  const id = readlineSync.question("Enter riddle ID to delete: ");
  
  const confirm = readlineSync.question("Are you sure? (y/N): ");
  if (confirm.toLowerCase() !== 'y') {
    console.log("❌ Deletion cancelled.");
    return;
  }
  
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const text = await res.text();
    if (res.ok) {
      console.log("✅ Riddle deleted successfully!");
    } else {
      console.log("💥 Failed to delete riddle:", text);
    }
  } catch (error) {
    console.error("💥 Error deleting riddle:", error.message);
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

async function viewLeaderboard() {
  console.log("\n🏆 === LEADERBOARD ===");
  
  try {
    const res = await fetch(`${SERVER_URL}/api/players/leaderboard`);
    
    if (!res.ok) {
      console.log("💥 Failed to fetch leaderboard");
      return;
    }
    
    const leaderboard = await res.json();
    
    if (leaderboard.length === 0) {
      console.log("🤷 No players with recorded times yet. Be the first!");
      return;
    }
    
    console.log("\nTop players (fastest times):");
    console.log("─".repeat(40));
    
    leaderboard.forEach((player, index) => {
      const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "  ";
      console.log(`${medal} ${index + 1}. ${player.username} - ${player.best_time} seconds`);
    });
    
    console.log("─".repeat(40));
    
  } catch (error) {
    console.log("💥 Error fetching leaderboard:", error.message);
  }
  
  console.log("\nPress Enter to return to main menu...");
  readlineSync.question();
}

mainMenu();
