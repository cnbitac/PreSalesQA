const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const knowledgeRoutes = require("./routes/knowledge.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/knowledge", knowledgeRoutes);

const publicPath = path.join(__dirname, "../public");

console.log("📦 Static publicPath:", publicPath);

app.use(express.static(publicPath));

app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();

    res.sendFile(path.join(publicPath, "login.html"), (err) => {
        if (err) {
            console.error("❌ sendFile error:", err);
            res.status(500).send("login.html not found");
        }
    });
});

module.exports = app;