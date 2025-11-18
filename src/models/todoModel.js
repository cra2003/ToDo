// import { db } from "./db.js";
import Database from "better-sqlite3";
import * as dotenv from "dotenv";

dotenv.config();

const db = new Database(process.env.DB_FILE);

// Create table if it doesn't exist
db.prepare(
  `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`,
).run();

export const TodoModel = {
  getAll() {
    return db.prepare("SELECT * FROM todos ORDER BY created_at DESC").all();
  },
  getById(id) {
    return db.prepare("SELECT * FROM todos WHERE id = ?").get(id);
  },
  create({ title, priority }) {
    const stmt = db.prepare(
      "INSERT INTO todos (title, priority) VALUES (?, ?)",
    );
    const result = stmt.run(title, priority || "medium");
    return this.getById(result.lastInsertRowid);
  },
  update(id, data) {
    const existing = this.getById(id);
    if (!existing) return null;

    const updated_info = {
      title: data.title ?? existing.title,
      completed: data.completed ?? existing.completed,
      priority: data.priority ?? existing.priority,
    };

    db.prepare(
      "UPDATE todos SET title=?, completed=?, priority=? WHERE id=?",
    ).run(
      updated_info.title,
      updated_info.completed,
      updated_info.priority,
      id,
    );

    return this.getById(id);
  },
  delete(id) {
    const result = db.prepare("DELETE FROM todos WHERE id = ?").run(id);
    return result.changes > 0;
  },
};
