import readlineSync from "readline-sync";
const SERVER_URL = "http://localhost:3000";

// Global player state
let currentPlayer = null;

async function mainMenu() {
  console.log("\n=== Riddle Game ===");
  console.log("1. Login/Register player");
  console.log("2. Play the game");
  console.log("3. Create a new riddle");
  console.log("4. Read all riddles");
  console.log("5. Update a riddle");
  console.log("6. Delete a riddle");
  console.log("7. View leaderboard");
  console.log("8. View my stats");
  console.log("9. Exit");

  const choice = readlineSync.questionInt("\nEnter your choice (1-9): ");

  switch (choice) {
    case 1:
      await loginOrRegister();
      break;
    case 2:
      if (!currentPlayer) {
        console.log("❌ Please login first!");
        break;
      }
      await playGame();
      break;
    case 3:
      await createRiddle();
      break;
    case 4:
      await readRiddles();
      break;
    case 5:
      await updateRiddle();
      break;
    case 6:
      await deleteRiddle();
      break;
    case 7:
      await viewLeaderboard();
      break;
    case 8:
      if (!currentPlayer) {
        console.log("❌ Please login first!");
        break;
      }
      await viewMyStats();
      break;
    case 9:
      console.log("👋 Goodbye!");
      return;
    default:
      console.log("💥 Invalid choice. Try again.");
  }
  
  await mainMenu(); // Continue the loop
}

async function loginOrRegister() {
  console.log("\n1. Login existing player");
  console.log("2. Register new player");
  
  const choice = readlineSync.questionInt("Choose option (1-2): ");
  
  if (choice === 1) {
    await loginPlayer();
  } else if (choice === 2) {
    await registerPlayer();
  } else {
    console.log("❌ Invalid choice");
  }
}

async function loginPlayer() {
  const email = readlineSync.question("Enter your email: ");
  
  try {
    const res = await fetch(`${SERVER_URL}/api/players/player/${email}`);
    
    if (res.status === 404) {
      console.log("❌ Player not found. Would you like to register?");
      return;
    }
    
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    currentPlayer = data.profile;
    console.log(`✅ Welcome back, ${currentPlayer.name}!`);
    console.log(`📊 You've solved ${currentPlayer.stats.totalRiddles} riddles`);
    
  } catch (error) {
    console.log("❌ Failed to login:", error.message);
  }
}

async function registerPlayer() {
  const name = readlineSync.question("Enter your name: ");
  const email = readlineSync.question("Enter your email: ");
  
  const body = { name, email };
  
  try {
    const res = await fetch(`${SERVER_URL}/api/players/player`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (res.status === 409) {
      console.log("❌ Email already exists. Try logging in instead.");
      return;
    }
    
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    currentPlayer = data;
    console.log(`✅ Welcome, ${currentPlayer.name}! Account created successfully.`);
    
  } catch (error) {
    console.log("❌ Failed to register:", error.message);
  }
}

async function playGame() {
  try {
    // Get all riddles first
    const res = await fetch(`${SERVER_URL}/api/riddles`);
    if (!res.ok) {
      console.log("❌ Failed to fetch riddles");
      return;
    }
    
    const riddles = await res.json();
    
    // Filter unsolved riddles
    const unsolvedRiddles = riddles.filter(riddle => 
      !currentPlayer.solved_riddles.includes(riddle._id)
    );
    
    if (unsolvedRiddles.length === 0) {
      console.log("🎉 Congratulations! You've solved all available riddles!");
      return;
    }
    
    // Select random unsolved riddle
    const randomRiddle = unsolvedRiddles[Math.floor(Math.random() * unsolvedRiddles.length)];
    
    console.log(`\n📝 Riddle: ${randomRiddle.name}`);
    console.log(`🎯 Level: ${randomRiddle.level}`);
    console.log(`❓ Question: ${randomRiddle.question}`);
    
    const startTime = Date.now();
    const userAnswer = readlineSync.question("\nYour answer: ");
    const endTime = Date.now();
    
    const timeToSolve = Math.round((endTime - startTime) / 1000); // seconds
    
    // Check answer
    if (parseInt(userAnswer) === parseInt(randomRiddle.answer)) {
      console.log("🎉 Correct! Well done!");
      
      // Submit score
      const scoreData = {
        email: currentPlayer.email,
        riddle_id: randomRiddle._id,
        time_to_solve: timeToSolve,
        riddle_level: randomRiddle.level
      };
      
      const scoreRes = await fetch(`${SERVER_URL}/api/players/submit-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      });
      
      if (scoreRes.ok) {
        const result = await scoreRes.json();
        console.log(`⏱️  Time: ${timeToSolve} seconds`);
        console.log(`📊 Updated stats:`, result.updatedStats);
        
        // Update current player data
        currentPlayer.solved_riddles.push(randomRiddle._id);
        currentPlayer.stats = result.updatedStats;
      } else {
        console.log("⚠️  Answer correct but failed to save score");
      }
      
    } else {
      console.log(`❌ Wrong! The correct answer was: ${randomRiddle.answer}`);
    }
    
  } catch (error) {
    console.log("❌ Error playing game:", error.message);
  }
}

async function createRiddle() {
  const level = readlineSync.question("Select difficulty (Easy/Medium/Hard): ");
  const name = readlineSync.question("Riddle name: ");
  const question = readlineSync.question("Riddle description: ");
  const answer = readlineSync.question("Correct answer (number): ").trim();
  
  const body = { level, name, question, answer: parseInt(answer) };
  
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    console.log("✅ Riddle created successfully:", data);
    
  } catch (error) {
    console.log("❌ Failed to create riddle:", error.message);
  }
}

async function readRiddles() {
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles`);
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }

    const data = await res.json();
    console.log("\n=== All Riddles ===");
    
    const grouped = {};
    for (const riddle of data) {
      const level = riddle.level || "Unknown";
      if (!grouped[level]) {
        grouped[level] = [];
      }
      grouped[level].push(riddle);
    }
    
    for (const [level, riddles] of Object.entries(grouped)) {
      console.log(`\n${level}:`);
      riddles.forEach(riddle => {
        const solved = currentPlayer && currentPlayer.solved_riddles.includes(riddle._id) ? "✅" : "❓";
        console.log(`  ${solved} ${riddle.name}: ${riddle.question} (Answer: ${riddle.answer})`);
      });
    }
    
  } catch (error) {
    console.log("❌ Error fetching riddles:", error.message);
  }
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
  if (answer) body.answer = parseInt(answer);
  if (level) body.level = level;

  try {
    const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    
    const text = await res.text();
    console.log(text);
    
  } catch (error) {
    console.log("❌ Error updating riddle:", error.message);
  }
}

async function deleteRiddle() {
  const id = readlineSync.question("Enter riddle ID to delete: ");
  
  try {
    const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    
    const text = await res.text();
    console.log(text);
    
  } catch (error) {
    console.log("❌ Error deleting riddle:", error.message);
  }
}

async function viewLeaderboard() {
  try {
    const res = await fetch(`${SERVER_URL}/api/players/leaderboard`);
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    console.log("\n🏆 LEADERBOARD 🏆");
    console.log("=".repeat(50));
    
    data.forEach(player => {
      console.log(`${player.rank}. ${player.name}`);
      console.log(`   📧 ${player.email}`);
      console.log(`   🧩 Riddles solved: ${player.totalRiddles}`);
      console.log(`   ⏱️  Average time: ${player.averageTime}s`);
      console.log(`   📊 Progress: Easy:${player.levelProgress.Easy}, Medium:${player.levelProgress.Medium}, Hard:${player.levelProgress.Hard}`);
      console.log();
    });
    
  } catch (error) {
    console.log("❌ Error fetching leaderboard:", error.message);
  }
}

async function viewMyStats() {
  try {
    const res = await fetch(`${SERVER_URL}/api/players/stats/${currentPlayer.email}`);
    if (!res.ok) {
      console.log(`❌ Error: ${res.status} ${res.statusText}`);
      return;
    }
    
    const data = await res.json();
    console.log("\n📊 YOUR STATISTICS 📊");
    console.log("=".repeat(30));
    console.log(`👤 Name: ${data.name}`);
    console.log(`🧩 Total riddles solved: ${data.stats.totalRiddles}`);
    console.log(`⏱️  Total time spent: ${data.stats.totalTimeSeconds}s`);
    console.log(`📈 Average time per riddle: ${data.stats.averageTimeSeconds}s`);
    console.log(`📅 Last played: ${new Date(data.lastPlayed).toLocaleString()}`);
    console.log("\n🎯 Level Progress:");
    console.log(`   Easy: ${data.stats.levelProgress.Easy}`);
    console.log(`   Medium: ${data.stats.levelProgress.Medium}`);
    console.log(`   Hard: ${data.stats.levelProgress.Hard}`);
    
  } catch (error) {
    console.log("❌ Error fetching stats:", error.message);
  }
}

// Start the application
mainMenu();