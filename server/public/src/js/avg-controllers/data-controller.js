`use strict`;
import { GET_DOM_ELEMENTS } from "../utils/get-dom-elements.js";
import { _ManipulateDOM } from "./ui-controller.js";
import { _MonitorExecution } from "../controllers/fn-monitor.js";
import { APP_STATE } from "./state-controller.js";

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

async function queryAPI(fetch, apiHost, apiResourcePath, { queryString }) {
	queryString = queryString ? queryString : (queryString = "");

	console.log(
		`%c ${this.target} is getting latest data from API`,
		`background-color: lightgrey; color: blue;`
	);

	try {
		const apiResponse = await fetch(`${apiHost}/${apiResourcePath}/${queryString}`);
		const data = await apiResponse.json();

		if (!data) {
			throw new Error(`Endpoint did not respond; check your connection`);
		}

		// FIXME > ERR. HANDLING NOT COMPLETELY TESTED
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

export async function _getAPIResource(eventObj, resourceHost, resourcePath, { queryString }) {
	try {
		queryString = queryString ? queryString : (queryString = "");

		const apiDataQuery = function () {
			console.log(document.domain);

			return queryAPI.call(eventObj, window.fetch, resourceHost, resourcePath, { queryString });
		};

		// EXECUTE THE API CALL
		await _MonitorExecution.execute(apiDataQuery);

		// GET MEASURE OF HOW LONG IT TOOK
		_MonitorExecution.getExecutionTime();

		return _MonitorExecution.getData();
	} catch (getAPIResourceErr) {
		console.error(`getAPIResourceErr: ${getAPIResourceErr.message}`);
	}
}

/**
	This function downloads and saves parcelized cluster data from a remote API. 
	The function loops through each resource path defined in APP_STATE.CONFIG_DEFAULTS.PARCELIZED_CLUSTERS_RESOURCE_PATHS 
	and performs an API call for each resource path using queryAPI.call function. 
	The execution time of each API call is monitored and recorded using the _MonitorExecution object. 
	If the API call returns data, it is saved using the APP_STATE.cacheDBCollection function. 
	The function returns true on success or false if there is an error during the process.
 */
export async function _downloadAndSaveParcelizedClusters(eventObj) {
	try {
		// constants
		const apiHost = APP_STATE.CONFIG_DEFAULTS.GEOCLUSTERS_API_HOST;
		const resourcePaths = APP_STATE.CONFIG_DEFAULTS.PARCELIZED_CLUSTERS_RESOURCE_PATHS;

		// loop thru. each resource path
		for (const resourcePath of resourcePaths) {
			// const dbQueryStr = APP_STATE.CONFIG_DEFAULTS.LEGACY_CLUSTER_QUERY_STR;

			// Create a pipeline function for the API call
			const apiDataQuery = function () {
				return queryAPI.call(eventObj, window.fetch, apiHost, resourcePath, {});
			};

			// execute the API call
			await _MonitorExecution.execute(apiDataQuery);

			// get the execution time
			_MonitorExecution.getExecutionTime();

			// get the resource name from the resource path
			const dbCollectionName = resourcePath.slice(resourcePath.indexOf("/") + 1);

			// SAVE THE RETURNED DATA
			if (_MonitorExecution.getData())
				APP_STATE.cacheDBCollection(dbCollectionName, _MonitorExecution.getData());

			// console.log(...APP_STATE.returnCachedDBCollections());
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
