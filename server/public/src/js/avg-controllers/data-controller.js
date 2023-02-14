`use strict`;
import { GET_DOM_ELEMENTS } from "../utils/get-dom-elements.js";
import { _ManipulateDOM } from "./ui-controller.js";
import { ShowActivity } from "../utils/fn-monitor.js";
import { APP_STATE } from "./state-controller.js";
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";
import { _Arrays, _MONITOR_EXECUTION } from "../utils/helpers.js";
import API_URLS from "../constants/api-urls.js";

export function _retreiveClusterGJDatasets() {
	try {
		const geoClusters = JSON.parse(
			_ManipulateDOM.getDataset(GET_DOM_ELEMENTS().geoClustersDatasetEl)
		);

		return {
			geoClusters,
		};
	} catch (retreiveGJErr) {
		console.error(`retreiveGJErr: ${retreiveGJErr.message}`);
	}
}

/**
 * @description Queries an API for data
 *
 * @async
 * @function queryAPI
 * @param {function} fetch - The `fetch` function with which to make API requests
 * @param {string} apiHost - The base URL of the API to be queried
 * @param {string} apiResourcePath - The path to the desired API resource
 * @param {object} [options={}] - Additional options to configure the API request
 * @param {string} [options.queryString=''] - The query string to be appended to the API request URL
 * @returns {(object|null)} - The data returned from the API, or `null` if an error occurs
 */
async function queryAPI(fetch, apiHost, apiResourcePath, { queryString } = {}) {
	// Set the query string to an empty string if no query string is provided
	queryString = queryString ? queryString : (queryString = "");

	// console.log(
	//   `%c ${this.target} is getting latest data from API`,
	//   `background-color: lightgrey; color: blue;`
	// );

	try {
		// Make the API request
		const apiResponse = await fetch(`${apiHost}/${apiResourcePath}/${queryString}`);
		const data = await apiResponse.json();

		// Check if the API responded with data
		if (!data) {
			throw new Error(
				`The API endpoint [ ${apiHost}/${apiResourcePath}/${queryString} ] did not respond; check your connection`
			);
		}

		// Check if the API request was successful
		// if (checkStatus(data.status)) {
		if (data.status !== `fail`) {
			return data;
		} else {
			throw new Error(`API Request Failed. ${JSON.stringify(data)}`);
		}
	} catch (queryAPIErr) {
		console.error(`queryAPIErr: ${queryAPIErr.message}`);
		return null;
	}
}

/**
 * @function
 * @async
 * @param {Object} eventObj - An object representing the event.
 * @param {string} resourceHost - The hostname of the API resource.
 * @param {string} resourcePath - The path of the API resource.
 * @param {Object} options - An object containing queryString and other options.
 * @param {string} options.queryString - The query string to be passed in the API call.
 * @returns {Promise} A promise that resolves to the data returned from the API call.
 * @throws {Error} If an error occurs during the API call.
 */
export async function _getAPIResource(eventObj, resourceHost, resourcePath, { queryString } = {}) {
	try {
		queryString = queryString ? queryString : (queryString = "");

		/**
		 * @function callQueryAPI
		 * @inner
		 * @description A pipeline function for the API call
		 */
		const callQueryAPI = function () {
			// console.log(document.domain);
			return queryAPI.call(eventObj, window.fetch, resourceHost, resourcePath, { queryString });
		};

		/**
		 * @constant
		 * @description An object containing options for display functions and activity indicators.
		 */
		const options = {
			startDisplayFn: ShowActivity.activityStart,
			endDisplayFn: ShowActivity.activityEnd,
			appActivityIndWrapper: GET_DOM_ELEMENTS().appActivityIndWrapper,
			appActivityIndEl: GET_DOM_ELEMENTS().appActivityIndEl,
			appActivityStartIndTextEl: GET_DOM_ELEMENTS().appActivityStartIndTextEl,
			appActivityEndIndTextEl: GET_DOM_ELEMENTS().appActivityEndIndTextEl,
			appActivityIndText: `FETCHING DATA`,
		};

		// Execute the API call inside a monitoring function
		const exeResult = await _MONITOR_EXECUTION({ logger: undefined }).execute(
			callQueryAPI,
			options
		);

		return exeResult?.returnedData;
	} catch (getAPIResourceErr) {
		console.error(`getAPIResourceErr: ${getAPIResourceErr.message}`);
	}
}

// REMOVE > DEPRECATED
/**
 * @description Downloads and saves parcelized cluster data from a remote API.
 *
 * The function loops through each resource path defined in DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTERS_RESOURCE_PATHS
 * and performs an API call for each resource path using the `queryAPI.call` function.
 * The execution time of each API call is monitored and recorded using the `_MONITOR_EXECUTION` object.
 * If the API call returns data, it is saved using the `APP_STATE.cacheDBCollection` function.
 * The function returns `true` on success or `false` if there is an error during the process.
 *
 * @async
 * @function _downloadAndSaveParcelizedClusters
 *
 * @returns {boolean} - Returns true on success or false if there is an error during the process.
 *
 * @throws {Error} - If there is an error during the process, an error will be thrown.
 */
export async function _downloadAndSaveParcelizedClusters() {
	try {
		// Constants
		const apiHost = DEFAULT_APP_SETTINGS.GEOCLUSTERS_API_HOST;
		const resourcePaths = DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTERS_RESOURCE_PATHS;

		for (const resourcePath of resourcePaths) {
			// Get the API response for the current resource path
			const apiResponse = await _getAPIResource(window, apiHost, resourcePath, {});

			if (!apiResponse) throw new Error(`The API did not respond`);

			console.log({ apiResponse });

			// Get the database collection name from the resource path
			const dbCollectionName = resourcePath.slice(resourcePath.indexOf("/") + 1);

			// Save the API response in the app state
			APP_STATE.cacheDBCollection(dbCollectionName, apiResponse);
		}

		return true;
	} catch (error) {
		console.error(`Error while downloading and saving parcelized clusters: ${error}`);
		return false;
	}
}

export const _ParcelizedClustersController = (() => {

	/**
	 * @funciton getCollectionNameFromPath
	 * @description Extracts the collection name from the given resource path.
	 *
	 * @param {string} resourcePath - The resource path to extract the collection name from.
	 * @returns {string} - The collection name.
	 */
	function getCollectionNameFromPath(resourcePath) {
		// find the index of the first "/" in the resource path
		const firstSlashIndex = resourcePath.indexOf("/");

		// slice the resource path starting from the character after the first "/"
		const dbCollectionName = resourcePath.slice(firstSlashIndex + 1);

		// return the resulting string as the collection name
		return dbCollectionName;
	}

	/**
	 * @function collectionAlreadyCached
	 * @description Check if a collection is already cached in the APP_STATE.
	 * @param {object} appState - The state object containing information about the cached collections.
	 * @param {string} dbCollectionName - The name of the database collection to check.
	 * @returns {boolean} - A boolean indicating whether the collection is cached or not.
	 */
	function collectionAlreadyCached(appState, dbCollectionName) {
		// Retrieve the cached collection from the state object
		const cachedCollection = appState.returnCachedDBCollection(dbCollectionName);

		// Check if the collection exists and has data
		const isCachedBefore =
			cachedCollection === null || cachedCollection.data.length === 0 ? false : true;

		return isCachedBefore;
	}

	/**
	 * Downloads parcelized clusters from the API.
	 *
	 * @async
	 * @param {string[]} clusterIds - An array of cluster IDs to download.
	 * @param {Window} window - The current window object.
	 * @param {string} apiHost - The API host to download from.
	 * @param {string} resourcePath - The resource path to download from.
	 * @returns {Promise} - A promise that resolves to an array of parcelized clusters.
	 */
	const retreiveParcelizedClusters = async (clusterIds, window, apiHost, resourcePath) => {
		console.log("Retreiving geojson for each new cluster")

		const clusters = [];

		// loop through each cluster ID in the input array
		for (const clusterId of clusterIds) {
			const queryString = `?${clusterId}`;

			// use the _getAPIResource function to download cluster data from the API
			const clusterData = await _getAPIResource(window, apiHost, resourcePath, {
				queryString: queryString,
			});

			// log the clusterData for debugging purposes
			// console.log({ clusterData });

			// if the downloaded data does not have a parcelizedAgcData key, skip to the next cluster ID
			if (!clusterData?.data) continue;

			// add the parcelizedAgc geojson data to the clusters array
			// TODO > REPLACE HARD-CODED OBJECT ACCESORS
			clusters.push(clusterData.data.parcelizedAgcData);
		}

		// return the clusters array
		return clusters;
	};

	/**
	 * @function cacheNewParcelizedClusters
	 * @description Adds a new array of clusters to the existing collection in appState and caches it.
	 * @param {Object} appState - The current app state object.
	 * @param {string} collectionName - The name of the collection where the clusters should be added.
	 * @param {Object[]} newClustersArray - The array of new clusters to add to the collection.
	 * @returns {Promise<void>}
	 */
	async function cacheNewParcelizedClusters(appState, collectionName, newClustersArray) {
		// Get the existing collection from the app state
		const cachedCollection = appState.returnCachedDBCollection(collectionName);

		// Create a new array of clusters that includes the existing and new clusters
		const updatedClusters = [...cachedCollection.data.collection_docs, ...newClustersArray];

		// Create a new object that copies the existing collection object and replaces the cluster array
		const updatedCachedCollection = {
			...cachedCollection,
			data: {
				...cachedCollection.data,
				collection_docs: updatedClusters,
			},
		};

		console.log({ updatedCachedCollection });

		// Cache the updated collection object in the app state
		appState.cacheDBCollection(collectionName, updatedCachedCollection);
	}

	// Constants for parcelized clusters metadata API host and resource path
	// Only the metadata for the clusters is downloaded at this step in order to save network bandwith
	const apiHost = DEFAULT_APP_SETTINGS.GEOCLUSTERS_API_HOST;
	const metadataResourcePath = API_URLS.GEOCLUSTERS.RESOURCE_PATHS.PARCELIZED_CLUSTERS_METADATA;
	const clusterResourcePath = API_URLS.GEOCLUSTERS.RESOURCE_PATHS.PARCELIZED_CLUSTER;
	const clustersResourcePath = API_URLS.GEOCLUSTERS.RESOURCE_PATHS.PARCELIZED_CLUSTERS_ONLY;

	// If, for some reason, the "/parcelized-agcs" & "/parcelized-agcs/metadata"
	// collections haven't been cached previously, cache them now, and exit this controller when done

	//  * Get the name of the database collection from the resource path.
	const clustersCollectionName = getCollectionNameFromPath(clustersResourcePath);

	//  * Get the name of the metadata database collection from the metadata resource path.
	const metadataCollectionName = getCollectionNameFromPath(metadataResourcePath);

	//  * Array of the names of the database collections.
	const resourceNames = [clustersCollectionName, metadataCollectionName];

	return {

		cacheClustersData: async (window, APP_STATE) => {
			//  * Loop through each resource name and retrieve the live data if it is not already cached.
			for (const collectionName of resourceNames) {
				// Check if the collection is already cached in the database
				const isCachedBefore = collectionAlreadyCached(APP_STATE, collectionName);

				// If the collection is not cached, retrieve the live data and cache it
				if (!isCachedBefore) {
					// Get the live data for the current collection
					const liveCollection = await _getAPIResource(
						window,
						apiHost,
						collectionName === clustersCollectionName
							? clustersResourcePath
							: metadataResourcePath,
						{}
					);

					// Break out of the controller if the API call fails
					if (!liveCollection) return;

					// Cache the live data for the current collection
					APP_STATE.cacheDBCollection(collectionName, liveCollection);
				} else {
					// exit loop if previously cached
					break;
				}
			}
			console.log("Finished caching clusters");
		},

		downloadNewClusters: async (window, APP_STATE) => {
			console.log("Downloading new clusters");

			// "Cached metadata collection exists -> Will now check for new cluster IDs."
			const cachedMetadataCollection =
				APP_STATE.returnCachedDBCollection(metadataCollectionName);

			const liveMetadataCollection = await _getAPIResource(
				window,
				apiHost,
				metadataResourcePath,
				{}
			);

			// Break out of the controller if the API call fails
			if (!liveMetadataCollection) return null;

			// REMOVE > SIMULATION
			let liveIds = [...liveMetadataCollection.data.collection_metadata.ids];
			liveIds.concat(["OGO_OWO_IS_A_PLATINUM_WHORE", "AGCBEN000005", "OGWDT000001"]);
			liveIds.push("OGO_OWO_IS_A_PLATINUM_WHORE");
			liveIds.push("AGCBEN000005");
			liveIds.push("OGWDT000001");

			const newClusterIds = _Arrays.getNonDuplicateElements({
				expandingArray: liveIds,
				// expandingArray: liveMetadataCollection.data.collection_metadata.ids,
				staticArray: cachedMetadataCollection.data.collection_metadata.ids,
			});

			// console.log({ newClusterIds });

			// REMOVE > SIMULATION
			newClusterIds.push("AGCBEN000005");
			newClusterIds.push("OGWDT000001");

			// Download the data for the new Ids from the DB
			const newParcelizedClusters = await retreiveParcelizedClusters(
				newClusterIds,
				window,
				apiHost,
				clusterResourcePath
			);

			// Break out of the controller if the API call fails
			if (!newParcelizedClusters) return null;

			// console.log({newParcelizedClusters})

			return newParcelizedClusters;
		},

		cacheNewClusters: (clustersArray, APP_STATE) => {
			// Append the data in the APP_STATE cache with the new clusters data
			cacheNewParcelizedClusters(APP_STATE, clustersCollectionName, clustersArray);

			//
			APP_STATE.returnCachedDBCollections();
		},

		// TODO
		renderNewClusters: (clustersArray, APP_STATE) => {
			// 1. update sidebar UI
			// 2. add clusters to basemap
		}
	};
})();

// SANDBOX

// REMOVE > DEPRECATED
export async function APIHTTPRequest(queryString) {
	console.log(`%c ${JSON.stringify(queryString)}`, `background-color: yellow`);

	try {
		const resultsCountDiv = document.getElementById("results_count");
		const resultsStatus = document.getElementById("results_status");

		const appActivityIndWrapper = document.querySelector(`.app-activity-indicator-wrapper`);
		const appActivityIndEl = document.querySelector(`.app-activity-indicator`);

		console.log(`this.id [ ${this.id} ] sending http request to API`);
		resultsCountDiv.innerHTML = ``;
		resultsStatus.classList.add(`spinner-grow`);
		resultsStatus.classList.add(`text-primary`);
		resultsStatus.classList.add(`spinner-grow-sm`);

		appActivityIndWrapper.classList.add(`reveal`);
		appActivityIndEl.innerHTML = ``;
		appActivityIndEl.classList.add(`spinner-grow`);
		appActivityIndEl.classList.add(`text-light`);
		appActivityIndEl.classList.add(`spinner-grow-sm`);

		const xhttp = new XMLHttpRequest();
		const url = `https://geoclusters.herokuapp.com/api/v2/legacy-agcs/${queryString}`;

		xhttp.open("GET", url, true);
		xhttp.setRequestHeader("Content-type", "application/json");
		xhttp.send();

		xhttp.onreadystatechange = function () {
			const reqLogStyle = `color:white; background-color:green;`;
			if (this.readyState === 0) {
				console.log(`req not initialized`);
			}
			if (this.readyState === 1) {
				console.log(`server connection established`);
			}
			if (this.readyState === 2) {
				console.log(`request received`);
			}
			if (this.readyState === 3) {
				console.log(`processing request`);
			}
			if (this.readyState === 4) {
				console.log(`%c request finished and response is ready`, `${reqLogStyle}`);
			}

			if (this.readyState === 4 && this.status === 200) {
				// console.log(this.responseText)
				resultsStatus.classList.remove(`spinner-grow`);
				resultsCountDiv.innerText = `${
					JSON.parse(this.responseText).num_legacy_agcs
				} Clusters ... ${JSON.parse(this.responseText).num_plot_owners} Plot Owners`;

				appActivityIndWrapper.classList.remove(`reveal`);
				appActivityIndEl.classList.remove(`spinner-grow`);
			}
		};

		xhttp.onload = function () {
			const parsedAPIData = JSON.parse(this.responseText);
			console.log(parsedAPIData.requested_at);
			console.log(parsedAPIData.num_legacy_agcs);
			console.log(parsedAPIData.num_plot_owners);
			console.log(parsedAPIData.legacy_agcs);
		};

		return {
			xhttp,
		};
	} catch (APIRequestErr) {
		console.error(`APIRequestErr: ${APIRequestErr}`);
	}
}
