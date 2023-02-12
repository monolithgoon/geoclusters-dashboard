`use strict`;
import { GET_DOM_ELEMENTS } from "../utils/get-dom-elements.js";
import { _ManipulateDOM } from "./ui-controller.js";
import { ShowActivity } from "../utils/fn-monitor.js";
import { APP_STATE } from "./state-controller.js";
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";
import { _MeasureExecution } from "../utils/helpers.js";

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
export async function _getAPIResource(eventObj, resourceHost, resourcePath, { queryString }) {
	try {
		queryString = queryString ? queryString : (queryString = "");

		/**
		 * @function
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
			appActivityInd: GET_DOM_ELEMENTS().appActivityInd,
		};

		// Execute the API call inside a monitoring function
		const exeResult = await _MeasureExecution({ logger: console.log }).execute(
			callQueryAPI,
			options
		);

		return exeResult.returnedData;
	} catch (getAPIResourceErr) {
		console.error(`getAPIResourceErr: ${getAPIResourceErr.message}`);
	}
}

/**
	This function downloads and saves parcelized cluster data from a remote API. 
	The function loops through each resource path defined in DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTERS_RESOURCE_PATHS 
	and performs an API call for each resource path using queryAPI.call function. 
	The execution time of each API call is monitored and recorded using the _MeasureExecution object. 
	If the API call returns data, it is saved using the APP_STATE.cacheDBCollection function. 
	The function returns true on success or false if there is an error during the process.
 */
export async function _downloadAndSaveParcelizedClusters(eventObj) {
	try {
		// constants
		const apiHost = DEFAULT_APP_SETTINGS.GEOCLUSTERS_API_HOST;
		const resourcePaths = DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTERS_RESOURCE_PATHS;

		// loop thru. each resource path
		for (const resourcePath of resourcePaths) {
			// const dbQueryStr = DEFAULT_APP_SETTINGS.LEGACY_CLUSTER_QUERY_STR;

			// Create a pipeline function for the API call
			const callQueryAPI = function () {
				return queryAPI.call(eventObj, window.fetch, apiHost, resourcePath, {});
			};

			/**
			 * @constant
			 * @description An object containing options for display functions and activity indicators.
			 */
			const options = {
				startDisplayFn: ShowActivity.activityStart,
				endDisplayFn: ShowActivity.activityEnd,
				appActivityIndWrapper: GET_DOM_ELEMENTS().appActivityIndWrapper,
				appActivityInd: GET_DOM_ELEMENTS().appActivityInd,
			};

			// Execute the API call inside a monitoring function
			const exeResult = await _MeasureExecution({ logger: console.log }).execute(
				callQueryAPI,
				options
			);

			// get the resource name from the resource path
			const dbCollectionName = resourcePath.slice(resourcePath.indexOf("/") + 1);

			// Save the returned data			
			if (exeResult.returnedData) {
				APP_STATE.cacheDBCollection(dbCollectionName, exeResult.returnedData);
			}
		}

		return true;
	} catch (downloadParcelizedClustersErr) {
		console.error(`downloadParcelizedClustersErr: ${downloadParcelizedClustersErr}`);
		return false;
	}
}

// REMOVE > DEPRECATED
export async function APIHTTPRequest(queryString) {
	console.log(`%c ${JSON.stringify(queryString)}`, `background-color: yellow`);

	try {
		const resultsCountDiv = document.getElementById("results_count");
		const resultsStatus = document.getElementById("results_status");

		const appActivityIndWrapper = document.querySelector(`.app-activity-indicator-wrapper`);
		const appActivityInd = document.querySelector(`.app-activity-indicator`);

		console.log(`this.id [ ${this.id} ] sending http request to API`);
		resultsCountDiv.innerHTML = ``;
		resultsStatus.classList.add(`spinner-grow`);
		resultsStatus.classList.add(`text-primary`);
		resultsStatus.classList.add(`spinner-grow-sm`);

		appActivityIndWrapper.classList.add(`reveal`);
		appActivityInd.innerHTML = ``;
		appActivityInd.classList.add(`spinner-grow`);
		appActivityInd.classList.add(`text-light`);
		appActivityInd.classList.add(`spinner-grow-sm`);

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
				appActivityInd.classList.remove(`spinner-grow`);
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
