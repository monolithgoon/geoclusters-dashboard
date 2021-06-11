const fs = require('fs');
const path = require('path');
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
//    res.locals.returnedClusters = await returnLegacyCluster();
//    // console.log(chalk.console(res.locals.returnedClusters));
//    next();
// }

exports.renderAVGDashboard = async (req, res, next) => {

   // console.log(chalk.console(res.locals.returnedClusters));

   console.log(chalk.success(`SUCCESSFULLY CALLED 'renderAVGDashboard' VIEW CONTROLLER FN. `));

   try {

      const fileData = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-clusters.geojson`), {encoding: 'utf8'})
      const fsClusters = JSON.parse(fileData);

      // SANDBOX
      console.log(fsClusters);
      
      // RENDER THE agv-dashboard.pug TEMPLATE
      res.status(200).render('avg-dashboard', {
         title: "AVG Dashboard - SSR Alpha",
         user: "FieldDev Group",
         // FIXME > THIS DATA SHOULD PASS THRU. THE CLUSTER PROPS ADAPTER!!!
         geoClustersData: fsClusters.data.parcelized_agcs,
      });

      next();

   } catch (renderAGVErr) {

      console.log(chalk.fail(`renderAGVErr: ${renderAGVErr.message}`));
   };
};