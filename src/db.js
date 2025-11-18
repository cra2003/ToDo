import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

export const db = new Database(process.env.DB_FILE);

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log('✅ SQLite database ready:', process.env.DB_FILE);
