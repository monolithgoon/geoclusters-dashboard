const express = require ("express");
const expressRouter = express.Router();
const viewsController = require('../controllers/view-controller.js')

// expressRouter.get('/', viewsController.getAPIData, viewsController.renderAVGDashboard);
expressRouter.get('/', viewsController.renderAVGDashboard);

module.exports = expressRouter;