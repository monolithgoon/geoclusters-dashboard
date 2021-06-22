const express = require ("express");
const expressRouter = express.Router();
const viewsController = require('../controllers/view-controller.js')

expressRouter.get('/', viewsController.renderLandingPage);
expressRouter.get('/landing', viewsController.renderLandingPage);
expressRouter.get('/dashboard', viewsController.renderAVGDashboard);

module.exports = expressRouter;