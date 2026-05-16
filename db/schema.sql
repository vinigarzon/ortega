-- ============================================================================
-- Ortega & Ortega Abogados — Schema de Turso (libSQL / SQLite)
-- ============================================================================
-- Cada tabla representa una "colección" del antiguo Decap CMS, pero ahora vive
-- en BD para que las ediciones sean instantáneas (sin redeploy de Netlify).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Usuarios del panel admin
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------------------
-- Posts (Blog + Videoteca)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS posts (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  date            TEXT NOT NULL,                  -- YYYY-MM-DD
  type            TEXT NOT NULL DEFAULT 'blog',   -- 'blog' | 'videoteca'
  category        TEXT NOT NULL DEFAULT 'Entrevistas',
  excerpt         TEXT,
  body            TEXT NOT NULL DEFAULT '',       -- Markdown
  featured_image  TEXT,
  video_embed     TEXT,
  author          TEXT NOT NULL DEFAULT 'Ortega & Ortega Abogados',
  seo_title       TEXT,
  seo_description TEXT,
  draft           INTEGER NOT NULL DEFAULT 0,     -- 0|1
  tags            TEXT NOT NULL DEFAULT '[]',     -- JSON: ["tag1","tag2"]
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_type      ON posts (type);
CREATE INDEX IF NOT EXISTS idx_posts_category  ON posts (category);
CREATE INDEX IF NOT EXISTS idx_posts_date_desc ON posts (date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_draft     ON posts (draft);

-- ----------------------------------------------------------------------------
-- Equipo / abogados
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lawyers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  position      TEXT NOT NULL,
  photo         TEXT,
  photo_zoom    REAL NOT NULL DEFAULT 1,
  photo_focus_y INTEGER NOT NULL DEFAULT 18,
  specialty     TEXT,
  phone         TEXT,
  email         TEXT,
  bio           TEXT,                              -- Markdown
  "order"       INTEGER NOT NULL DEFAULT 99,
  active        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_lawyers_order ON lawyers ("order");

-- ----------------------------------------------------------------------------
-- Galería del home (items)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  image      TEXT NOT NULL,
  caption    TEXT,
  category   TEXT NOT NULL DEFAULT 'oficina',
  "order"    INTEGER NOT NULL DEFAULT 99,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_gallery_order ON gallery_items ("order");

-- ----------------------------------------------------------------------------
-- Configuración de la galería (singleton: id=1)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gallery_config (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  autoplay        INTEGER NOT NULL DEFAULT 1,
  interval_seconds INTEGER NOT NULL DEFAULT 5,
  transition_ms   INTEGER NOT NULL DEFAULT 700,
  show_arrows     INTEGER NOT NULL DEFAULT 1,
  show_dots       INTEGER NOT NULL DEFAULT 1,
  pause_on_hover  INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------------------
-- Ajustes globales (key/value JSON) — site, seo, contact, footer, homepage
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,                       -- JSON serializado
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
