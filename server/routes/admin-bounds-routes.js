`use strict`;
const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data-controller.js");

router.get("/nga-admin-bounds", 
	dataController.getAdminBoundsGJ,
);

router.get("/nga-admin-bounds-lvl3",
	dataController.getAdminBoundsLvl3Geojson
);

module.exports = router;