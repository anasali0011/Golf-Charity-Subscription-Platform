import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize schema if not exists
const schema = `
CREATE TABLE IF NOT EXISTS charities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    subscription_status TEXT DEFAULT 'inactive',
    charity_id TEXT REFERENCES charities(id),
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    stripe_subscription_id TEXT,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scores (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
    date DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS draws (
    id TEXT PRIMARY KEY,
    month TEXT NOT NULL,
    numbers_generated TEXT NOT NULL, -- JSON array
    status TEXT DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS winners (
    id TEXT PRIMARY KEY,
    draw_id TEXT REFERENCES draws(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    match_type TEXT NOT NULL,
    prize_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

db.exec(schema);

// Seed charities
const charityCount = db.prepare('SELECT COUNT(*) as count FROM charities').get() as { count: number };
if (charityCount.count === 0) {
  const insertCharity = db.prepare('INSERT INTO charities (id, name, description) VALUES (?, ?, ?)');
  const uuidv4 = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  insertCharity.run(uuidv4(), 'Red Cross', 'Medical relief fund');
  insertCharity.run(uuidv4(), 'Green Earth', 'Environmental protection');
  insertCharity.run(uuidv4(), 'Save The Children', 'Help children in need');
}
