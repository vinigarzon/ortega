-- Agrega columna `tags` a posts (JSON serializado: '["tag1","tag2"]')
-- Es idempotente: si la columna ya existe, ALTER TABLE falla silenciosamente
-- (manejamos eso en el script de aplicación).
ALTER TABLE posts ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
