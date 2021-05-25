const express = require ("express");
const expressRouter = express.Router();
const viewsController = require('../controllers/view-controller.js')

// expressRouter.get('/', viewsController.renderAGVDashboard);
// expressRouter.get('/', viewsController.getAPIData, viewsController.renderAGVDashboard);
expressRouter.get('/', viewsController.renderAGVDashboard, viewsController.renderAGVLeftSidebar);

module.exports = expressRouter;