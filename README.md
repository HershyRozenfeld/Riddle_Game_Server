# Riddle Game Server

This project provides a small Express server for serving and managing riddles.
Originally it stored the data in local text files. This version uses two
databases:

- **MongoDB** for all riddle data.
- **PostgreSQL** (Supabase/Neon compatible) for player profiles and scores.

## Running the server

The server expects environment variables with connection strings:

```bash
MONGO_URL=<mongodb connection string>
PG_CONNECTION_STRING=<postgres connection string>
```

Install dependencies and start the server:

```bash
cd server
npm install
npm start
```

The server listens on port `3000` by default.
