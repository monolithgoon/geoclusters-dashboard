`use strict`
const fs = require('fs');
const path = require('path');
const chalk = require('../utils/chalk-messages.js');
const axios = require("axios");
const gjv = require('geojson-validation');
const { _GetClusterProps, _getClusterFeatProps } = require('../interfaces/cluster-props-adapter.js');
const catchAsync = require('../utils/catch-async.js');


// REPORT SAVED FILE STATS.
function reportFileStats(file) {
   const fileStats = fs.statSync(`${file}`)
   const fileByteSize = fileStats.size;
   const fileMBSize = fileByteSize / (1024*1024)
   console.log(chalk.success(`File saved was ${fileMBSize.toFixed(2)} MB`))
}


// SAVE RETURNED DB. DATA TO DISK
function saveData(data, collectionName) {
   console.log(chalk.working(`SAVING DB. COLLECTION [ ${collectionName} ] TO LOCAL STORAGE ..`))
   const filePath = path.resolve(`${__approotdir}/localdata/${collectionName}.json`)
   fs.writeFile(filePath, data, (saveDataErr) => {
      if (saveDataErr) {
         throw new Error(chalk.highlight(`Failed to save DB. data to disk.. ${saveDataErr.message}`))
      }
      reportFileStats(filePath);
   });
};


async function returnAllParcelizedClusters() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         // url: `http://127.0.0.1:9090/api/v1/parcelized-agcs/?fields=properties,features.properties,`,
         // url: `http://127.0.0.1:9090/api/v1/parcelized-agcs/`,
         url: `https://geoclusters.herokuapp.com/api/v1/parcelized-agcs/`,
         crossDomain: true,
         responseType: 'application/json',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            // 'Authorization': ''
         },
         data: {

         }
      });

      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest;
      const clustersData = apiResponse.data;

      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, ".");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");

      return clustersData;

	} catch (axiosError) {
		console.error(chalk.fail(axiosError.message));
	};
};


async function returnAllLegacyClusters() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         // url: `http://127.0.0.1:9090/api/v2/legacy-agcs/`,
         // url: `http://127.0.0.1:9090/api/v2/legacy-agcs/?fields=properties.geo_cluster_id,properties.geo_cluster_name,properties.geo_cluster_details,features.properties,`,
         url: `https://geoclusters.herokuapp.com/api/v2/legacy-agcs/`,
         crossDomain: true,
         responseType: 'application/json',
         headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json',
            // 'Authorization': ''
         },
         data: {

         }
      });

      // GET RESPONSE FROM API CALL
      const apiResponse = await axiosRequest;
      const clustersData = apiResponse.data;

      // CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
      let requestTimeStr = new Date( Date.parse(apiResponse.data.requested_at)).toISOString();
      requestTimeStr = requestTimeStr.replace(/:/g, ".");
      requestTimeStr = requestTimeStr.replace(/T/g, "-T");
      
      return clustersData;
	}

	catch (axiosError) {
		console.error(chalk.fail(axiosError.message));
	};
};


// TODO > VALIDATE GeoJSON
function validateGeoJSON(geoJSON) {
   if (!gjv.valid(geoJSON)) {
      console.log(chalk.warningStrong('Invalid GeoJSON'));
   };

   // const trace = gjv.isFeatureCollection(geoJSON, true);
   // console.log(chalk.console(trace))
};


async function normalizeProps(geoClusterArray) {
   const stdGeoClusters = [];
   if (geoClusterArray) {
      for (const clusterGeoJSON of geoClusterArray) {
         const clusterProps = _GetClusterProps(clusterGeoJSON);
         clusterGeoJSON.properties = clusterProps;
         for (const clusterFeature of clusterGeoJSON.features) {
            const clusterFeatProps = _getClusterFeatProps(clusterFeature);
            clusterFeature.properties = clusterFeatProps;
         };
         // console.log(chalk.console((Object.values(clusterGeoJSON))));
         stdGeoClusters.push(clusterGeoJSON);
      };
   };
   return stdGeoClusters;
};


async function cacheData() {

   console.log(chalk.working(`Dowloading DB. collections to local-storage...`));

   try {
      
      const parcelizedClustersData = await returnAllParcelizedClusters();
      const legacyClustersData = await returnAllLegacyClusters();

      // NORMALIZE ALL THE PROPS.
      // // if (parcelizedClustersData && legacyClustersData) {
      //    const parcelizedClusters = await normalizeProps(parcelizedClustersData.data.parcelized_agcs);
      //    const legacyClusters = await normalizeProps(legacyClustersData.legacy_agcs);
      // // };
      
      saveData(JSON.stringify(legacyClustersData), `legacy-clusters`);
      saveData(JSON.stringify(parcelizedClustersData), `parcelized-clusters`);

   } catch (localizeDataErr) {
      console.error(chalk.fail(`localizeDataErr: ${localizeDataErr.message}`));
   };
};


module.exports = cacheData;