-- Migration number: 0002 	 2025-07-23T08:29:11.842Z
DROP TABLE IF EXISTS events;

CREATE TABLE events (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    series TEXT NOT NULL CHECK (series IN ('bandori', 'chika_idol')),
    event_date TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    is_cancelled BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_events_series_date ON events(series, event_date);
