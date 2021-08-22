`use strict`;
import { _downloadDBCollections, _retreiveGeoJSONData } from "./avg-controllers/data-controller.js";
import { _TraverseObject } from "./utils/helpers.js";
import { _pollAVGSettingsValues } from "./avg-controllers/ui-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { _AnimateClusters } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";


(function initApp() {

   window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
      
      // save the UI default settings
      APP_STATE.saveDefaultSettings(_pollAVGSettingsValues());

      // GET CLUSTERS' DATA
      const { geoClusters } = _retreiveGeoJSONData();
      // const geoClusters = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("geo-clusters"), "data");

      // RENDER CLUSTERS' DATA ON BASE MAP
      await _AnimateClusters.renderClusters(geoClusters, {
         useBuffer: _pollAVGSettingsValues().bufferFeatsChk ,
         bufferUnits: _pollAVGSettingsValues().distanceUnits,
         bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
      });

      // GET FRESH DATA FROM DB.
      // FIXME > DOWNLOAD COLLS. IN RESPONSE TO DB. INSERTS
      (async function retreiveLiveData (windowObj) {

         // await _downloadDBCollections(windowObj);

         (function renderLiveData() {
         
            const legacyClustersColl = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("legacy-agcs"), "data");
            
            console.log({legacyClustersColl});
      
            if (legacyClustersColl) {
      
               populateResultsSidebar(legacyClustersColl);   
               
               const currClusterTitleDivs = document.querySelectorAll(`.result-item-title`);
      
               if (currClusterTitleDivs.length > GET_DOM_ELEMENTS.clusterTitleDivs.length) {
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