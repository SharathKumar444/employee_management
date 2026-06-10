-- Migration: create notifications table
-- Run against the project's SQLite DB (backend/employee.db)

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_user_id INTEGER NOT NULL,
  type VARCHAR NOT NULL,
  payload TEXT,
  is_read BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now'))
);

COMMIT;
PRAGMA foreign_keys=on;
