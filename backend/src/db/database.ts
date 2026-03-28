import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = process.env.DB_DIR ?? path.join(__dirname, '../../data');
const DB_PATH = path.join(DB_DIR, 'support.db');

let db: Database.Database;

export function getDatabase(): Database.Database {
  if (!db) {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
  }

  return db;
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = undefined as unknown as Database.Database;
  }
}

export default getDatabase;