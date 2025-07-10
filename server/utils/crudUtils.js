import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const filePath = path.resolve("db/riddles.txt");

export async function readRiddlesFromFile() {
  try {
    const data = await readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading the file:", err);
    return { Easy: [], Medium: [], Hard: [] };
  }
}

/**
 * Adds a new riddle
 */
export async function setRiddles(newRiddle) {
  try {
    const riddlesData = await readRiddlesFromFile();
    // const level = Object.keys(riddlesData)
    const allIds = Object.values(riddlesData)
      .flat()
      .map((r) => r.id);
    const newId = Math.max(...allIds, 0) + 1;
    const riddleObj = {
      id: newId,
      name: newRiddle.name,
      TaskDescription: newRiddle.taskDescription,
      CorrectAnswer: newRiddle.correctAnswer,
    };
    riddlesData[newRiddle.level].push(riddleObj);
    await writeRiddlesToFile(riddlesData);

    console.log(`New riddle added successfully to level ${newRiddle.level}!`);
    return riddleObj;
  } catch (err) {
    console.error("Error adding riddle:", err);
  }
}

/**
 * Writes riddles to the file
 * @param {Object} riddlesData - Riddles object
 */
async function writeRiddlesToFile(riddlesData) {
  try {
    await writeFile(filePath, JSON.stringify(riddlesData, null, 4));
    console.log("File updated successfully!");
  } catch (err) {
    console.error("Error writing to file:", err);
  }
}
