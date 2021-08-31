`use strict`;
import { _downloadDBCollections, _retreiveClusterGJDatasets, _getAPIResource } from "./avg-controllers/data-controller.js";
import { _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues, _PopulateDOM } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _RenderEngine } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/dom-elements.js";


const InitApp = (() => {

   // nothing here;
   function renderGeoPolRegions(resourceName, featColl) {
      if (resourceName === `nga-geo-pol-regions` && featColl) {
         _RenderEngine.renderFeatColl(featColl, {useBuffer: false, lineColor: "#BDC581", lineWeight: 0.8});
      };
   };

   //
   async function renderClustersData (featCollArray) {
      if (featCollArray && featCollArray.length > 0) { 
         // RENDER CLUSTERS' DATA ON BASE MAP
         await _RenderEngine.renderClusters(featCollArray, {
            useBuffer: _pollAVGSettingsValues().bufferFeatsChk ,
            bufferUnits: _pollAVGSettingsValues().distanceUnits,
            bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
         });
      };
   };

   return {

      retreiveCachedClusters: async () => {

         // GET CLUSTERS' DATA
         const { geoClusters } = _retreiveClusterGJDatasets();
         // const geoClusters = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("geo-clusters"), "data");

         APP_STATE.saveDBCollection(`geo-clusters`, [...geoClusters]);

         // RENDER ON MAP
         await renderClustersData(geoClusters);
      },

      // GET FRESH DATA FROM DB.
      // FIXME > DOWNLOAD COLLS. IN RESPONSE TO DB. INSERTS
      renderLiveClusters: async (window) => {
         
         // await _downloadDBCollections(window);

         (function renderLiveClusters() {
         
            const legacyClustersColl = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("legacy-agcs"), "data");
            
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
      },

      // GET ADMIN BOUNDS GEOJSON
      retreiveAdminBoundsGJ: async (window) => {

         const apiHost = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_HOST;
         const adminBoundsAPIResourcePaths = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS;

         for (const adminBoundsResourcePath of adminBoundsAPIResourcePaths) {

            console.log({adminBoundsResourcePath});

            // get the resource name
            const resourceName = adminBoundsResourcePath.slice(adminBoundsResourcePath.indexOf('/nga') + 1);
            console.log({resourceName});

            const adminBoundsResource = await _getAPIResource(window, apiHost, adminBoundsResourcePath);
            console.log({adminBoundsResource});
                           
            // SAVE THE RETURNED DATA
            APP_STATE.saveDBCollection(resourceName, adminBoundsResource.data);

            // RENDER ON MAP
            renderGeoPolRegions(resourceName, adminBoundsResource.data);
         };
      },
   };
})();


(() => {

   window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
      
      // save the UI default settings
      APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

      await InitApp.retreiveCachedClusters();

      await InitApp.retreiveAdminBoundsGJ(windowObj);
      
      await InitApp.renderLiveClusters(windowObj);

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