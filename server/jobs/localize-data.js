const fs = require('fs');
const path = require('path');
const chalk = require('../utils/chalk-messages.js');
const axios = require("axios");

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
   const filePath = path.resolve(`${__approotdir}/localdata/${collectionName}.geojson`)
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
         url: `http://127.0.0.1:9090/api/v1/parcelized-agcs/`,
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

async function returnAllLegacyClusters() {

	try {
      
      const axiosRequest = axios({
         method: 'get',
         url: `http://127.0.0.1:9090/api/v2/legacy-agcs/`,
         // url: `http://127.0.0.1:9090/api/v2/legacy-agcs/?fields=properties.geo_cluster_id,properties.geo_cluster_name,properties.geo_cluster_details,features.properties,`,
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

async function localizeData() {

   console.log(chalk.working(`Dowloading DB. collections to local-storage...`))

   try {
      
      const parcelizedClustersData = await returnAllParcelizedClusters();
      // console.log(parcelizedClustersData.data.parcelized_agcs);
      
      const legacyClusterData = await returnAllLegacyClusters();
      // const clusterProps = legacyClusterData.properties;
      // const clusterDetails = clusterProps.geo_cluster_details
      
      // const returnedClusters = {
      //    dateCreated: clusterProps.db_insert_timestamp,
      //    geoclusterId: clusterProps.geo_cluster_id,
      //    geoclusterName: clusterProps.geo_cluster_name,
      //    geoclusterLGA: clusterDetails.lga[0],
      //    geoclusterWard: clusterDetails.ward[0],
      //    geoclusterPresident: {
      //       firstName: clusterProps.geo_cluster_governance_structure.president.first_name,
      //       lastName: clusterProps.geo_cluster_governance_structure.president.last_name,
      //    },
      //    geoclusterCommodity: null,
      //    numFeatures: clusterProps.geo_cluster_total_features,
      //    measuredArea: clusterProps.delineated_area,
      //    allocatedArea: clusterDetails.total_allocations_area,
      //    unusedArea: clusterDetails.delineated_area - this.allocatedArea,
      //    centerCoords: null,
      //    metadata: clusterProps.file_parse_metadata
      // }
      // console.log(returnedClusters);
      
      saveData(JSON.stringify(parcelizedClustersData), `parcelized-clusters`)
      saveData(JSON.stringify(legacyClusterData), `legacy-clusters`)

   } catch (localizeDataErr) {
      throw new Error(chalk.fail(`localizeDataErr: ${localizeDataErr.message}`))
   }
}

module.exports = localizeData;