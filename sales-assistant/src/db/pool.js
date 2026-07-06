const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.LT_SALES_DB_HOST,
    port: process.env.LT_SALES_DB_PORT,
    user: process.env.LT_SALES_DB_USER,
    password: process.env.LT_SALES_DB_PASS,
    database: process.env.LT_SALES_DB_NAME
});

module.exports = pool;