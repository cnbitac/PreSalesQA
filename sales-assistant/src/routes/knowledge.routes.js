const express = require("express");
const router = express.Router();
const controller = require("../controllers/knowledge.controller");

router.get("/", controller.knowledge);
router.get("/count", controller.count);

module.exports = router;