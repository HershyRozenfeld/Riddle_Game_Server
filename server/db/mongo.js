import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);

let db;

export async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("Riddles");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call connectToMongo first.");
  }
  return db;
}
