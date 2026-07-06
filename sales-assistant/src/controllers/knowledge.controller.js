const pool = require("../db/pool");

const knowledge = async (req, res) => {
    const query = req.query;

    const {
        query: keyword = "",
        role = "",
        objection = "",
        device = "",
        industry = "",
        systems = [],
    } = query;

    try {
        let sql = "SELECT * FROM knowledge WHERE 1=1";
        const params = [];
        let paramIndex = 1;

        if (keyword) {
            sql += ` AND question ILIKE $${paramIndex}`;
            params.push(`%${keyword}%`);
            paramIndex++;
        }

        // 客户角色筛选
        if (role) {
            sql += ` AND roles @> ARRAY[$${paramIndex}]::text[]`;
            params.push(role);
            paramIndex++;
        }

        // 异议筛选
        if (objection) {
            sql += ` AND objections @> ARRAY[$${paramIndex}]::text[]`;
            params.push(objection);
            paramIndex++;
        }

        // 设备筛选
        if (device) {
            sql += ` AND devices @> ARRAY[$${paramIndex}]::text[]`;
            params.push(device);
            paramIndex++;
        }

        // 行业筛选
        if (industry) {
            sql += ` AND industries @> ARRAY[$${paramIndex}]::text[]`;
            params.push(industry);
            paramIndex++;
        }

        // 已有系统多选筛选
        if (Array.isArray(systems) && systems.length > 0) {
            sql += ` AND systems && ARRAY[${systems.map((_, i) => `$${paramIndex + i}`).join(",")}]::text[]`;
            params.push(...systems);
            paramIndex += systems.length;
        }

        sql += ` limit 20`;

        const result = await pool.query(sql, params);

        res.json({
            code: 200,
            msg: result.rows.length ? "查询成功" : "暂无匹配数据",
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({code: 500, message: "server error"});
    }
};

const count = async (req, res) => {
    try {
        const result = await pool.query("SELECT count(*) AS total FROM knowledge");

        const total = Number(result.rows[0].total);

        res.json({
            code: 200,
            msg: result.rows.length ? "查询成功" : "暂无匹配数据",
            data: {total}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({code: 500, message: "server error"});
    }
};

module.exports = {knowledge, count}