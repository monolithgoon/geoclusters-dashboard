`use strict`;
const fs = require("fs");
const path = require("path");
const chalk = require("../utils/chalk-messages.js");
const axios = require("axios");
const gjv = require("geojson-validation");
const {
	_GetClusterProps,
	_getClusterFeatProps,
} = require("../interfaces/cluster-props-adapter.js");
const { _sanitizeFeatCollCoords } = require("../utils/helpers.js");
const API_URLS = require("../constants/api-urls.js");
const config = require("../config/config.js");


// REPORT SAVED FILE STATS.
function reportFileStats(file) {
	const fileStats = fs.statSync(`${file}`);
	const fileByteSize = fileStats.size;
	const fileMBSize = fileByteSize / (1024 * 1024);
	console.log(chalk.success(`File saved was ${fileMBSize.toFixed(2)} MB`));
}


// SAVE RETURNED DB. DATA TO DISK
function saveData(data, collectionName) {
	console.log(chalk.working(`SAVING DB. COLLECTION [ ${collectionName} ] TO LOCAL STORAGE ..`));
	const filePath = path.resolve(`${__approotdir}/localdata/${collectionName}.json`);
	fs.writeFile(filePath, data, (saveDataErr) => {
		if (saveDataErr) {
			throw new Error(
				chalk.highlight(`Failed to save DB. data to disk.. ${saveDataErr.message}`)
			);
		}
		reportFileStats(filePath);
	});
}


async function getDBCollection(url, apiAccessToken) {

	console.log(chalk.console2(`AXIOS getting data from [ ${url} ]`));

	try {
		const axiosRequest = axios({
			method: "GET",
			url,
			// baseURL,
			crossDomain: true,
			responseType: "application/json",
			headers: {
				Accept: "*/*",
				"Content-Type": "application/json",
				// 'Authorization': apiAccessToken
			},
			data: {},
			// timeout: 30000,
		});

		const apiResponse = await axiosRequest;
		const collectionData = apiResponse.data;

		// CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
		let requestTimeStr = new Date(Date.parse(apiResponse.data.requested_at)).toISOString();
		requestTimeStr = requestTimeStr.replace(/:/g, ".");
		requestTimeStr = requestTimeStr.replace(/T/g, "-T");

		return collectionData;
	} catch (axiosError) {
		console.error(chalk.fail(`axiosError: ${axiosError.message}`));
	}
}


// TODO > VALIDATE GeoJSON
function validateGeoJSON(geoJSON) {
	if (!gjv.valid(geoJSON)) {
		console.log(chalk.warningStrong("Invalid GeoJSON"));
	}

	// const trace = gjv.isFeatureCollection(geoJSON, true);
	// console.log(chalk.console(trace))
}

// FLATTEN THE PROPS. OF THE GEOJSON
async function returnNormalized(geoClusterArray) {
	try {
		const normalizedClusters = [];

		if (geoClusterArray) {
			for (let clusterGeoJSON of geoClusterArray) {
				clusterGeoJSON = _sanitizeFeatCollCoords(clusterGeoJSON);
				const clusterProps = _GetClusterProps(clusterGeoJSON);
				clusterGeoJSON.properties = clusterProps;
				for (let idx = 0; idx < clusterGeoJSON.features.length; idx++) {
					const clusterFeature = clusterGeoJSON.features[idx];
					const clusterFeatProps = _getClusterFeatProps(clusterFeature, { featIdx: idx });
					clusterFeature.properties = clusterFeatProps;
				}
				// console.log(chalk.console((Object.values(clusterGeoJSON))));
				normalizedClusters.push(clusterGeoJSON);
			}
		}
		return normalizedClusters;
	} catch (normalizePropsErr) {
		console.error(chalk.fail(`normalizePropsErr: ${normalizePropsErr}`));
	}
}


async function getAPIData(apiHost, resourcePaths) {
	const data = [];

	for (const resourcePath of resourcePaths) {
		const collectionData = await getDBCollection(`${apiHost}/${resourcePath}`);
		if (collectionData) data.push(collectionData);
	}

	return data;
}


// ASYNCHRONOUSLY DOWNLOAD DATA FROM THE GEOCLUSTER API, AND SAVE TO DISK
// THIS ACTION IS PERFORMED ONLY **ONCE**WHEN THE SERVER LOADS UP INITIALLY
// THIS DATA IS READ FROM DISK & PASSED FROM THE /server/data-controller TO THE /server/view-controler
// IT IS MADE AVAILABLE AS AN OBJECT IN THE APP VIA THE /server/view-controller
async function cacheData() {

	try {
		const geoClustersData = await getAPIData(
			// API_URLS.GEOCLUSTERS.HOST.AWS,
			config.geoclustersHostUrl,
			API_URLS.GEOCLUSTERS.RESOURCE_PATHS
		);

		console.log({ geoClustersData });

		for (const geoCluster of geoClustersData) {
			if (geoCluster && geoCluster.data) {
				const geoClusterJSON = await returnNormalized(geoCluster.data.collection_docs);
				saveData(JSON.stringify(geoClusterJSON), geoCluster.data.collection_name);
			}
		}
	} catch (cacheDataErr) {
		console.error(chalk.fail(`cacheDataErr: ${cacheDataErr.message}`));
	}
}

module.exports = cacheData;
