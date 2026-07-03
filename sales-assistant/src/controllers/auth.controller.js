const pool = require("../db/pool");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    const { username, phone } = req.body;

    if (!username || !phone) {
        return res.status(400).json({ message: "missing fields" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE phone=$1",
            [phone]
        );

        let user;

        if (result.rows.length === 0) {
            const insert = await pool.query(
                `INSERT INTO users (username, phone, login_count, first_login_at, last_login_at)
                 VALUES ($1,$2,1,NOW(),NOW())
                 RETURNING *`,
                [username, phone]
            );
            user = insert.rows[0];
        } else {
            const update = await pool.query(
                `UPDATE users
                 SET login_count = login_count + 1,
                     last_login_at = NOW()
                 WHERE phone=$1
                 RETURNING *`,
                [phone]
            );
            user = update.rows[0];
        }

        const token = jwt.sign(
            { id: user.id, phone: user.phone, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};