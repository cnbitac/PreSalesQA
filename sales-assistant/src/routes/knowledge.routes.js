const express = require("express");
const router = express.Router();
const controller = require("../controllers/knowledge.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, controller.knowledge);
router.get("/count", auth, controller.count);

module.exports = router;