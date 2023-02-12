/**
 * THIS IS THE MAIN ENTRY POINT TO THE "AVG-DASHBOARD" APP AFTER LANDING PAGE LOGIN
 *
 * THE FOLLOWING TOP-LEVEL FUNCTIONS RUN ONCE THIS FILE EXECUTES:
 *
 * 1. cachePreloadedGeoClusters -
 * The html for the dashboard is generated with PUG from the server-side;
 * It contains a pre-fetched set of geoclusters loaded into a "geoClusters" variable via server/controllers/view-controller.js
 * This variale is passed to the front-end via a dataset called "geoclusters" with HTML id = geo_clusters_dataset
 * The above function caches the "geoclusters" data in the APP_STATE, which makes it available throughout the app
 *
 * 2. renderCachedGeoClusters - DISPLAYS CLUSTER BUBBLES ON THE MAIN MAP OF THE GEOCLUSTERS RETREIVED FROM THE GEOCLUSTERS API
 *
 * 3. renderAdminBounds - RENDERS GEOJSON POLYGON ADMIN BOUNDS FOR THE GEO-POL REGIONS OF NIGERIA
 *
 * 4. fireAutoUpdateWorker - updateCachedGeoClusters
 */

`use strict`;
import {
	_downloadAndSaveParcelizedClusters,
	_retreiveClusterGJDatasets,
	_getAPIResource,
} from "./avg-controllers/data-controller.js";
import { _Arrays, _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues, _PopulateDOM } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _RenderEngine } from "./avg-controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/get-dom-elements.js";
import DURATION from "./constants/duration.js";
import { logout } from "./controllers/login-controller.js";
import DEFAULT_APP_SETTINGS from "./constants/default-app-settings.js";
import _openFullScreen from "./utils/open-full-screen.js";

const initDashboardApp = (() => {
	/**
	 * Renders the geo-political regions on the Leaflet base map.
	 *
	 * @param {String} resourceName - The name of the resource to be rendered.
	 * @param {Object} featColl - The feature collection to be rendered.
	 *
	 */
	function renderGeoPolRegions(resourceName, featColl) {
		if (resourceName === `nga-geo-pol-regions` && featColl) {
			_RenderEngine.renderFeatColl(featColl, {
				useBuffer: false,
				lineColor: DEFAULT_APP_SETTINGS.MAP_POLYGON_LINE_COLORS.BASEMAP.GEO_POL_REGIONS, // faded green
				lineWeight: DEFAULT_APP_SETTINGS.MAP_POLYGON_LINE_WEIGHTS.BASEMAP.GEO_POL_REGIONS,
			});
		}
	}

	/**
	 * Renders the clusters collection on the Leaflet centerfold basemap.
	 *
	 * @param {Array} featCollArray - An array of feature collections to be rendered on the base map.
	 *
	 * @async
	 */
	async function renderClustersCollection(featCollArray) {
		if (featCollArray && featCollArray.length > 0) {
			await _RenderEngine.populateClustersOnBasemap(featCollArray, {
				useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
				bufferUnits: _pollAVGSettingsValues().distanceUnits,
				bufferAmt: DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_PLOTS_BUFFER,
			});
		}
	}

	/**
	 * Function to get newly parcelized GeoClusters from the database.
	 *
	 * It does this by downloading fresh parcelized GeoCluster metadata from the database and saving it to the application state.
	 * It then compares the GeoCluster metadata that is already in the app cache with the current metadata in the database.
	 * The function returns an array of new GeoClusters for which the GeoJSON has not been downloaded yet.
	 * If the function is successful, it returns the array of new GeoClusters.
	 * If it is not successful, it returns an empty array.
	 *
	 * @function
	 * @async
	 * @param {Object} window - A reference to the window object.
	 * @returns {Array} An array of GeoJSON objects representing the newly parcelized GeoClusters. An empty array is returned if there are no new GeoClusters or if the function fails.
	 */
	const getNewlyParcelizedClusters = async (window) => {
		// Download the latest GeoCluster metadata from the database and save it to the app state
		const response = await _downloadAndSaveParcelizedClusters(window);

		// Return empty [] if _downloadAndSaveParcelizedClusters fails
		if (!response) return [];

		// Array to store the IDs of the new GeoClusters
		let newGeoClusterIds = [];

		// Array to store the GeoJSON data of the new GeoClusters
		let newGeoClusters = [];

		// Get all the pre-loaded clusters stored in the app cache
		const cachedGeoClusters = _TraverseObject.evaluateValue(
			APP_STATE.returnCachedDBCollection("cached-geo-clusters"),
			"data"
		);

		// Get the IDs for all the clusters in the app cache
		const cachedGeoClusterIds = [];
		for (let idx = 0; idx < cachedGeoClusters.length; idx++) {
			let cachedClusterId = cachedGeoClusters[idx].properties.clusterID;
			if (cachedClusterId) {
				cachedClusterId = cachedClusterId.toLowerCase();
				cachedGeoClusterIds.push(cachedClusterId);
			}
		}

		// Get the metadata for all the live clusters currently in the database
		const liveParcelizedClustersMetadata = _TraverseObject.evaluateValue(
			APP_STATE.returnCachedDBCollection("v1/parcelized-agcs/metadata"),
			"data"
		);

		// Extract the IDs for all the live clusters from the metadata
		let liveParcelizedClusterIds = [];
		if (liveParcelizedClustersMetadata && liveParcelizedClustersMetadata.data) {
			liveParcelizedClusterIds.push(
				...liveParcelizedClustersMetadata.data.collection_metadata.ids
			);
		}

		// REMOVE
		console.log({ cachedGeoClusterIds });
		console.log({ liveParcelizedClusterIds });

		// Compare the arrays of IDs and retrieve the GeoJSON data for the new cluster IDs
		if (liveParcelizedClusterIds.length > 0) {
			newGeoClusterIds = _Arrays.containsAllChk(
				cachedGeoClusterIds,
				liveParcelizedClusterIds
			).missingElements;
		}

		// If there are new GeoCluster IDs, download the GeoJSON data for them
		if (newGeoClusterIds.length > 0) {
			for (let idx = 0; idx < newGeoClusterIds.length; idx++) {
				const newGeoClusterId = newGeoClusterIds[idx];
				const resourcePath = `${DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_API_RESOURCE_PATH}`;
				const queryString = `?${newGeoClusterId}`;
				const apiHost = DEFAULT_APP_SETTINGS.GEOCLUSTERS_API_HOST;
				// Get the API response for the new GeoCluster GeoJSON data
				const APIResponse = await _getAPIResource(window, apiHost, resourcePath, {
					queryString,
				});
				let newGeoClusterGeoJSON = null;
				if (APIResponse) {
					if (APIResponse.status === "success") {
						if (APIResponse.data) {
							newGeoClusterGeoJSON = APIResponse.data.parcelizedAgcData;
							console.log({ newGeoClusterGeoJSON });
							newGeoClusters.push(newGeoClusterGeoJSON);
						}
					}
				}
			}
		}

		return newGeoClusters.length > 0 ? newGeoClusters : [];
	};

	// The code implements a function that updates a cached collection of geo-clusters stored in the APP_STATE.
	const updateCachedGeoClusters = (collectionName, featCollArr) => {
		// Retrieve the cached geo-cluster collection
		const geoClustersArr = _TraverseObject.evaluateValue(
			APP_STATE.returnCachedDBCollection(collectionName),
			"data"
		);

		// add new data
		for (const featColl of featCollArr) {
			if (featColl.properties.clusterID) geoClustersArr.push(...featColl);
		}

		// delete it from the collections array
		APP_STATE.deleteCachedDBCollection(collectionName);

		// re-insert the updated version
		APP_STATE.cacheDBCollection(collectionName, geoClustersArr);
	};

	// TODO > WIP > RENDER NEWLY PARCELIZED CLUSTERS
	// RENDER NEW GEOCLUSTERS ADDED TO THE DB.
	const renderLiveGeoClusters = async (featCollArr) => {
		(function renderLiveGeoClusters() {
			const legacyClustersColl = _TraverseObject.evaluateValue(
				APP_STATE.returnCachedDBCollection("v1/legacy-agcs"),
				"data"
			);

			console.log({ legacyClustersColl });

			if (legacyClustersColl) {
				_PopulateDOM.clusterResultsSidebar({ dbCollection: legacyClustersColl });

				const currentClusterTitleDivs = document.querySelectorAll(`.result-item-title`);

				if (currentClusterTitleDivs.length > GET_DOM_ELEMENTS().clusterTitleDivs.length) {
					// ADD CLICK HAND. FOR NEW RESULTS THAT ARRIVE AFTER INITIAL DOM LOAD
					clusterTitleClickHandler(currentClusterTitleDivs);
				}
			}
		})();
	};

	return {
		// THIS APP'S BACKEND COMBINES BOTH NEWLY PARCELIZED AND LEGACY CLUSTERS INTO A VARIABLE CALLED "geoClusters"
		// THIS VARIABLE WAS SENT TO THE DOM VIA server/controllers/view-controller.js,
		// IT WAS "STORED" IN A DOM ELEMENT WITH DATASET ATTRIBUTE = "geoclusters" WITH ID = "geo_clusters_dataset"
		// THIS FUNCTION STORES THAT DATA IN THE FRONT-END "APP_STATE" OBJECT
		cachePreloadedGeoClusters: async () => {
			const { geoClusters } = _retreiveClusterGJDatasets();

			APP_STATE.cacheDBCollection(`cached-geo-clusters`, [...geoClusters]);
		},

		renderCachedGeoClusters: async () => {
			// GET THE CACHED GEOCLUSTERS DATA FROM APP_STATE
			const geoClustersArr = _TraverseObject.evaluateValue(
				APP_STATE.returnCachedDBCollection("cached-geo-clusters"),
				"data"
			);

			// RENDER ON MAP
			await renderClustersCollection(geoClustersArr);
		},

		/**
		 * This function is used to render administrative boundaries on the map.
		 * @param {Window} window - The global window object.
		 */
		renderAdminBounds: async (window) => {
			// The default API host URL for the administrative boundaries GeoJSON data
			const apiHost = DEFAULT_APP_SETTINGS.ADMIN_BOUNDS_GEOJSON_API_HOST;

			// An array of resource paths for the administrative boundaries GeoJSON data
			const adminBoundsAPIResourcePaths =
				DEFAULT_APP_SETTINGS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS;

			for (const adminBoundsResourcePath of adminBoundsAPIResourcePaths) {
				// Get the resource name by slicing the resource path after the "/nga" string
				const resourceName = adminBoundsResourcePath.slice(
					adminBoundsResourcePath.indexOf("/nga") + 1
				);

				console.log({ resourceName });

				// Get the administrative boundaries resource data from the API
				const adminBoundsResource = await _getAPIResource(
					window,
					apiHost,
					adminBoundsResourcePath,
					{}
				);

				// console.log({ adminBoundsResource });

				if (adminBoundsResource && adminBoundsResource.data) {
					// Save the resource data to the APP_STATE cache database collection
					APP_STATE.cacheDBCollection(resourceName, adminBoundsResource.data);

					// Render the administrative boundaries on the map
					renderGeoPolRegions(resourceName, adminBoundsResource.data);
				}
			}
		},

		// // NESTED, RECURSIVE setTimeouts THAT LOOPS INDEFINITELY @ PRE-SET INTERVALS
		// fireAutoUpdateWorker: async (window) => {

		// 	let initDelay = DURATION.GEOCLUSTERS_DATA_QUERY_INTERVAL;

		// 	let intervalDelay = initDelay;

		// 	setTimeout(async function request() {

		// 		// get the new geo clusters from the data source
		// 		const newGeoClustersArr = await getNewlyParcelizedClusters(window);

		// 		// if there ARE new geo clusters
		// 		if (newGeoClustersArr && newGeoClustersArr.length > 0) {
		// 			// reset the interval delay when new geoclusters are found
		// 			intervalDelay = initDelay;

		// 			// SAVE THE NEWLY RETREIVED GEOJSON TO APP_STATE OBJECT / CACHE
		// 			updateCachedGeoClusters("cached-geo-clusters", newGeoClustersArr);

		// 			// RENDER THE NEW CLUSTERS
		// 			// FIXME > WIP > NOT YET IMPLEMENTED
		// 			await renderLiveGeoClusters(newGeoClustersArr);
		// 		}

		// 		// PROGRESSIVELY INCREASE THE INTERVAL IF NO NEW CLUSTERS ARE BEING FOUND..

		// 		// if there are no new geo clusters
		// 		if (newGeoClustersArr && newGeoClustersArr.length === 0) {
		// 			// increment the interval delay
		// 			intervalDelay += DURATION.DATA_QUERY_INCREMENT;
		// 		}

		// 		// DOUBLE THE INTERVAL BETWEEN setTimeouts IF 1ST CALL FAILED TO EXECUTE COMPLTELY..

		// 		// if the request failed to complete
		// 		if (!newGeoClustersArr) {
		// 			// double the interval delay
		// 			intervalDelay *= 2;
		// 		}

		// 		// console.log({ intervalDelay });

		// 		// RECURSIVE LOOP
		// 		setTimeout(request, intervalDelay);
		// 	}, intervalDelay);
		// },

		/**
		 * @description Function to initiate an indefinitely recursive setTimeout loop with pre-set intervals
		 * @function fireAutoUpdateWorker
		 * @async
		 * @param {Object} window - The window object passed in as argument
		 */
		fireAutoUpdateWorker: async (window) => {

			// The initial delay for the setTimeout function
			let initDelay = DURATION.GEOCLUSTERS_DATA_QUERY_INTERVAL;

			// The interval delay that will be updated
			let intervalDelay = initDelay;

			setTimeout(async function request() {

				// Get the new geo clusters from the data source
				const newGeoClustersArr = await getNewlyParcelizedClusters(window);

				if (newGeoClustersArr && newGeoClustersArr.length > 0) {

					// Reset the interval delay to the initial delay
					intervalDelay = initDelay;

					// Save the newly retrieved geoJSON to the app_state object / cache
					updateCachedGeoClusters("cached-geo-clusters", newGeoClustersArr);

					// Render the new clusters
					// FIXME > WIP > NOT YET IMPLEMENTED
					await renderLiveGeoClusters(newGeoClustersArr);
				}

				// If there are no new geo clusters, increment the interval delay
				if (newGeoClustersArr && newGeoClustersArr.length === 0) {
					intervalDelay += DURATION.DATA_QUERY_INCREMENT;
				}

				// If the request failed to complete, double the interval delay
				if (!newGeoClustersArr) {
					intervalDelay *= 2;
				}

				// Recursively loop the setTimeout function with the updated interval delay
				setTimeout(request, intervalDelay);
			}, intervalDelay);
		},

		//
		addDOMListeners: () => {
			// logout btn. listener
			GET_DOM_ELEMENTS().logoutBtn.addEventListener("click", logout);

			//- Click anywhere on page fo fullscreen
			// document.addEventListener('click', _openFullScreen);
		},
	};
})();

// RUN DASHBOARD APP STARTUP FUNCTIONS
(() => {
	window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
		// save the default UI settings into the APP_STATE object
		APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

		initDashboardApp.addDOMListeners();

		await initDashboardApp.cachePreloadedGeoClusters();

		await initDashboardApp.renderCachedGeoClusters();

		// await initDashboardApp.renderAdminBounds(windowObj);

		await initDashboardApp.fireAutoUpdateWorker(windowObj);
	});
})();

// REMOVE > DEPRECATED
(() => {
	window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
		// SANDBOX
		//    document.body.addEventListener('click', e => {
		//       if (e.target.matches("[data-bs-target]")) {
		//          console.log('client side routed')
		//          e.preventDefault();
		//          _navigateTo(e.target.href);
		//       }
		//    });
		// SANDBOX
		//    // init. the client side router
		//    _clientSideRouter();
	});
})();
