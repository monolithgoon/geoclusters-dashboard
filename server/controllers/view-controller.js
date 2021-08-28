`use strict`
const catchAsync = require('../utils/catch-async.js');
const chalk = require('../utils/chalk-messages.js');


exports.renderAVGDashboard = catchAsync(async(req, res, next) => {

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderAVGDashboard' VIEW CONTROLLER FN. `));
      
      res.status(200).render('dashboard', {
         title: "AVG Dashboard - SSR Alpha",
         user: "FieldDev Group",
         geoClusters: req.app.locals.returnedClusters,
      });

      next();

}, `renderDashboardErr`);


exports.renderLandingPage = catchAsync(async(req, res, next) => {

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderLandingPage' VIEW CONTROLLER FN. `));

   res.status(200).render('landing', {
      title: "AGC Platform - SSR V1.0",
      user: "FieldDev Group",
      totalNumClusters: req.app.locals.clustersSummary.totalNumClusters,
      totalNumFeatures: req.app.locals.clustersSummary.totalNumFeatures,
   });
   
}, `renderLandingPageErr`);