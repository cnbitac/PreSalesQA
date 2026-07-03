require("dotenv").config();

const app = require("./app");
const initDB = require("./db/init");

const PORT = process.env.PORT || 3000;

async function bootstrap() {
    try {
        console.log("🔄 init database...");
        await initDB();
        console.log("✅ DB ready");
    } catch (err) {
        console.error("❌ DB init failed:", err);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`🚀 server running: http://localhost:${PORT}`);
    });
}

bootstrap();