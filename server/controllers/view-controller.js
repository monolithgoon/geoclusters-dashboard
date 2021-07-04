`use strict`
const chalk = require('../utils/chalk-messages.js');
const axios = require("axios");


// REMOVE > DEPRECATED
// async function returnLegacyCluster(agc_id) {

// 	try {
      
//       const axiosRequest = axios({
//          method: 'get',
//          url: `https://geoclusters.herokuapp.com/api/v1/legacy-agcs/`,
//          crossDomain: true,
//          responseType: 'application/json',
//          headers: {
//             'Accept': '*/*',
//             'Content-Type': 'application/json',
//             // 'Authorization': ''
//          },
//          data: {

//          }
//       });

//       // GET RESPONSE FROM API CALL
//       const apiResponse = await axiosRequest;
//       const clusterData = JSON.stringify(apiResponse.data);
//       console.log(clusterData);
//       return clusterData;
// 	}

// 	catch (_error) {
// 		console.error(_error.message);
// 	};
// };

// REMOVE > DEPRECATED
// exports.getAPIData = async (req, res, next) => {
//    console.log(chalk.success(`called [ getAPIData ] controller fn.`))
//    req.app.locals.returnedClusters = await returnLegacyCluster();
//    // console.log(chalk.console(req.app.locals.returnedClusters));
//    next();
// }


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