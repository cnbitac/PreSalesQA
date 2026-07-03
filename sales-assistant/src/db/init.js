const pool = require("./pool");

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id
                SERIAL
                PRIMARY
                KEY,
                username
                VARCHAR
            (
                50
            ) NOT NULL,
                phone VARCHAR
            (
                20
            ) NOT NULL UNIQUE,
                login_count INT DEFAULT 0,
                first_login_at TIMESTAMP,
                last_login_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_login_count ON users(login_count);
        `);

        console.log("✅ database initialized successfully");
    } catch (err) {
        console.error("❌ database init failed:", err);
        process.exit(1);
    }
}

module.exports = initDB;