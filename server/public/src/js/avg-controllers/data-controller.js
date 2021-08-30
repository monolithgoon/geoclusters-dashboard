`use strict`
import { GET_DOM_ELEMENTS } from "../utils/dom-elements.js";
import { _ManipulateDOM } from "./ui-controller.js";
import { _MonitorExecution } from "../controllers/fn-monitor.js";
import { APP_STATE } from "./state-controller.js";


export function _retreiveClusterGJDatasets() {

	try {
		
		const geoClusters = JSON.parse(_ManipulateDOM.getDataset(GET_DOM_ELEMENTS().geoClustersDatasetEl));
						
		return {
			geoClusters,
		};

	} catch (retreiveGJErr) {
		console.error(`retreiveGJErr: ${retreiveGJErr.message}`);
	};
};


async function queryAPI(fetch, apiHost, apiResourcePath, {queryString=``}) {

	// console.log(`%c ${this.currentTarget} is getting latest data from API`, `background-color: lightgrey; color: blue;`);

	try {
		
		const apiResponse = await fetch(`${apiHost}/api/${apiResourcePath}/${queryString}`);
		const data = await apiResponse.json();

		if (!data) { throw new Error(`Endpoint did not respond; check your connection`); }

		// FIXME > ERR. HANDLING NOT COMPLETELY TESTED
		// if (checkStatus(data.status)) {
		if (data.status !== `fail`) {
			return data;
		} else { 
			throw new Error(`API Request Failed. ${JSON.stringify(data)}`);
		};
	}
	catch (queryAPIErr) {
		console.error(`queryAPIErr: ${queryAPIErr.message}`);
		return null;
	};
};


export async function _getAPIResource(eventObj, resourceHost, resourcePath) {

	try {

		// for (const resourcePath of APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS) {

			const apiDataQuery = function() {

				console.log(document.domain);

					return queryAPI.call(eventObj, window.fetch, 
						resourceHost, 
						resourcePath, 
						{});
			};

			// EXECUTE THE API CALL
			await _MonitorExecution.execute(apiDataQuery);

			_MonitorExecution.getExecutionTime();
			
			return _MonitorExecution.getData();
		// };

	} catch (getAdminBoundsErr) {
			console.error(`getAPIResourceErr: ${getAdminBoundsErr.message}`)
		};
};


// FIXME > MAKE THIS A GENERIC FUNCTION THAT ONLY RETURNS DATA FROM THE API AND NOTHING MORE
// DOWNLOAD & SAVE DB. COLLECTIONS
export async function _downloadDBCollections(eventObj) {

   try {
      
      for (const geoClusterResourcePath of APP_STATE.CONFIG_DEFAULTS.GEO_CLUSTER_API_RESOURCE_PATHS) {
         
         // const dbQueryStr = APP_STATE.CONFIG_DEFAULTS.LEGACY_CLUSTER_QUERY_STR;
         
         // create an intermediate "pipeline"?? fn.
         const apiDataQuery = function() {

            console.log(document.domain);

            return queryAPI.call(eventObj, window.fetch, 
					APP_STATE.CONFIG_DEFAULTS.GEO_CLUSTER_API_HOST_HEROKU, 
					geoClusterResourcePath, 
					{});
         };
   
         // EXECUTE THE API CALL
         await _MonitorExecution.execute(apiDataQuery);

         _MonitorExecution.getExecutionTime();
         
         // get the resource name
         const dbCollectionName = geoClusterResourcePath.slice(geoClusterResourcePath.indexOf('/')+1);
         
         // SAVE THE RETURNED DATA
         APP_STATE.saveDBCollection(dbCollectionName, _MonitorExecution.getData());

         // console.info(_MonitorExecution.getData());

         console.log(...APP_STATE.returnDBCollections());
      };

   } catch (getDBCollErr) {
      console.error(`getDBCollErr: ${getDBCollErr}`);
   };
};


// REMOVE > DEPRC.
export async function APIHTTPRequest(queryString) {

	console.log(`%c ${JSON.stringify(queryString)}`, `background-color: yellow`);

	try {
		
		const resultsCountDiv = document.getElementById('results_count');
		const resultsStatus = document.getElementById('results_status');

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
		const url = `https://geoclusters.herokuapp.com/api/v2/legacy-agcs/${queryString}`
	
		xhttp.open('GET', url, true);
		xhttp.setRequestHeader('Content-type', 'application/json');
		xhttp.send();
		
		xhttp.onreadystatechange = function () {
	
			const reqLogStyle = `color:white; background-color:green;`
			if (this.readyState === 0) { console.log(`req not initialized`);}
			if (this.readyState === 1) { console.log(`server connection established`);}
			if (this.readyState === 2) { console.log(`request received`);}
			if (this.readyState === 3) { console.log(`processing request`);}
			if (this.readyState === 4) { console.log(`%c request finished and response is ready`, `${reqLogStyle}`);}
			
			if (this.readyState === 4 && this.status === 200) {
				// console.log(this.responseText)
				resultsStatus.classList.remove(`spinner-grow`);
				resultsCountDiv.innerText = `${JSON.parse(this.responseText).num_legacy_agcs} Clusters ... ${JSON.parse(this.responseText).num_plot_owners} Plot Owners`

				appActivityIndWrapper.classList.remove(`reveal`);
				appActivityInd.classList.remove(`spinner-grow`);
			};
		};
	
		xhttp.onload = function() {
			const parsedAPIData = JSON.parse(this.responseText);
			console.log(parsedAPIData.requested_at);
			console.log(parsedAPIData.num_legacy_agcs);
			console.log(parsedAPIData.num_plot_owners);
			console.log(parsedAPIData.legacy_agcs);
		};

		return {
			xhttp,
		}

	} catch (APIRequestErr) {
		console.error(`APIRequestErr: ${APIRequestErr}`)
	};
};