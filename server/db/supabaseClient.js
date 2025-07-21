import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be provided in .env file');
}

// === הגדר פרטי חיבור ===
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log('Supabase client initialized.');

// // === שלב 1: יצירת הטבלה (אם אינה קיימת) ===
// const createTableSql = /* SQL */ `
// CREATE TABLE IF NOT EXISTS Players (
//   id                INTEGER PRIMARY KEY,
//   name              TEXT    NOT NULL,
//   email             TEXT    UNIQUE NOT NULL,
//   solved_riddles    INTEGER[]      NOT NULL,            -- מערך מספרים
//   stats             JSONB          NOT NULL,            -- שדה JSONB ל-stats
//   last_played       TIMESTAMPTZ    NOT NULL
// );
// `;

// await supabase.rpc('execute_sql', { query: createTableSql })   // אם הפונקציה execute_sql קיימת אצלך
// // -- לחלופין, הרץ את createTableSql ידנית ב-SQL Editor של Supabase.

// === שלב 2: הנתונים שלך ===
// const players = [
//     {
//       "id": 1,
//       "name": "משה",
//       "email": "moshe@example.com",
//       "solvedRiddles": [1, 2, 3],
//       "stats": {
//         "totalRiddles": 3,
//         "totalTimeSeconds": 120,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 3,
//           "Medium": 0,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2024-01-15T10:30:00Z"
//     },
//     {
//       "id": 2,
//       "name": "שרה",
//       "email": "sarah@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7],
//       "stats": {
//         "totalRiddles": 7,
//         "totalTimeSeconds": 200,
//         "averageTimeSeconds": 28,
//         "levelProgress": {
//           "Easy": 5,
//           "Medium": 2,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2024-01-16T14:20:00Z"
//     },
//     {
//       "id": 3,
//       "name": "hershy",
//       "email": "Y6764057@gmail.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
//       "stats": {
//         "totalRiddles": 10,
//         "totalTimeSeconds": 100,
//         "averageTimeSeconds": 10,
//         "levelProgress": {
//           "Easy": 5,
//           "Medium": 5,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-07-07T09:49:08.016Z"
//     },
//     {
//       "id": 4,
//       "name": "דוד",
//       "email": "david@example.com",
//       "solvedRiddles": [1, 2, 3, 4],
//       "stats": {
//         "totalRiddles": 4,
//         "totalTimeSeconds": 180,
//         "averageTimeSeconds": 45,
//         "levelProgress": {
//           "Easy": 4,
//           "Medium": 0,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-02-10T08:11:00Z"
//     },
//     {
//       "id": 5,
//       "name": "אברהם",
//       "email": "avraham@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9],
//       "stats": {
//         "totalRiddles": 9,
//         "totalTimeSeconds": 270,
//         "averageTimeSeconds": 30,
//         "levelProgress": {
//           "Easy": 6,
//           "Medium": 3,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-03-12T12:45:30Z"
//     },
//     {
//       "id": 6,
//       "name": "יעקב",
//       "email": "yaakov@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
//       "stats": {
//         "totalRiddles": 15,
//         "totalTimeSeconds": 600,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 7,
//           "Medium": 6,
//           "Hard": 2
//         }
//       },
//       "lastPlayed": "2025-04-01T17:22:00Z"
//     },
//     {
//       "id": 7,
//       "name": "בנימין",
//       "email": "ben@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6],
//       "stats": {
//         "totalRiddles": 6,
//         "totalTimeSeconds": 240,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 4,
//           "Medium": 2,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-01-18T19:10:00Z"
//     },
//     {
//       "id": 8,
//       "name": "יוסף",
//       "email": "yosef@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//       "stats": {
//         "totalRiddles": 12,
//         "totalTimeSeconds": 540,
//         "averageTimeSeconds": 45,
//         "levelProgress": {
//           "Easy": 6,
//           "Medium": 4,
//           "Hard": 2
//         }
//       },
//       "lastPlayed": "2025-06-20T15:45:00Z"
//     },
//     {
//       "id": 9,
//       "name": "יהודה",
//       "email": "yehuda@example.com",
//       "solvedRiddles": [1, 2],
//       "stats": {
//         "totalRiddles": 2,
//         "totalTimeSeconds": 90,
//         "averageTimeSeconds": 45,
//         "levelProgress": {
//           "Easy": 2,
//           "Medium": 0,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2024-12-05T11:05:00Z"
//     },
//     {
//       "id": 10,
//       "name": "שלמה",
//       "email": "shlomo@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8],
//       "stats": {
//         "totalRiddles": 8,
//         "totalTimeSeconds": 320,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 5,
//           "Medium": 3,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-05-14T09:00:00Z"
//     },
//     {
//       "id": 11,
//       "name": "מנחם",
//       "email": "menachem@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//       "stats": {
//         "totalRiddles": 11,
//         "totalTimeSeconds": 330,
//         "averageTimeSeconds": 30,
//         "levelProgress": {
//           "Easy": 6,
//           "Medium": 5,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-07-10T20:18:00Z"
//     },
//     {
//       "id": 12,
//       "name": "אליהו",
//       "email": "eliyahu@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5],
//       "stats": {
//         "totalRiddles": 5,
//         "totalTimeSeconds": 175,
//         "averageTimeSeconds": 35,
//         "levelProgress": {
//           "Easy": 3,
//           "Medium": 2,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-01-09T07:30:00Z"
//     },
//     {
//       "id": 13,
//       "name": "נתן",
//       "email": "natan@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
//       "stats": {
//         "totalRiddles": 13,
//         "totalTimeSeconds": 520,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 7,
//           "Medium": 5,
//           "Hard": 1
//         }
//       },
//       "lastPlayed": "2025-03-22T12:15:00Z"
//     },
//     {
//       "id": 14,
//       "name": "עמנואל",
//       "email": "emanuel@example.com",
//       "solvedRiddles": [1, 2, 3],
//       "stats": {
//         "totalRiddles": 3,
//         "totalTimeSeconds": 150,
//         "averageTimeSeconds": 50,
//         "levelProgress": {
//           "Easy": 3,
//           "Medium": 0,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2025-02-28T18:05:00Z"
//     },
//     {
//       "id": 15,
//       "name": "חיים",
//       "email": "haim@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
//       "stats": {
//         "totalRiddles": 10,
//         "totalTimeSeconds": 250,
//         "averageTimeSeconds": 25,
//         "levelProgress": {
//           "Easy": 5,
//           "Medium": 4,
//           "Hard": 1
//         }
//       },
//       "lastPlayed": "2025-07-18T13:37:00Z"
//     },
//     {
//       "id": 16,
//       "name": "גד",
//       "email": "gad@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8],
//       "stats": {
//         "totalRiddles": 8,
//         "totalTimeSeconds": 400,
//         "averageTimeSeconds": 50,
//         "levelProgress": {
//           "Easy": 4,
//           "Medium": 3,
//           "Hard": 1
//         }
//       },
//       "lastPlayed": "2025-04-08T10:10:00Z"
//     },
//     {
//       "id": 17,
//       "name": "איוב",
//       "email": "iyov@example.com",
//       "solvedRiddles": [1],
//       "stats": {
//         "totalRiddles": 1,
//         "totalTimeSeconds": 60,
//         "averageTimeSeconds": 60,
//         "levelProgress": {
//           "Easy": 1,
//           "Medium": 0,
//           "Hard": 0
//         }
//       },
//       "lastPlayed": "2024-11-11T11:11:11Z"
//     },
//     {
//       "id": 18,
//       "name": "יואל",
//       "email": "yoel@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9],
//       "stats": {
//         "totalRiddles": 9,
//         "totalTimeSeconds": 225,
//         "averageTimeSeconds": 25,
//         "levelProgress": {
//           "Easy": 5,
//           "Medium": 3,
//           "Hard": 1
//         }
//       },
//       "lastPlayed": "2025-06-01T16:00:00Z"
//     },
//     {
//       "id": 19,
//       "name": "חזקיהו",
//       "email": "chezkiyahu@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
//       "stats": {
//         "totalRiddles": 11,
//         "totalTimeSeconds": 330,
//         "averageTimeSeconds": 30,
//         "levelProgress": {
//           "Easy": 6,
//           "Medium": 4,
//           "Hard": 1
//         }
//       },
//       "lastPlayed": "2025-07-03T22:10:00Z"
//     },
//     {
//       "id": 20,
//       "name": "שמואל",
//       "email": "shmuel@example.com",
//       "solvedRiddles": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
//       "stats": {
//         "totalRiddles": 12,
//         "totalTimeSeconds": 480,
//         "averageTimeSeconds": 40,
//         "levelProgress": {
//           "Easy": 6,
//           "Medium": 4,
//           "Hard": 2
//         }
//       },
//       "lastPlayed": "2025-07-19T21:45:00Z"
//     }
//   ]
// const playersToInsert = players.map(player => ({
//   id: player.id,
//   name: player.name,
//   email: player.email,
//   solved_riddles: player.solvedRiddles,
//   stats: player.stats,
//   last_played: player.lastPlayed
// }));
// async function loadPlayers() {
//   const { error } = await supabase
//     .from('players')
//     .upsert(playersToInsert, { onConflict: 'id' });

//   if (error) {
//     console.error('💥 Insert/upsert failed:', error.message);
//   } else {
//     console.log('🎉 Players table populated successfully!');
//   }
// }

// loadPlayers();

export default supabase