import e from "express";
import { MongoClient } from "mongodb";
// import dotenv from "dotenv/config";

// const client = new MongoClient(
//   process.env.MONGO_URI ||
//     "mongodb+srv://hershy:hershy@clusterone.emw47go.mongodb.net"
// );
const client = new MongoClient(
    "mongodb+srv://hershy:hershy@clusterone.emw47go.mongodb.net"
);

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



// // בדיקת חיבור לבסיס הנתונים
// await connectToMongo()
//   .then(() => {
//     console.log("MongoDB connection established");
//   })
//   .catch((err) => {
//     console.error("Failed to connect to MongoDB:", err.message);
//   });




// try {
//   const collection = db.collection("Player");

//   // אינדקס ייחודי על id (אם כבר קיים יוחלף ב-dropDups=false)
//   await collection.createIndex({ id: 1 }, { unique: true });

//   const { insertedCount } = await collection.insertMany(riddles);
//   console.log(`✔  Inserted ${insertedCount} riddles`);
// } catch (err) {
//   console.error("❌  Seed failed:", err);
// } finally {
//   await client.close();
// }