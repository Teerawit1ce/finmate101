CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'บันเทิง',
  amount REAL NOT NULL CHECK (amount > 0),
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly','monthly','yearly')),
  billing_date INTEGER NOT NULL,  -- day of month (1-31)
  next_billing TEXT NOT NULL,      -- ISO date of next billing
  is_active INTEGER NOT NULL DEFAULT 1,
  reminder_days INTEGER NOT NULL DEFAULT 1,  -- days before to remind
  logo_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_subs_user ON subscriptions(user_id);
CREATE INDEX idx_subs_next ON subscriptions(next_billing);
CREATE INDEX idx_subs_active ON subscriptions(is_active);
