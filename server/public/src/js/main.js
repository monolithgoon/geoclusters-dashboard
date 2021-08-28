`use strict`;
import { _downloadDBCollections, _retreiveClusterGJDatasets, _getAPIResource } from "./avg-controllers/data-controller.js";
import { _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues, _PopulateDOM } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _RenderEngine } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { GET_DOM_ELEMENTS } from "./utils/dom-elements.js";


(function initApp() {

   window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
      
      // save the UI default settings
      APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

      // GET CLUSTERS' DATA
      const { geoClusters } = _retreiveClusterGJDatasets();
      // const geoClusters = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("geo-clusters"), "data");

      if (geoClusters && geoClusters.length > 0) { 
         // RENDER CLUSTERS' DATA ON BASE MAP
         await _RenderEngine.renderClusters(geoClusters, {
            useBuffer: _pollAVGSettingsValues().bufferFeatsChk ,
            bufferUnits: _pollAVGSettingsValues().distanceUnits,
            bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
         });
      };
      

      // GET ADMIN BOUNDS GEOJSON
      (async function retreiveAdminBoundsGJ (window) {

         const apiHost = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_HOST;
         const adminBoundsAPIResourcePaths = APP_STATE.CONFIG_DEFAULTS.ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS;

         for (const adminBoundsResourcePath of adminBoundsAPIResourcePaths) {

            const ngaAdminBoundsData = await _getAPIResource(window, adminBoundsResourcePath, apiHost);
            console.log({ngaAdminBoundsData});
            
            // const ngaAdminBoundsLvl1Arr = ngaAdminBoundsData.data.ngaAdminBoundsLvl1Files;
            // const ngaAdminBoundsLvl2Arr = ngaAdminBoundsData.data.ngaAdminBoundsLvl2Files;
            // const ngaAdminBoundsLvl3Arr = ngaAdminBoundsData.data.ngaAdminBoundsLvl3Files;

            // console.log({ngaAdminBoundsLvl1Arr});
            // console.log({ngaAdminBoundsLvl2Arr});
            // console.log({ngaAdminBoundsLvl3Arr});
   
            // get the resource name
            // const resourceName = adminBoundsResourcePath.slice(adminBoundsResourcePath.indexOf('/')+1);
            
            // SAVE THE RETURNED DATA
            // APP_STATE.saveDBCollection(resourceName, _MonitorExecution.getData());

            // FIXME > RENDER THIS IN SEPARATE FN.
            console.log({adminBoundsResourcePath});
            if (adminBoundsResourcePath === `v1/admin-bounds/nga-admin-bounds-lvl1`) {
               const adminBoundsFeatCollArr = ngaAdminBoundsData.data;
               for (let idx = 0; idx < adminBoundsFeatCollArr.length; idx++) {
                  const adminBoundFeatColl = adminBoundsFeatCollArr[idx];
                  _RenderEngine.renderFeatColl(adminBoundFeatColl, {useBuffer: false, lineColor: "#dfe6e9", lineWeight: 0.8, lineDashArray: "3"}) 
               };
            };   
         };

      })(windowObj);


      // GET FRESH DATA FROM DB.
      // FIXME > DOWNLOAD COLLS. IN RESPONSE TO DB. INSERTS
      (async function retreiveLiveData (window) {

         // await _downloadDBCollections(window);

         (function renderLiveData() {
         
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

      })(windowObj);

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