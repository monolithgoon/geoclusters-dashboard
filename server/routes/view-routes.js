`use strict`;
const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/view-controller.js");
const dataController = require("../controllers/data-controller.js");
const authController = require("../controllers/auth-controller.js");

router.get("/", 
	dataController.getCachedClustersSummary,
	viewsController.renderLandingPage
);

router.get("/landing",
	dataController.getCachedClustersSummary,
	viewsController.renderLandingPage
	);
	
	// affixes the currently logged-in user to res.locals
	router.use(authController.isLoggedIn);
	
	router.route("/dashboard")
	.get(
		authController.protectRoute,
		authController.restrictTo(`manager`, `admin`),
		dataController.getCachedClustersData,
		viewsController.renderAVGDashboard
	);

module.exports = router;