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
import { _RenderEngine } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/get-dom-elements.js";
import DURATION from "./constants/duration.js";
import { logout } from "./controllers/user-login.js";

const initDashboardApp = (() => {

	// 
	function renderGeoPolRegions(resourceName, featColl) {
		if (resourceName === `nga-geo-pol-regions` && featColl) {
			_RenderEngine.renderFeatColl(featColl, {
				useBuffer: false,
				lineColor: "#BDC581",
				lineWeight: 1.5,
			});
		}
	}

	// 
	async function renderClustersCollection(featCollArray) {
		if (featCollArray && featCollArray.length > 0) {
			// RENDER CLUSTERS' DATA ON BASE MAP
			await _RenderEngine.populateClustersOnBasemap(featCollArray, {
				useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
				bufferUnits: _pollAVGSettingsValues().distanceUnits,
				bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
			});
		}
	}

	// This function retrieves newly parcelized geoClusters' metadata from a database.
	// It does this by downloading fresh parcelized GeoCluster metadata from the database and saving it to the application state.
	// It then compares the GeoCluster metadata that is already in the app cache with the current metadata in the database.
	// The function returns an array of new GeoClusters for which the GeoJSON has not been downloaded yet.
	// If the function is successful, it returns the array of new GeoClusters.
	// If it is not successful, it returns an empty array.

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
				const resourcePath = `${APP_STATE.CONFIG_DEFAULTS.PARCELIZED_CLUSTER_API_RESOURCE_PATH}`;
				const queryString = `?${newGeoClusterId}`;
				const apiHost = APP_STATE.CONFIG_DEFAULTS.GEOCLUSTERS_API_HOST;
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

		// GET & RENDER ADMIN BOUNDS GEOJSON
		renderAdminBounds: async (window) => {
			const apiHost = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_HOST;
			const adminBoundsAPIResourcePaths =
				APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS;

			for (const adminBoundsResourcePath of adminBoundsAPIResourcePaths) {
				// get the resource name
				const resourceName = adminBoundsResourcePath.slice(
					adminBoundsResourcePath.indexOf("/nga") + 1
				);
				console.log({ resourceName });

				// get the resource
				const adminBoundsResource = await _getAPIResource(
					window,
					apiHost,
					adminBoundsResourcePath,
					{}
				);
				console.log({ adminBoundsResource });

				if (adminBoundsResource && adminBoundsResource.data) {
					// SAVE THE RETURNED DATA
					APP_STATE.cacheDBCollection(resourceName, adminBoundsResource.data);

					// RENDER ON MAP
					renderGeoPolRegions(resourceName, adminBoundsResource.data);
				}
			}
		},

		// NESTED, RECURSIVE setTimeouts THAT LOOPS INDEFINITELY @ PRE-SET INTERVALS
		fireAutoUpdateWorker: async (window) => {

			let initDelay = DURATION.GEOCLUSTERS_DATA_QUERY_INTERVAL;

			let intervalDelay = initDelay;

			setTimeout(async function request() {
				// get the new geo clusters from the data source
				const newGeoClustersArr = await getNewlyParcelizedClusters(window);

				// if there ARE new geo clusters
				if (newGeoClustersArr && newGeoClustersArr.length > 0) {
					// reset the interval delay when new geoclusters are found
					intervalDelay = initDelay;

					// SAVE THE NEWLY RETREIVED GEOJSON TO APP_STATE OBJECT / CACHE
					updateCachedGeoClusters("cached-geo-clusters", newGeoClustersArr);

					// RENDER THE NEW CLUSTERS
					// FIXME > WIP > NOT YET IMPLEMENTED
					await renderLiveGeoClusters(newGeoClustersArr);
				}

				// PROGRESSIVELY INCREASE THE INTERVAL IF NO NEW CLUSTERS ARE BEING FOUND..

				// if there are no new geo clusters
				if (newGeoClustersArr && newGeoClustersArr.length === 0) {
					// increment the interval delay
					intervalDelay += DURATION.DATA_QUERY_INCREMENT;
				}

				// DOUBLE THE INTERVAL BETWEEN setTimeouts IF 1ST CALL FAILED TO EXECUTE COMPLTELY..

				// if the request failed to complete
				if (!newGeoClustersArr) {
					// double the interval delay
					intervalDelay *= 2;
				}

				console.log({ intervalDelay });

				// RECURSIVE LOOP
				setTimeout(request, intervalDelay);
			}, intervalDelay);
		},

		// 
		addDOMListeners: () => {

			// logout btn. listener
			GET_DOM_ELEMENTS().logoutBtn.addEventListener("click", logout);
		}
	};
})();

(() => {
	window.addEventListener(`DOMContentLoaded`, async (windowObj) => {

		// save the default UI settings into the APP_STATE object
		APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

		initDashboardApp.addDOMListeners();

		await initDashboardApp.cachePreloadedGeoClusters();

		await initDashboardApp.renderCachedGeoClusters();

		await initDashboardApp.renderAdminBounds(windowObj);

		await initDashboardApp.fireAutoUpdateWorker(windowObj);
	});
})();

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
