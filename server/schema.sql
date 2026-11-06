-- Parties classées (chap. 1, README « Mise en ligne ») : une par joueur, par jour et par mode.
-- À exécuter une fois dans la console D1 de Cloudflare (ou `wrangler d1 execute <base> --remote --file server/schema.sql`).
CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player_id TEXT NOT NULL,
  pseudo TEXT NOT NULL,
  day TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  rules_version TEXT NOT NULL,
  actions TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  -- pending : en attente du rejeu ; valid : score retenu ; rejected : le rejeu ne retrouve pas une partie finie
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'rejected')),
  ending TEXT,
  score INTEGER,
  reason TEXT,
  verified_at TEXT,
  UNIQUE (player_id, day, difficulty)
);

CREATE INDEX IF NOT EXISTS runs_board ON runs (day, difficulty, status, score DESC, id);
CREATE INDEX IF NOT EXISTS runs_pending ON runs (status, id);
