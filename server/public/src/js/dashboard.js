/**
 * THIS IS THE MAIN ENTRY POINT TO THE "AVG-DASHBOARD" APP AFTER LANDING PAGE LOGIN
 *
 * THE FOLLOWING TOP-LEVEL FUNCTIONS RUN ONCE THIS FILE EXECUTES:
 *
 * 1. cachePreLoadedGeoclusters -
 * The html for the dashboard is generated with PUG from the server-side;
 * It contains a pre-fetched set of geoclusters loaded into a "geoClusters" variable via server/controllers/view-controller.js
 * This variale is passed to the front-end via a dataset called "geoclusters" with HTML id = geo_clusters_dataset
 * The above function caches the "geoclusters" data in the APP_STATE, which makes it available throughout the app
 *
 * 2. renderPreLoadedGeoclusters - DISPLAYS CLUSTER BUBBLES ON THE MAIN MAP OF THE GEOCLUSTERS RETREIVED FROM THE GEOCLUSTERS API
 *
 * 3. renderCachedAdminBounds - RENDERS GEOJSON POLYGON ADMIN BOUNDS FOR THE GEO-POL REGIONS OF NIGERIA
 *
 * 4. fireAutoUpdateWorker - updateCachedGeoClusters
 */

`use strict`;
import {
	_retreiveClusterGJDatasets,
	_getAPIResource,
	_ParcelizedClustersController,
} from "./avg-controllers/data-controller.js";
import { _Arrays, _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues, _PopulateDOM } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _RenderEngine } from "./avg-controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/get-dom-elements.js";
import INTERVALS from "./constants/intervals.js";
import { logout } from "./controllers/login-controller.js";
import DEFAULT_APP_SETTINGS from "./constants/default-app-settings.js";
import _openFullScreen from "./utils/open-full-screen.js";
import DESCRIPTORS from "./constants/descriptors.js";


const InitDashboardApp = (() => {
	
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
	 * @function renderClustersCollection
	 * @description Renders the clusters collection on the Leaflet centerfold basemap.
	 * @param {Array} featCollArray - An array of feature collections to be rendered on the base map.
	 * @async
	 */
	const renderClustersCollection = async (featCollArray) => {
		if (featCollArray && featCollArray.length > 0) {
			await _RenderEngine.populateClustersOnBasemap(featCollArray, {
				useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
				bufferUnits: _pollAVGSettingsValues().distanceUnits,
				bufferAmt: DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_PLOTS_BUFFER,
			});
		}
	};

	// FIXME > BAD IMPLEMENTATION
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

	// FIXME > BAD IMPLEMENTATION
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
		
		/**
		 * This app's backend combines both newly parcelized and legacy clusters into a variable called "geoClusters".
		 * This variable was sent to the DOM via `server/controllers/view-controller.js` and stored in a DOM
		 * element with dataset attribute `geoclusters` and ID `geo_clusters_dataset`. This function retrieves
		 * the `geoClusters` data from the DOM and stores it in the front-end `APP_STATE` object.
		 */

		/**
		 * @function cachePreLoadedGeoclusters
		 * @description Stores the pre-loaded geoclusters data in the front-end "APP_STATE" object.
		 * @async
		 */		
		cachePreLoadedGeoclusters: async () => {
			// Retrieve the pre-loaded geoclusters data from the cluster GJ datasets.
			const { geoClusters } = _retreiveClusterGJDatasets();
		
			// Cache the pre-loaded geoclusters data in the app state object.
			APP_STATE.cacheDBCollection(DESCRIPTORS.PRE_LOADED_GEOCLUSTERS_CACHE_NAME, [...geoClusters]);
		},
		
		/**
		 * @function renderPreLoadedGeoclusters
		 * @description Renders the pre-loaded geoclusters on the centerfold basemap.
		 * @async
		 */		
		renderPreLoadedGeoclusters: async () => {
			
			// Get the pre-loaded geoclusters data from the app state object / cache
			const preLoadedGeoclusters = _TraverseObject.evaluateValue(
				APP_STATE.returnCachedDBCollection(DESCRIPTORS.PRE_LOADED_GEOCLUSTERS_CACHE_NAME),
				"data"
			);

			console.log({preLoadedGeoclusters})

			// Render the pre-loaded geoclusters on the map.
			await renderClustersCollection(preLoadedGeoclusters);
		},

		/**
		 * @function renderCachedAdminBounds
		 * @description This function is used to render administrative boundaries on the map.
		 * @param {Window} window - The global window object.
		 */
		renderCachedAdminBounds: async (window) => {
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

		/**
		 * @function fireAutoUpdateWorker
		 * @description Function to initiate a recursive setTimeout loop with pre-set intervals. 
		 * The recursion will terminate when the updated setTimeout interval exceeds a pre-defined limit
		 * @async
		 * @param {Object} window - The window object passed in as argument
		 */
		fireAutoUpdateWorker: async (window) => {

			// Get the initial interval for the setTimeout function
			let initInterval = INTERVALS.BASE_DATA_QUERY_INTERVAL;

			// The interval variable that will be updated
			let updatedInterval = initInterval;

			setTimeout(async function request() {

				// EXIT IF THE INTERVALS EXCEED A LIMIT
				if(updatedInterval >= INTERVALS.AUTO_WORKER_INTERVAL_LIMIT) return;
				
				// Step-1
				// Cache entire parcelized-agcs db collection in APP_STATE; skip if it's been done before 
				await _ParcelizedClustersController.cacheLiveData(window, APP_STATE);

				// Step-2
				// Download new clusters
				const newClustersArr = await _ParcelizedClustersController.getNewClusters(
					window,
					APP_STATE
				);

				// Confirm if new clusters are available...
				if (newClustersArr && newClustersArr.length > 0) {
					
					// Step-3
					// Reset the interval delay to the initial delay
					updatedInterval = initInterval;
					
					// Step-4
					// ...cache them
					_ParcelizedClustersController.cacheNewClusters(newClustersArr, APP_STATE);					

					// Step-5
					// Save the newly retrieved geoJSON to the app_state object / cache
					// FIXME > BAD IMPLEMENTATION
					updateCachedGeoClusters(DESCRIPTORS.PRE_LOADED_GEOCLUSTERS_CACHE_NAME, newClustersArr);
					
					// Step-6
					// Add them to the clusters' sidebar
					// await addClustersToSidebar(newClustersArr)

					// Step-7
					// Render the new clusters
					// await addClustersToBasemap(newClustersArr)
					
					// TODO > MOVE TO OUTSIDE CONTEXT
					// FIXME > BAD IMPLEMENTATION
					await renderLiveGeoClusters(newClustersArr);
				}

				// If there are no new geo clusters, increment the interval delay
				if (newClustersArr && newClustersArr.length === 0) {
					console.log("Incrementing the auto-worker data query interval");
					updatedInterval += INTERVALS.AUTO_DATA_QUERY_INTERVAL_INCREMENT;
				}

				// If the request failed to complete, double the interval icrement
				if (!newClustersArr) {
					updatedInterval += INTERVALS.AUTO_DATA_QUERY_INTERVAL_INCREMENT*2;
				}

				console.log({updatedInterval})

				// Recursively loop the setTimeout function with the updated interval delay
				setTimeout(request, updatedInterval);
			}, updatedInterval);
		},

		//
		addDOMListeners: () => {
			// logout btn. listener
			const logoutBtn = GET_DOM_ELEMENTS().logoutBtn;
			if (logoutBtn) logoutBtn.addEventListener("click", logout);

			//- Click anywhere on page fo fullscreen
			// document.addEventListener('click', _openFullScreen);
		},
	};
})();

// Run dashboard app startup functions
(() => {
	window.addEventListener(`DOMContentLoaded`, async (windowObj) => {

		// save the default UI settings into the APP_STATE object
		APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

		InitDashboardApp.addDOMListeners();

		await InitDashboardApp.cachePreLoadedGeoclusters();

		await InitDashboardApp.renderPreLoadedGeoclusters();

		// TODO > split the caching and rendering ops.
		// await InitDashboardApp.cacheAdminBounds(windowObj);
		
		await InitDashboardApp.renderCachedAdminBounds(windowObj);

		// cache other (markets, roadways, waterways, city centers) geojson assets

		// render other geojson assets

		await InitDashboardApp.fireAutoUpdateWorker(windowObj);
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
