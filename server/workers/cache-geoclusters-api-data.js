`use strict`;
const fs = require("fs");
const path = require("path");
const chalk = require("../utils/chalk-messages.js");
const axios = require("axios");
const turf = require("@turf/turf");
const gjv = require("geojson-validation");
const {
	_GetClusterProps,
	_GetClusterFeatProps,
} = require("../interfaces/cluster-props-adapter.js");
const { _sanitizeFeatCollCoords } = require("../utils/helpers.js");
const API_URLS = require("../constants/api-urls.js");
const config = require("../config/config.js");
const { _getFlatClusterProps } = require("../interfaces/cluster-props-adapter-v2.js");

/**
 * Reports the statistics of a saved file.
 * @param {string} filePath - The path of the saved file.
 */
function reportFileStats(filePath) {
	// Getting the stats of the saved file
	const fileStats = fs.statSync(`${filePath}`);

	// Calculating the file size in bytes
	const fileByteSize = fileStats.size;

	// Calculating the file size in MB
	const fileMBSize = fileByteSize / (1024 * 1024);

	// Logging the file statistics
	console.log(
		chalk.success(
			`File was saved -> [ ${path.basename(filePath)} ] -> ${fileMBSize.toFixed(2)} MB`
		)
	);
}

/**
 * Saves the returned data from the database to disk.
 * @param {string} data - The data to be saved.
 * @param {string} collectionName - The name of the database collection.
 */
function saveData(data, collectionName) {
	console.log(
		chalk.working(`Saving database collection [ ${collectionName} ] to local storage ..`)
	);

	// Defining the file path where the data will be saved
	const filePath = path.resolve(`${__approotdir}/localdata/${collectionName}.json`);

	// Writing the data to the specified file path
	fs.writeFile(filePath, data, (saveDataErr) => {
		// If there is an error in saving the data
		if (saveDataErr) {
			// Throwing an error with a descriptive message
			throw new Error(
				chalk.highlight(`Failed to save DB. data to disk.. ${saveDataErr.message}`)
			);
		}
		// If the data was saved successfully
		reportFileStats(filePath);
	});
}

async function getDBCollection(url, apiAccessToken) {
	console.log(chalk.consoleY(`AXIOS retreiving data from [ ${url} ]`));

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

		// REMOVE > UN-USED
		// CREATE A TIME STAMP STRING TO APPEND TO THE FILE NAME
		let requestTimeStr = new Date(Date.parse(apiResponse.data.requested_at)).toISOString();
		requestTimeStr = requestTimeStr.replace(/:/g, ".");
		requestTimeStr = requestTimeStr.replace(/T/g, "-T");

		return collectionData;
	} catch (axiosError) {
		console.error(chalk.fail(`axiosError: ${axiosError.message}`));
		return null;
	}
}

// REMOVE > UN-USED
// TODO > VALIDATE GeoJSON
function validateGeoJSON(geoJSON) {
	if (!gjv.valid(geoJSON)) {
		console.log(chalk.warningStrong("Invalid GeoJSON"));
		return false;
	}

	// const trace = gjv.isFeatureCollection(geoJSON, true);
	// console.log(chalk.consoleY(trace))
}

/**
 * @function flattenGeoclusterProperties
 * @description This function is used to flatten / normalize the properties of the a geocluster's GeoJSON.
 * It takes an array of geoclusters' GeoJSON as input, validates the format of the FeatureCollection,
 * checks if it contains iterable features, sanitizes the coordinates,
 * extracts the properties of the cluster and features, and finally returns a normalized array of GeoJSON for each cluster.
 * @param {Array} geoclustersArray - An array of GeoJSON clusters to be normalized.
 * @returns {Array} normalizedClusters - An array of normalized GeoJSON clusters.
 */
// REMOVE > DEPRC. BY MORE FUNCITONAL VERSION OF CODE BELOW
// function flattenGeoclusterProperties(geoclustersArray) {
// 	try {
// 		const normalizedClusters = [];

// 		if (geoclustersArray) {
			
// 			for (let geoclusterGeoJSON of geoclustersArray) {

// 				// Check if the supplied GeoJSON is a valid FeatureCollection
// 				if (turf.getType(geoclusterGeoJSON) !== `FeatureCollection`) {
// 					throw new Error(`The supplied GeoJSON is not a valid FeatureCollection`);
// 				}

// 				// Check if the FeatureCollection contains iterable features
// 				if (!Array.isArray(geoclusterGeoJSON.features)) {
// 					throw new Error(`The supplied FeatureCollection does not have itirable Features`);
// 				}

// 				// SANDBOX
// 				// WIP
// 				// if (!gjv.valid(geoclusterGeoJSON)) {
// 				// 	throw new Error(`Invalid GeoJSON`)
// 				// }

// 				// Sanitize the coordinates of the FeatureCollection
// 				geoclusterGeoJSON = _sanitizeFeatCollCoords(geoclusterGeoJSON);

// 				// Extract flattened, normalized properties of the cluster
// 				// const flattenedClusterProps = _GetClusterProps(geoclusterGeoJSON);
// 				const flattenedClusterProps = _getFlatClusterProps(geoclusterGeoJSON);

// 				// Replace the original props. with the flattened props
// 				geoclusterGeoJSON.properties = flattenedClusterProps;

// 				// Extract properties of each feature in the cluster
// 				for (let idx = 0; idx < geoclusterGeoJSON.features.length; idx++) {
// 					const clusterFeature = geoclusterGeoJSON.features[idx];
// 					const flatClusterFeatProps = _GetClusterFeatProps(clusterFeature, { featIdx: idx });
// 					clusterFeature.properties = flatClusterFeatProps;
// 				};

// 				normalizedClusters.push(geoclusterGeoJSON);
// 			}
// 		}
// 		return normalizedClusters;

// 	} catch (normalizePropsErr) {
// 		console.error(chalk.fail(`normalizePropsErr: ${normalizePropsErr}`));
// 		return null;
// 	}
// }

function flattenGeoclusterProperties(geoclustersArray) {
  try {
    // Use Array.map() to create a new array of normalized feature collections
    return geoclustersArray.map(geoclusterGeoJSON => {
      // Check if the supplied GeoJSON is a valid FeatureCollection
      if (turf.getType(geoclusterGeoJSON) !== 'FeatureCollection') {
        throw new Error('The supplied GeoJSON is not a valid FeatureCollection');
      }

      // Check if the FeatureCollection contains iterable features
      if (!Array.isArray(geoclusterGeoJSON.features)) {
        throw new Error('The supplied FeatureCollection does not have iterable Features');
      }

      // Sanitize the coordinates of the FeatureCollection
      geoclusterGeoJSON = _sanitizeFeatCollCoords(geoclusterGeoJSON);

      // Get flattened, normalized properties of the cluster
      const flattenedClusterProps = _getFlatClusterProps(geoclusterGeoJSON);

			// Replace the original props. with the flattened props
      geoclusterGeoJSON.properties = flattenedClusterProps;

      // Extract properties of each feature in the cluster
      const flattenedFeats = geoclusterGeoJSON.features.map((clusterFeature, idx) => {

        const flatClusterFeatProps = _GetClusterFeatProps(clusterFeature, { featIdx: idx });

        // Use the spread operator to create a new object with the original feature's properties
        // and replace them with the normalized feature properties
        return {
          ...clusterFeature,
          properties: flatClusterFeatProps,
        };
      });

      // Use the spread operator to create a new object with the original feature collection's
      // features and replace them with the normalized features
      return {
        ...geoclusterGeoJSON,
        features: flattenedFeats,
      };
    });
  } catch (normalizePropsErr) {
    // Log the error message to the console in red text
    console.error(chalk.fail(`normalizePropsErr: ${normalizePropsErr}`));
    return null;
  }
}


/**
 * @function getAPICollections
 * @description Gets collections from an API.
 * @param {string} apiHost - The host URL of the API.
 * @param {Array} resourcePaths - An array of resource paths for the API.
 * @return {Array} The collected data from the API.
 */
async function getAPICollections(apiHost, resourcePaths) {
	// Initializing an array to store the collected data
	const data = [];

	// Looping through the resource paths
	for (const resourcePath of resourcePaths) {
		// Getting the data for each collection
		const collectionData = await getDBCollection(`${apiHost}/${resourcePath}`);

		// If the data exists, push it to the data array
		if (collectionData) data.push(collectionData);
	}

	// Returning the collected data
	return data;
}

// /**
//  *
//  * Asynchronously download data from the geoclusters API, and save locally to disk in server/localdata
//  * This action is performed only **once** when the server loads up initially
//  * This action is neccessary in order to avoid expensive API calls on paage load,
//  * and to instantly hydrate the DOM with server-side data
//  * The cached data is read from disk, and passed to the /server/view-controller via the server/data-controller
//  * The data is then made available as an object in the dashboard app using PUG variables
//  *
//  */
// async function cacheAPIData() {
// 	try {
// 		const apiCollections = await getAPICollections(
// 			config.geoclustersHostUrl,
// 			API_URLS.GEOCLUSTERS.RESOURCE_PATHS
// 		);

// 		console.log({ apiCollections });

// 		for (const geoclusterCollection of apiCollections) {
// 			if (geoclusterCollection && geoclusterCollection.data) {
// 				const collectionJSON = flattenGeoclusterProperties(geoclusterCollection.data.collection_docs);
// 				if (collectionJSON) {
// 					saveData(JSON.stringify(collectionJSON), geoclusterCollection.data.collection_name);
// 				}
// 			}
// 		}
// 	} catch (cacheAPIDataErr) {
// 		console.error(chalk.fail(`cacheAPIDataErr: ${cacheAPIDataErr.message}`));
// 	}
// }

/**
 * @description Caches data from the API collections.
 *
 * Asynchronously download data from the geoclusters API, and save locally to disk in server/localdata
 * This action is performed only **once** when the server loads up initially
 * This action is neccessary in order to avoid expensive API calls on paage load,
 * and to instantly hydrate the DOM with server-side data
 * The cached data is read from disk, and passed to the /server/view-controller via the server/data-controller
 * The data is then made available as an object in the dashboard app using PUG variables
 *
 * @async
 * @function cacheAPIData
 * @throws {Error} If the API request fails or if there is an issue with the data being processed.
 */
async function cacheAPIData() {
	try {
		// Make the API request to get the collections.
		const apiCollections = await getAPICollections(
			config.geoclustersHostUrl,
			API_URLS.GEOCLUSTERS.RESOURCE_PATHS
		);

		// Log the received collections for debugging purposes.
		console.log({ apiCollections });

		// Loop through each collection and process the data
		for (const geoclusterCollection of apiCollections) {
			if (geoclusterCollection && geoclusterCollection.data) {
				// Normalize (flatten) the collection data.
				const collectionJSON = flattenGeoclusterProperties(geoclusterCollection.data.collection_docs);

				if (collectionJSON) {
					// Save the normalized data to disk.
					saveData(JSON.stringify(collectionJSON), geoclusterCollection.data.collection_name);
				}
			}
		}
	} catch (cacheAPIDataErr) {
		console.error(chalk.fail(`cacheAPIDataErr: ${cacheAPIDataErr.message}`));
	}
}

module.exports = cacheAPIData;
