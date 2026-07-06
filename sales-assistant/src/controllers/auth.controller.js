const pool = require("../db/pool");
const jwt = require("jsonwebtoken");

const SOURCE = "linkedti"

exports.login = async (req, res) => {
    const { username, phone, source } = req.body;

    if (!username || !phone || !source) {
        return res.status(400).json({ message: "missing fields" });
    }

    try {
        let verifyRes;

        if (source === SOURCE) {
            verifyRes = await baseVerify(username, phone);
        } else {
            verifyRes = await whiteListVerify(username, phone);
        }

        if (!verifyRes.success) {
            return res.status(403).json({ message: verifyRes.msg });
        }

        const user = verifyRes.user;
        // 更新登录次数、最后登录时间
        const updateResult = await pool.query(`
            UPDATE users
            SET login_count = login_count + 1, last_login_at = NOW()
            WHERE id = $1 RETURNING *
        `, [user.id]);
        const latestUser = updateResult.rows[0];

        const token = jwt.sign(
            { id: latestUser.id, phone: latestUser.phone, username: latestUser.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({ token, user: latestUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "服务器内部错误" });
    }
};

/**
 * linkedti 普通渠道
 * 逻辑：
 * 1. 查 username+phone 联合记录
 *    存在 → 正常放行
 * 2. 无联合记录，检查手机号是否已被占用
 *    手机号存在 → 手机号已被其他账号注册
 * 3. 手机号无记录 → 直接新建用户
 */
const baseVerify = async (username, phone) => {
    // 联合匹配用户名+手机号
    const userRes = await pool.query(
        "SELECT * FROM users WHERE username=$1 AND phone=$2",
        [username, phone]
    );
    if (userRes.rows.length > 0) {
        return {
            success: true,
            msg: "",
            user: userRes.rows[0]
        };
    }

    // 联合不匹配，检查手机号是否存在他人账号
    const phoneExistRes = await pool.query(
        "SELECT id FROM users WHERE phone=$1",
        [phone]
    );
    if (phoneExistRes.rows.length > 0) {
        return {
            success: false,
            msg: "该手机号已被其他账号注册，请核对信息"
        };
    }

    // 手机号无记录，直接创建账号
    const insert = await pool.query(`
        INSERT INTO users (username, phone, login_count, first_login_at, last_login_at)
        VALUES ($1, $2, 1, NOW(), NOW()) RETURNING *
    `, [username, phone]);
    return {
        success: true,
        msg: "",
        user: insert.rows[0]
    };
};

/**
 * 非linkedti 白名单渠道
 * 逻辑：
 * 1. username+phone 联合存在 → 放行登录
 * 2. 联合不存在，手机号已被占用 → 提示手机号被注册
 * 3. 手机号无记录：校验用户名是否在白名单
 *    - 不在白名单：禁止登录
 *    - 在白名单：自动新建用户
 */
const whiteListVerify = async (username, phone) => {
    // 1. 精确匹配用户名+手机号
    const userRes = await pool.query(
        "SELECT * FROM users WHERE username=$1 AND phone=$2",
        [username, phone]
    );
    if (userRes.rows.length > 0) {
        return {
            success: true,
            msg: "",
            user: userRes.rows[0]
        };
    }

    // 2. 检查手机号是否绑定其他账号
    const phoneExistRes = await pool.query(
        "SELECT id FROM users WHERE phone=$1",
        [phone]
    );
    if (phoneExistRes.rows.length > 0) {
        return {
            success: false,
            msg: "该手机号已被其他账号注册，请核对信息"
        };
    }

    // 3. 手机号无记录，校验白名单
    const whitelistResults = await pool.query(
        "SELECT * FROM user_whitelist WHERE username=$1",
        [username]
    );
    if (whitelistResults.rows.length === 0) {
        return {
            success: false,
            msg: "该账号未准入，无法登录"
        };
    }

    // 白名单内，新建用户
    const insertRes = await pool.query(`
        INSERT INTO users (username, phone, login_count, first_login_at, last_login_at)
        VALUES ($1, $2, 1, NOW(), NOW()) RETURNING *
    `, [username, phone]);

    return {
        success: true,
        msg: "",
        user: insertRes.rows[0]
    };
};