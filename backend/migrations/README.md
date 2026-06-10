Migration SQL files for the local SQLite database (backend/employee.db)

Files:
- `0001_add_reactivation_and_user_columns.sql` — adds `reason`, `admin_reviewer`, `review_comment`, `reviewed_at` to `reactivation_requests` and `deactivated_by` to `users`.
- `0002_create_notifications_table.sql` — creates the `notifications` table.

How to apply (SQLite):

1. Ensure the backend is stopped (to avoid DB locks).
2. Run the SQL files against the local DB:

```bash
sqlite3 backend/employee.db < backend/migrations/0001_add_reactivation_and_user_columns.sql
sqlite3 backend/employee.db < backend/migrations/0002_create_notifications_table.sql
```

If you use Alembic/migrations in the future, generate an Alembic revision and copy the SQL into the migration `upgrade()` function.

Notes:
- These ALTER TABLE commands are compatible with SQLite's limited ALTER support (adding nullable columns).
- Backup `backend/employee.db` before applying migrations in production.
