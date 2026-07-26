CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  category TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_date ON transactions(date);
CREATE INDEX idx_tx_type ON transactions(type);
