-- Migration number: 0001 	 2025-07-20T05:36:37.705Z

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,

    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,

    hashed_password TEXT NOT NULL,
    password_salt TEXT NOT NULL,

    user_status TEXT NOT NULL DEFAULT 'active' CHECK (user_status IN ('active', 'inactive')),
    roles TEXT NOT NULL DEFAULT '["member"]',
    password_iterations INTEGER NOT NULL,
    password_algorithm TEXT NOT NULL,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_login_at TEXT
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_username ON users (username);

CREATE TRIGGER trigger_users_auto_update_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

DROP TABLE IF EXISTS invitation_codes;

CREATE TABLE IF NOT EXISTS invitation_codes (
    code TEXT PRIMARY KEY,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    code_status TEXT DEFAULT 'available' CHECK (code_status IN ('available', 'used')),
    used_at TEXT,
    used_by TEXT
);