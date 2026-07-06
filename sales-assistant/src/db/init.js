const pool = require("./pool");
const fs = require('fs');
const path = require('path');

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users
            (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
            CREATE TABLE IF NOT EXISTS user_whitelist
            (
                id
                SERIAL
                PRIMARY
                KEY,
                username
                VARCHAR
            (
                50
            ) NOT NULL UNIQUE,
                remark VARCHAR
            (
                200
            ),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
            CREATE INDEX IF NOT EXISTS idx_users_login_count ON users(login_count);
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS knowledge
            (
                id
                UUID
                PRIMARY
                KEY
                DEFAULT
                gen_random_uuid
            (
            ),
                category TEXT NOT NULL,
                question TEXT NOT NULL,

                roles TEXT[] DEFAULT '{}',
                objections TEXT[] DEFAULT '{}',
                devices TEXT[] DEFAULT '{}',
                industries TEXT[] DEFAULT '{}',
                sensitive TEXT[] DEFAULT '{}',

                core TEXT,
                proof TEXT[] DEFAULT '{}',
                follow_ups TEXT[] DEFAULT '{}',
                share TEXT,
                source TEXT,
                version TEXT DEFAULT 'v1.0',

                updated_at TIMESTAMPTZ DEFAULT NOW
            (
            ),
                created_at TIMESTAMPTZ DEFAULT NOW
            (
            )
                );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge(category);
            CREATE INDEX IF NOT EXISTS idx_kb_question_tsv ON knowledge USING GIN (to_tsvector('simple', question));
            CREATE INDEX IF NOT EXISTS idx_kb_devices ON knowledge USING GIN (devices);
            CREATE INDEX IF NOT EXISTS idx_kb_industries ON knowledge USING GIN (industries);
            CREATE INDEX IF NOT EXISTS idx_kb_roles ON knowledge USING GIN (roles);
        `);

        console.log("✅ database initialized successfully");

        const sqlDir = path.resolve(process.env.LT_SALES_INIT_SQL_PATH);

        const runSqlFile = async (fileName) => {
            const filePath = path.join(sqlDir, fileName);
            const sql = fs.readFileSync(filePath, 'utf8');
            await pool.query(sql);
            console.log(`✅ 已执行: ${fileName}`);
        };

        await runSqlFile('knowledge.sql');
        await runSqlFile('whitelist.sql');

        console.log("✅ table initialized successfully");
    } catch (err) {
        console.error("❌ database init failed:", err);
        process.exit(1);
    }
}

module.exports = initDB;