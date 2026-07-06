const pool = require("../db/pool");

exports.profile = async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id=$1",
        [req.user.id]
    );

    res.json(result.rows[0]);
};