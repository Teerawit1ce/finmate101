CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,        -- 1-12
  year INTEGER NOT NULL,
  monthly_limit REAL NOT NULL DEFAULT 12000,
  daily_quota REAL NOT NULL DEFAULT 400,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, month, year)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);
