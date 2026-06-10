-- Migration: add columns to reactivation_requests and users
-- Run against the project's SQLite DB (backend/employee.db)

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

ALTER TABLE reactivation_requests ADD COLUMN reason TEXT;
ALTER TABLE reactivation_requests ADD COLUMN admin_reviewer VARCHAR;
ALTER TABLE reactivation_requests ADD COLUMN review_comment TEXT;
ALTER TABLE reactivation_requests ADD COLUMN reviewed_at DATETIME;

ALTER TABLE users ADD COLUMN deactivated_by VARCHAR;

COMMIT;
PRAGMA foreign_keys=on;

-- Note: SQLite allows ADD COLUMN for simple cases. Columns are nullable by default.
