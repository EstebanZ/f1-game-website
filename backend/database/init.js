const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join('/app/data', 'game.db');

function initDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
            return;
        }
        console.log('✅ Connected to SQLite database');
    });

    // Crear tabla de usuarios
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            is_admin BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Crear tabla de puntuaciones del juego
    db.run(`
        CREATE TABLE IF NOT EXISTS game_scores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            reaction_time REAL NOT NULL,
            score INTEGER NOT NULL,
            game_type TEXT DEFAULT 'reflex',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `);

    // Crear índices para mejor rendimiento
    db.run(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_scores_user_id ON game_scores(user_id)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_scores_created_at ON game_scores(created_at)`);

    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database initialized successfully');
        }
    });
}

function getDatabase() {
    return new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Error opening database:', err.message);
        }
    });
}

module.exports = {
    initDatabase,
    getDatabase
};
