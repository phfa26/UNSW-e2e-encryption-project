import sqlite3Module from 'sqlite3';

const sqlite3 = sqlite3Module.verbose();

export const db: sqlite3Module.Database = new sqlite3.Database('./messages.db');

export const setupDatabase = (): void => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY,
    sender TEXT,
    destinatary TEXT,
    content TEXT,
    timestamp TEXT
  )`);
};
