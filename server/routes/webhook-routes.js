`use strict`;
const express = require("express");
const router = express.Router();
const webhookController = require("../controllers/webhook-controller.js");

router.post("/", webhookController.cacheNewData);

module.exports = router;