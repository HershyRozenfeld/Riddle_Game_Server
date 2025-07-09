import readlineSync from "readline-sync";
const SERVER_URL = "";

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
  const res = await fetch(`${SERVER_URL}/play`);
  const text = await res.text();
  console.log(`Response: ${text}`);
}

async function createRiddle() {
  const question = readlineSync.question("Enter riddle question: ");
  const answer = readlineSync.question("Enter riddle answer: ");
  const body = { question, answer };
  const res = await fetch(`${SERVER_URL}/riddles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  const text = res.text(res);
  console.log(`Response: ${text}`);
}
async function readRiddles() {
  const res = await fetch(`${SERVER_URL}/riddles`);
  const data = res.text();
  console.log(`Response: ${data}`);
}
async function updateRiddle() {
  const id = readlineSync.question("Enter riddle ID to update: ");
  const question = readlineSync.question("New question: ");
  const answer = readlineSync.question("New answer: ");
  const body = { question, answer };

  const res = await fetch(`${SERVER_URL}/riddles/${id}`,{
    method:'PUT',
    headers: {
        'Content-Type':'appliction/json'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  console.log(text);
}
async function deleteRiddle() {
    const id = readlineSync.question('Enter riddle ID to delete: ');
    const res = await fetch(`${SERVER_URL}/riddles/${id}`, {
        method:'DELETE',
        headers:{
            'Content-Type':'application/json'
        }
    });
    const text = await res.text();
    console.log(text);
}
async function viewLeaderboard() {
    const res = await fetch(`${SERVER_URL}/leaderboard`);
    const data = res.text();
    console.log(data);
}
mainMenu();
