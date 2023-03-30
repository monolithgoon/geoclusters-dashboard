`use strict`
const chalk = require('../utils/chalk-messages.js');
const APP_CONFIG = require("../config/config.js");
const catchAsync = require("../middlewares/catch-async-server-error.js");


exports.renderLandingPage = catchAsync(async(req, res, next) => {

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderLandingPage' VIEW CONTROLLER FN. `));

   // render the 'landing.pug' template with the specified variables
   res.status(200).render('landing', {
      title: APP_CONFIG.appTitle,
      developer: APP_CONFIG.appDeveloper,
      user: APP_CONFIG.appOwner,
      totalNumClusters: req.app.locals.clustersSummary.totalNumClusters,
      totalNumFeatures: req.app.locals.clustersSummary.totalNumFeatures,
   });
   
}, `renderLandingPageErr`);


exports.renderAVGDashboard = catchAsync(async(req, res, next) => {

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderAVGDashboard' VIEW CONTROLLER FN. `));
      
      // render the 'dashboard.pug' template with the specified variables
      res.status(200).render('dashboard', {
         title: APP_CONFIG.appTitle,
         developer: APP_CONFIG.appDeveloper,
         user: APP_CONFIG.appOwner,
         geoClusters: req.app.locals.returnedClusters,
         totalNumFeatures: req.app.locals.clustersSummary.totalNumFeatures,
      });

      next();

}, `renderDashboardErr`);