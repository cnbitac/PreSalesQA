const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const pool = require("../db/pool");

router.get("/me", auth, async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM users WHERE id=$1",
        [req.user.id]
    );

    res.json(result.rows[0]);
});

module.exports = router;