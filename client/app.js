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
}

async function playGame() {
  const res = await fetch(`${SERVER_URL}/api/play`);
  const text = await res.text();
  console.log(`Response: ${text}`);
}

async function createRiddle() {
  const level = readlineSync.question("Select difficulty (Easy/Medium/Hard): ");
  const name = readlineSync.question("Riddle name: ");
  const question = readlineSync.question("Riddle description: ");
  const answer = readlineSync.question("Correct answer (number): ").trim();
  const body = { level, name, question, answer };
  const res = await fetch(`${SERVER_URL}/api/riddles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  console.log(`Response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`Error: ${res.status} ${res.statusText}`);
    return;
  }
  const data = await res.json();
  console.log(data);
}

async function readRiddles() {
  const res = await fetch(`${SERVER_URL}/api/riddles`);
  if (!res.ok) {
    console.error(`Error: ${res.status} ${res.statusText}`);
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
  console.log(grouped);
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

  const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  console.log(text);
}

async function deleteRiddle() {
  const id = readlineSync.question("Enter riddle ID to delete: ");
  const res = await fetch(`${SERVER_URL}/api/riddles/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  console.log(text);
}

async function viewLeaderboard() {
  const res = await fetch(`${SERVER_URL}/api/leaderboard`);
  const data = await res.text();
  console.log(data);
}
mainMenu();
