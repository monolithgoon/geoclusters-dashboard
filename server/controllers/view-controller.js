`use strict`
const chalk = require('../utils/chalk-messages.js');
const axios = require("axios");


exports.renderAVGDashboard = async (req, res, next) => {

   // console.log(chalk.console(JSON.stringify(req.app.locals.geoClusters[0])));

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderAVGDashboard' VIEW CONTROLLER FN. `));

   try {
      
      res.status(200).render('dashboard', {
         title: "AVG Dashboard - SSR Alpha",
         user: "FieldDev Group",
         geoClusters: req.app.locals.returnedClusters,
      });

      next();

   } catch (renderAGVErr) {
      console.error(chalk.fail(`renderAGVErr: ${renderAGVErr.message}`));
   };
};


exports.renderLandingPage = async (req, res, next) => {
   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderLandingPage' VIEW CONTROLLER FN. `));
   res.status(200).render('landing', {
      title: "AGC Platform - SSR V1.0",
      user: "FieldDev Group"
   })
};