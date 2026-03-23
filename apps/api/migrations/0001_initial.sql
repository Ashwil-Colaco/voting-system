-- 1. Create Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  is_completed INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 2. Create Stalls Table
CREATE TABLE stalls (
  id INTEGER PRIMARY KEY,
  name TEXT,
  qr_slug TEXT UNIQUE,
  created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- 3. Create Ratings Table
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  stall_id INTEGER,
  rating INTEGER,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  UNIQUE(user_id, stall_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
);

-- 4.Adding an index for email lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);