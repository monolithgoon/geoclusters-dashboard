`use strict`;
const express = require("express");
const router = express.Router();
const dataController = require("../controllers/data-controller.js");

router.get("/nga-admin-bounds", 
	dataController.getAdminBoundsGeoJSON,
);

router.get("/nga-admin-bounds-lvl1",
	dataController.getAdminBoundsLvl1GeoJSON,
);

router.get("/nga-admin-bounds-lvl2",
	dataController.getAdminBoundsLvl2GeoJSON,
);

router.get("/nga-admin-bounds-lvl3",
	dataController.getAdminBoundsLvl3GeoJSON,
);

module.exports = router;