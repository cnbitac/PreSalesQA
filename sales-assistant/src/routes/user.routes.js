const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const user = require("../controllers/user.controller");

router.get("/me", auth, user.profile);

module.exports = router;