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
  const TaskDescription = readlineSync.question("Riddle description: ");
  const CorrectAnswer = parseInt(
    readlineSync.question("Correct answer (number): ")
  );
  const body = { level, name, TaskDescription, CorrectAnswer };
  const res = await fetch(`${SERVER_URL}/api/riddles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
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
    if (!grouped[riddle.difficulty]) {
      grouped[riddle.difficulty] = [];
    }
    grouped[riddle.difficulty].push(riddle);
  }
  for (const level of Object.keys(grouped)) {
    console.log(`\n--- ${level} ---`);
    for (const r of grouped[level]) {
      console.log(`ID: ${r.id} | Name: ${r.name}`);
      console.log(`Question: ${r.TaskDescription}`);
      console.log(`Answer: ${r.CorrectAnswer}\n`);
    }
  }
}
async function updateRiddle() {
  const id = readlineSync.question("Enter riddle ID to update: ");
  const name = readlineSync.question("New name: ");
  const TaskDescription = readlineSync.question("New description: ");
  const CorrectAnswerStr = readlineSync.question("New answer: ");
  const body = {};
  if (name.trim()) body.name = name;
  if (TaskDescription.trim()) body.TaskDescription = TaskDescription;
  const num = parseInt(CorrectAnswerStr);
  if (!isNaN(num)) body.CorrectAnswer = num;

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
