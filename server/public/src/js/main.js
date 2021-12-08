`use strict`;
import { _downloadGeoClusterCollections, _retreiveClusterGJDatasets, _getAPIResource } from "./avg-controllers/data-controller.js";
import { _Arrays, _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues, _PopulateDOM } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _RenderEngine } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/dom-elements.js";


const InitApp = (() => {

   // nothing here;
   function renderGeoPolRegions(resourceName, featColl) {
      if (resourceName === `nga-geo-pol-regions` && featColl) {
         _RenderEngine.renderFeatColl(featColl, {useBuffer: false, lineColor: "#BDC581", lineWeight: 1.5});
      };
   };

   async function renderClustersCollection (featCollArray) {
      if (featCollArray && featCollArray.length > 0) { 
         // RENDER CLUSTERS' DATA ON BASE MAP
         await _RenderEngine.populateClustersOnBasemap(featCollArray, {
            useBuffer: _pollAVGSettingsValues().bufferFeatsChk ,
            bufferUnits: _pollAVGSettingsValues().distanceUnits,
            bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
         });
      };
   };

   const getNewGeoClusters = async (window) => {

      // DOWNLOAD FRESH GEOCLUSTER METADATA FROM THE DB && SAVE TO APP STATE;
      if (await _downloadGeoClusterCollections(window)) {

         let newGeoClusterIds = [], newGeoClusters = [];

         // GET ALL PRE-LOADED CLUSTERS IN APP CACHE
         const cachedGeoClusters = _TraverseObject.evaluateValue(APP_STATE.returnCachedDBCollection("cached-geo-clusters"), "data");
         
         // GET IDS FOR ALL CLUSTERS IN APP CACHE
         const cachedGeoClusterIds = [];

         for (let idx = 0; idx < cachedGeoClusters.length; idx++) {
            let cachedClusterId = cachedGeoClusters[idx].properties.clusterID;
            if (cachedClusterId) {
               cachedClusterId = cachedClusterId.toLowerCase();
               cachedGeoClusterIds.push(cachedClusterId);
            };
         };

         // GET ALL CLUSTERS CURR. IN DB
         const dbParcelizedClustersMetadata = _TraverseObject.evaluateValue(APP_STATE.returnCachedDBCollection("v1/parcelized-agcs/metadata"), "data");

         // GET IDS FOR ALL CLUSTERS CURR. IN DB
         let dbGeoClusterIds = [];

         if (dbParcelizedClustersMetadata && dbParcelizedClustersMetadata.data) {
            
            dbGeoClusterIds.push(...dbParcelizedClustersMetadata.data.collection_metadata.ids);
            
            // REMOVE
            // dbGeoClusterIds.push("ASB00123OSH");
            // dbGeoClusterIds.push("AGCABI000010");
         };

         // REMOVE
         console.log({cachedGeoClusterIds})
         console.log({dbGeoClusterIds})

         // COMPARE BOTH ARRAYS OF IDS; RETREIVE GEOJSON FOR NEW CLUSTER IDS
         if (dbGeoClusterIds.length > 0) {
            
            newGeoClusterIds = _Arrays.containsAllChk(cachedGeoClusterIds, dbGeoClusterIds).missingElements;

            console.log({newGeoClusterIds});
         };

         if (newGeoClusterIds.length > 0) {

            console.warn(`DOWNLOADING GEOJSON FOR NEW CLUSTERS`)

            for (let idx = 0; idx < newGeoClusterIds.length; idx++) {
               const newGeoClusterId = newGeoClusterIds[idx];
               const resourcePath = `${APP_STATE.CONFIG_DEFAULTS.PARCELIZED_CLUSTER_API_RESOURCE_PATH}`
               const queryString = `?${newGeoClusterId}`;
               const apiHost = APP_STATE.CONFIG_DEFAULTS.GEO_CLUSTER_API_HOST;
               const APIResponse = await _getAPIResource(window, apiHost, resourcePath, {queryString})
               let newGeoClusterGeoJSON = null;
               if (APIResponse) {
                  if (APIResponse.status === "success") {
                     if (APIResponse.data) {
                        newGeoClusterGeoJSON = APIResponse.data.parcelizedAgcData;
                        console.log({newGeoClusterGeoJSON})
                        newGeoClusters.push(newGeoClusterGeoJSON);
                     };
                  }
               }
            };
         };

         return newGeoClusters.length > 0 ? newGeoClusters : [];
      };

      // RETURN NULL IF _downloadGeoClusterCollections FAILS
      return null;
   };

   const updateCachedGeoClusters = (collectionName, featCollArr) => {
      // get the cached collection
      const geoClustersArr = _TraverseObject.evaluateValue(APP_STATE.returnCachedDBCollection(collectionName), "data");
      // add new data
      for (const featColl of featCollArr) {
         if (featColl.properties.clusterID) geoClustersArr.push(...featColl);
      };
      // delete it from the collections array
      APP_STATE.deleteCachedDBCollection(collectionName);
      // re-insert the updated version
      APP_STATE.cacheDBCollection(collectionName, geoClustersArr);
   };

   // TODO > WIP > RENDER NEWLY PARCELIZED CLUSTERS
   // RENDER NEW GEO CLUSTERS ADDED TO THE DB.
   const renderLiveGeoClusters = async (featCollArr) => {
      
      (function renderLiveGeoClusters() {
      
         const legacyClustersColl = _TraverseObject.evaluateValue(APP_STATE.returnCachedDBCollection("v1/legacy-agcs"), "data");
         
         console.log({legacyClustersColl});
   
         if (legacyClustersColl) {
   
            _PopulateDOM.clusterResultsSidebar({dbCollection: legacyClustersColl});
            
            const currClusterTitleDivs = document.querySelectorAll(`.result-item-title`);
   
            if (currClusterTitleDivs.length > GET_DOM_ELEMENTS().clusterTitleDivs.length) {
               // ADD CLICK HAND. FOR NEW RESULTS THAT ARRIVE AFTER INITIAL DOM LOAD
               clusterTitleClickHandler(currClusterTitleDivs);
            };
         };
      })();      
   };
   
   return {

      cachePreloadedGeoClusters: async () => {
         // GET CLUSTERS' DATA
         const { geoClusters } = _retreiveClusterGJDatasets();

         APP_STATE.cacheDBCollection(`cached-geo-clusters`, [...geoClusters]);
      },

      renderCachedGeoClusters: async () => {

         // GET CLUSTERS' DATA
         const geoClustersArr = _TraverseObject.evaluateValue(APP_STATE.returnCachedDBCollection("cached-geo-clusters"), "data");

         // RENDER ON MAP
         await renderClustersCollection(geoClustersArr);
      },

      // GET & RENDER ADMIN BOUNDS GEOJSON
      renderAdminBounds: async (window) => {

         const apiHost = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_HOST;
         const adminBoundsAPIResourcePaths = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS;

         for (const adminBoundsResourcePath of adminBoundsAPIResourcePaths) {

            // get the resource name
            const resourceName = adminBoundsResourcePath.slice(adminBoundsResourcePath.indexOf('/nga') + 1);
            console.log({resourceName});

            // get the resource
            const adminBoundsResource = await _getAPIResource(window, apiHost, adminBoundsResourcePath, {});
            console.log({adminBoundsResource});
                           
            if (adminBoundsResource && adminBoundsResource.data) {
               
               // SAVE THE RETURNED DATA
               APP_STATE.cacheDBCollection(resourceName, adminBoundsResource.data);

               // RENDER ON MAP
               renderGeoPolRegions(resourceName, adminBoundsResource.data);
            };

         };
      },      

      // NESTED, RECURSIVE setTimeouts THAT LOOPS INDEFINITELY @ 30s INTERVALS
      autoUpdateWorker: async (window) => {

         let initDelay = 30000;

         let intervalDelay = initDelay;

         setTimeout(async function request() {

            const newGeoClustersArr = await getNewGeoClusters(window);

            if (newGeoClustersArr && newGeoClustersArr.length > 0) {

               // reset the interval delay when new CLUSTER(S) ARE FOUND..
               intervalDelay = initDelay;
               
               // SAVE THE NEWLY RETREIVED GEOJSON TO APP CACHE
               updateCachedGeoClusters("cached-geo-clusters", newGeoClustersArr);

               // RENDER THE NEW CLUSTERS
               // await renderLiveGeoClusters(newGeoClustersArr);
            };

            // PROGRESSIVELY INCREASE THE INTERVAL IF NO NEW CLUSTERS ARE BEING FOUND
            if (newGeoClustersArr && newGeoClustersArr.length === 0) intervalDelay += 500;

            // DOUBLE THE INTERVAL BETWEEN setTimeouts IF 1ST CALL FAILED TO EXECUTE COMPLTELY
            if (!newGeoClustersArr) intervalDelay *= 2;

            console.log({intervalDelay})

            // RECURSIVE LOOP
            setTimeout(request, intervalDelay);

         }, intervalDelay);
      },
   };
})();


(() => {

   window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
      
      // save the UI default settings
      APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

      await InitApp.cachePreloadedGeoClusters();

      await InitApp.renderCachedGeoClusters();

      await InitApp.renderAdminBounds(windowObj);

      await InitApp.autoUpdateWorker(windowObj);
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