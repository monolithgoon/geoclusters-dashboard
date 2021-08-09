`use strict`;
import { _retreiveGeoJSONData } from "./avg-controllers/data-controller.js";
import { APP_STATE } from "./avg-controllers/state-controller.js";
import { pollAVGSettingsValues, _mountHandlers } from "./avg-controllers/ui-controller.js";
import { _AnimateClusters } from "./controllers/maps-controller.js";
import { _clientSideRouter } from "./routers/router.js";
import { _TraverseObject } from "./utils/helpers.js";


(function initApp() {

   window.addEventListener(`DOMContentLoaded`, async (windowObj) => {
      
      // DELEGATION
      _mountHandlers();

      // save the UI default settings
      APP_STATE.saveDefaultSettings(pollAVGSettingsValues());

      // GET DATA
      const { geoClusters } = _retreiveGeoJSONData();
      // const geoClusters = _TraverseObject.evaluateValue(APP_STATE.returnDBCollection("geo-clusters"), "data");

      // RENDER DATA
      await _AnimateClusters.renderClusters(geoClusters, {
         useBuffer: pollAVGSettingsValues().bufferFeatsChk ,
         bufferUnits: pollAVGSettingsValues().distanceUnits,
         bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
      });
   });
})();


// // SANDBOX
// window.addEventListener(`DOMContentLoaded`, async () => {

//    document.body.addEventListener('click', e => {
//       if (e.target.matches("[data-bs-target]")) {
//          console.log('client side routed')
//          e.preventDefault();
//          _navigateTo(e.target.href);
//       }
//    });

//    // SANDBOX
//    // init. the client side router
//    _clientSideRouter();
// });