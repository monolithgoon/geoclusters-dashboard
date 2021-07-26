'use strict'
import { _queryAPI } from "./data-controller.js";
import { _TraverseObject, _getCheckedRadio, _stringifyPropValues, _TurfHelpers, _ManipulateDOM } from "../_utils.js";
import { _sanitizeFeatCollCoords, _CheckGeoJSON, _getBufferedPolygon } from "../_utils.js";
import { _RenderMaps, _switchMapboxMapLayer } from "./maps-controller.js";
import { APP_STATE } from "./state-controller.js";
import { _getClusterFeatProps, _GetClusterProps } from "../cluster-props-adapter.js";
import { _GenerateClusterFeatMarkup, _GenerateClusterMarkup, _GenClusterModalMarkup } from "./markup-generator.js";
import { _clientSideRouter, _navigateTo } from "../routers/router.js";


export function _getDOMElements() {

   const appSidebar = document.getElementById(`v_pills_tab`);
   const sidebarExpandBtn = document.getElementById(`app_sidebar_expand_button`);
   const settingsSidebarToggleBtn = document.getElementById(`avg_settings_sidebar_toggle_btn`);

   const appActivityIndWrapper = document.querySelector(`.app-activity-indicator-wrapper`);
   const appActivityInd = document.querySelector(`.app-activity-indicator`);

   // SETTINGS INPUTS
   // const settingsToggleInputs = document.querySelectorAll(`.settings-sidebar-body input[type=checkbox]`);
   // const settingsRadioInputs = document.querySelectorAll(`.settings-sidebar-body input[type=radio]`);
   const baseMapRadios = document.querySelectorAll(`.base-map-tile-radio`);
   const plotsMapStyleRadios = document.querySelectorAll(`.cluster-plots-map-style-radio`);
   const distanceUnitsRadios = document.querySelectorAll(`.map-distance-units-radio`);
   const areaUnitsRadios = document.querySelectorAll(`.map-area-units-radio`);
   const clusterMapZoomRange = document.getElementById("cluster_map_zoom");
   
   
   const resultsCountDiv = document.getElementById('results_count');
   const resultsStatus = document.getElementById('results_status');

   const resultModalDiv = document.getElementById(`result_item_modal`);
   const resultModalCloseBtn = document.getElementById(`result_item_modal_close_btn`);
   const resultsListWrapper = document.getElementById(`results_list_wrapper`);
   const resultItemDivs = document.querySelectorAll(`.result-item`);
   const resultTitleDivs = document.querySelectorAll(`.result-item-title`);

   const clusterFeatsNumEl = document.getElementById(`cluster_feats_num`);
   const clusterAreaEl = document.getElementById(`cluster_area`);
   const clusterUsedAreaEl = document.getElementById(`cluster_used_area`);
   const clusterUnusedAreaEl = document.getElementById(`cluster_unused_area`);
   const featsListingDiv = document.getElementById(`cluster_feats_listing_body`);

   const bufferFeatsChkBx = document.getElementById(`buffer_cluster_feats_chk`)
   const renderMultiFeatsChkBx = document.getElementById(`render_multiple_feats_chk`);


   return {
      appSidebar,
      sidebarExpandBtn,
      // settingsSidebarToggleBtn,
      appActivityIndWrapper,
      appActivityInd,
      plotsMapStyleRadios,
      baseMapRadios,
      distanceUnitsRadios,
      areaUnitsRadios,
      clusterMapZoomRange,
      resultsCountDiv,
      resultsStatus,
      resultModalDiv,
      resultModalCloseBtn,
      resultsListWrapper,      
      resultItemDivs,
      resultTitleDivs,
      clusterFeatsNumEl,
      clusterAreaEl,
      clusterUsedAreaEl,
      clusterUnusedAreaEl,
      featsListingDiv,
      bufferFeatsChkBx,
      renderMultiFeatsChkBx,
   };
};


function getFilterCheckboxes() {

   const filterCheckboxes = document.querySelectorAll(`.results-filter-checkbox[type=checkbox]`);
   const filterCheckboxMasters = document.querySelectorAll(`.results-filter-checkbox.master-checkbox[type=checkbox]`)
   
   return {
      filterCheckboxes,
      filterCheckboxMasters,
   };
};


function getResultCheckboxes() {
   const masterResultCheckbox = document.getElementById(`select_all_results_chk`);
   const resultItemCheckboxes = document.querySelectorAll(`.result-item-checkbox[type=checkbox]`);
   return {
      masterResultCheckbox,
      resultItemCheckboxes,
   }
};


function getAreaUnitsRadios() {
   const areaUnitsRadios = document.querySelectorAll(`.map-area-units-radio`);
   return areaUnitsRadios;
};


// TODO > GET SETTINGS INPUTS
// TODO > SAVE TO APP_STATE.saveCurrentSettings() IF INPUTS ABOVE CHANGE
function getAppSettingsInputs() {
   return {
      toggleInputs: [],
      radioInputs: [],
      textInputs: [],
      selectInputs: [],
   };
};


// GET SETTINGS VALUES
export const pollAVGSettingsValues = () => {

   try {
            
      // settings 'keys'
      const baseMapKey = _getCheckedRadio(_getDOMElements().baseMapRadios).radioValue;
      const plotsMapStyleKey = _getCheckedRadio(_getDOMElements().plotsMapStyleRadios).radioValue;
      const distanceUnits = _getCheckedRadio(_getDOMElements().distanceUnitsRadios).radioValue;
      const areaUnits = _getCheckedRadio(_getDOMElements().areaUnitsRadios).radioValue;
   
      return {
         baseMapKey,
         plotsMapStyleKey,
         distanceUnits,
         areaUnits,

         clusterMap: {
            zoomValue: (_getDOMElements().clusterMapZoomRange).value,
         },

         bufferFeatsChk: (_getDOMElements().bufferFeatsChkBx).checked,
         renderMultiFeatsChk: (_getDOMElements().renderMultiFeatsChkBx).checked,
      };
      
   } catch (pollAppSettingsErr) {
      console.error(`pollAppSettingsErr: ${pollAppSettingsErr.message}`)
   };
};


// RESULT TITLE MAIN PARENT SEQ.
function clickedResultContainerSeq(resultItemDiv, otherResultItems) {
   
   // scroll the result into view
   resultItemDiv.scrollIntoView({
      behavior: `smooth`,
      block: `start`,
      inline: `nearest`,
   });
   
   // remove "active" class from other result items
   otherResultItems.forEach(result => {
      if (result !== resultItemDiv) {
         _ManipulateDOM.removeClass(result, `is-active`);
      };
   });

   // set clicked result to active
   _ManipulateDOM.toggleClassList(resultItemDiv, `is-active`);
};


// MASTER-SLAVE CHECKBOX BEHAVIOR
function masterSlaveControl(master, slaves) {
  
   master.addEventListener(`change`, (e)=>{
      if (e.target.checked) {
         // check slaves
         slaves.forEach(checkbox => {
            checkbox.checked = true;
            if (checkbox.labels[0]) {
               const slaveCheckboxLabelTxt = checkbox.labels[0].innerText;
               // console.log(slaveCheckboxLabelTxt);
            };
         });
      } else {
         // uncheck slaves
         slaves.forEach(checkbox => {
            checkbox.checked = false;
         });
      };
   });

   // TOGGLE MASTER TO 'OFF' WHEN SLAVE IS 'OFF'
   slaves.forEach(slaveCheckbox => {
      slaveCheckbox.addEventListener(`change`, (e)=>{

         // FIXME > THIS HARDCODED PARENT BEH. WILL FAIL
         // show master when slave is clicked
         console.log(master.parentNode)
         console.log(master.parentNode.style.display)
         _ManipulateDOM.blockElement(master.parentNode);

         if (slaveCheckbox.checked === false) { master.checked = false}
      });
   });

   // TODO
   // toggle master to "on" if ALL slaves are "on"
};


// ACTIVATE THE DIV THAT DISPLAYS APP ACTIVITY
const ShowActivity = (()=>{
   
   try {
      
      function toggleIndicatorWrapper (wrapperDiv) {
         _ManipulateDOM.toggleClassList(wrapperDiv, "reveal");         
      };
      function toggleIndicator (indicatorDiv) {
         _ManipulateDOM.toggleClassList(indicatorDiv, "spinner-grow", "text-light", "spinner-grow-sm");
      };
      return {
         activityStart: (wrapperDiv, indicatorDiv) => {
            toggleIndicatorWrapper(wrapperDiv)
            toggleIndicator(indicatorDiv)
         },
         activityEnd: (wrapperDiv, indicatorDiv) => {
            // indicatorDiv.innerText = `Data Loaded`;
            // setTimeout(() => {
            //    indicatorDiv.innerText = ``
            //    toggleIndicator(indicatorDiv);
            //    toggleIndicatorWrapper(wrapperDiv);
            // }, 3000);
            toggleIndicator(indicatorDiv);
            toggleIndicatorWrapper(wrapperDiv);
         },
      };

   } catch (showActivityErr) {
      console.error(`showActivityErr: ${showActivityErr.message}`)
   };
})();


// CALC. TIME TO EXE. A FN. && DISPLAY INDICATOR
const MonitorExecution = (function() {

	let returnedData, executionMs;

	return {

		execute: async function(callback) {
						
			ShowActivity.activityStart(_getDOMElements().appActivityIndWrapper, _getDOMElements().appActivityInd);
	
         console.log(`%c This funciton [${callback}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

			ShowActivity.activityEnd(_getDOMElements().appActivityIndWrapper, _getDOMElements().appActivityInd);
		},

		getExecutionTime: function() {
         console.log(`%c The fn. executed in: ${((executionMs)/1000).toFixed(2)} seconds`, `background-color: yellow; color: blue;`);
			return executionMs;
		},

		getData: function() {
			return returnedData;
		},
	};
})();


// open modal for clicked result
function activateResultModal(modalDiv, featureCollection) {

   modalDiv.innerHTML = ``;

   const clusterProps = _GetClusterProps(featureCollection);

   modalDiv.innerHTML += _GenClusterModalMarkup.getInnerMarkup(clusterProps);

   _ManipulateDOM.blockElement(modalDiv);

   // MODAL CLOSE BTN.
   _getDOMElements().resultModalCloseBtn.addEventListener(`click`, () => {
      _ManipulateDOM.hideElement(_getDOMElements().resultModalDiv);
   });

   // TODO > MODAL TITLE CLICK EVENT HANDLER

   // TODO > MODAL AVATAR CLICK EVENT HANDLER
};


function clusterTitleClickSeq(evtObj) {

   evtObj.preventDefault();

   // REMOVE
   const previousRenderedGJ = APP_STATE.retreiveLastRenderedGJ();
   console.log({previousRenderedGJ});
   console.log(pollAVGSettingsValues());

   // get the main parent container
   const resultContainerDiv = _ManipulateDOM.getParentElement(evtObj.target, {parentLevel: 3});

   // get the siblings of the main parent container
   const adjacentResultDivs = _ManipulateDOM.getSiblingElements(resultContainerDiv);

   // get the geojson for that result
   const clusterGeoJSON = JSON.parse(_ManipulateDOM.getDataset(resultContainerDiv));

   // TODO > VALIDATE GJ. HERE
   if (clusterGeoJSON) {
      
      // 1.
      activateResultModal(_getDOMElements().resultModalDiv, clusterGeoJSON);

      // 1b.
      // render cluster feature cards.
      populateClusterFeatsSidebar(clusterGeoJSON);
      
      // 2.
      _RenderMaps.renderEverythingNow(clusterGeoJSON, 
         {
            baseMapZoomLvl: APP_STATE.CONFIG_DEFAULTS.LEAFLET_ADMIN_LEVEL_3_ZOOM,
            useBuffer: pollAVGSettingsValues().bufferFeatsChk, 
            bufferUnits: pollAVGSettingsValues().distanceUnits,
            bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
            areaUnits: pollAVGSettingsValues().areaUnits
         }
      );

      // 2b. 
      APP_STATE.saveRenderedGeojson(clusterGeoJSON);
      
      // 3.
      clickedResultContainerSeq(resultContainerDiv, adjacentResultDivs);

      // 4. 
      APP_STATE.saveRenderedGeojson(clusterGeoJSON);
   };
};


function resultTitleClickHandler(resultTitleDivs) {

   try {

      for (const resultTitle of resultTitleDivs) {

         // CLEAR THE CLICK LISTENERS ON "PRE-LOADED" RESULT DIVS
         resultTitle.removeEventListener(`click`, clusterTitleClickSeq);
            
         resultTitle.addEventListener(`click`, clusterTitleClickSeq)
      };

   } catch (resultTitleClickErr) {
      console.error(`resultTitleClickErr: ${resultTitleClickErr.message}`)
   };
};


/**
 * Listen to the element and when it is clicked, do four things:
 * 1. Get the geoJSON associated with the clicked link
 * 2. Fly to the point
 * 3. Close all other popups and display popup for clicked store
 * 4. Highlight listing in sidebar (and remove highlight for all other listings)
 **/
function featCardClickSeq(clusterFeatures) {

   try {
      
      for (var i = 0; i < clusterFeatures.length; i++) {

         // this => clusterFeatCard
         if (this.currentTarget.id === _CheckGeoJSON.getId(clusterFeatures[i])) {
            _RenderMaps.panClusterPlotsFeatMap(clusterFeatures[i], {zoomLevel: pollAVGSettingsValues().clusterMap.zoomValue});
            _RenderMaps.renderFeatPopup(_getClusterFeatProps(clusterFeatures[i], i), _TurfHelpers.getLngLat(clusterFeatures[i]));
         };
      };

      _ManipulateDOM.addRemoveClass(this.currentTarget, 'selected');

   } catch (cardClickSeqErr) {
      console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
   };
};
// const FeatCardClickSeq = ((mapboxMap) => {
   
//    return {
      
//       activate: (clusterFeatures) => {

//          try {

//             for (var i = 0; i < clusterFeatures.length; i++) {
      
//                // this => clusterFeatCard
//                if (this.currentTarget.id === _CheckGeoJSON.getId(clusterFeatures[i])) {
//                      _RenderMaps.panClusterPlotsFeatMap(clusterFeatures[i], {zoomLevel: pollAVGSettingsValues().clusterMap.zoomValue});
//                   _RenderMaps.renderFeatPopup(mapboxMap, _TurfHelpers.getLngLat(clusterFeatures[i]));
//                };
//             };
      
//             _ManipulateDOM.addRemoveClass(this.currentTarget, 'selected');

//          } catch (cardClickSeqErr) {
//             console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
//          };
//       },
//    };      

// })(CLUSTER_PLOTS_MAP);


function renderClusterSummary(props, dom) {
   dom.clusterFeatsNumEl.innerText = props.clusterFeatsNum;
   dom.clusterAreaEl.innerText = `${+(props.clusterArea).toFixed(1)} ha.`;
   dom.clusterUsedAreaEl.innerText = `${+(props.clusterUsedArea).toFixed(1)} ha.`;
   dom.clusterUnusedAreaEl.innerText = `${+(props.clusterUnusedArea).toFixed(1)} ha.`;
};


async function populateClusterFeatsSidebar(clusterFeatColl) {
   
   try {

      if (clusterFeatColl) {

         // REMOVE
         // 1.
         // SANITIZE COORDS.
         // clusterFeatColl = _sanitizeFeatCollCoords(clusterFeatColl);

         renderClusterSummary(clusterFeatColl.properties, _getDOMElements());

         // get the features
         const clusterFeatures = clusterFeatColl.features;

         // remove prev. rendered feats.
         const listingWrapper = _getDOMElements().featsListingDiv;
         listingWrapper.innerHTML = ``;
         
         // 2.
         for (let idx = 0; idx < clusterFeatures.length; idx++) {

            let clusterFeature = clusterFeatures[idx];
            
            // const clusterFeatCard = await _GenerateClusterFeatMarkup.getClusterFeatDiv(_getClusterFeatProps(clusterFeature, {featIdx:idx}));
            const clusterFeatCard = await _GenerateClusterFeatMarkup.getClusterFeatDiv(clusterFeature.properties);

            // SANDBOX
            // ASSIGN A UNIQE ID TO THE CARD DIV
            clusterFeatCard.id = _CheckGeoJSON.getId(clusterFeature);

            clusterFeatCard.addEventListener('click', e => { featCardClickSeq.call(e, clusterFeatures); });

            _ManipulateDOM.populateDataset(clusterFeatCard, `clusterfeatdatastream`, JSON.stringify(clusterFeature));

            _ManipulateDOM.appendList(listingWrapper, clusterFeatCard);
         };
      };
      
   } catch (clusterFeatsSidebarErr) {
      console.error(`clusterFeatsSidebarErr: ${clusterFeatsSidebarErr.message}`);
   };
};


// DOWNLOAD & SAVE DB. COLLECTIONS
async function downloadDBCollections(eventObj) {

   try {
      
      for (const APIResourcePath of APP_STATE.CONFIG_DEFAULTS.API_RESOURCE_PATHS) {
         
         // const dbQueryStr = APP_STATE.CONFIG_DEFAULTS.LEGACY_CLUSTER_QUERY_STR;
         
         // create an intermediate "pipeline"?? fn.
         const apiDataQuery = function() {
            console.log(document.domain)
            return _queryAPI.call(eventObj, window.fetch, APP_STATE.CONFIG_DEFAULTS.API_HOST_HEROKU, APIResourcePath, {});
         };
   
         // EXECUTE THE API CALL
         await MonitorExecution.execute(apiDataQuery);

         MonitorExecution.getExecutionTime();
         
         // get the resource name
         const dbCollectionName = APIResourcePath.slice(APIResourcePath.indexOf('/')+1);
         
         // SAVE THE RETURNED DATA
         APP_STATE.saveDBCollection(dbCollectionName, MonitorExecution.getData());

         // console.info(MonitorExecution.getData());

         console.log(...APP_STATE.returnDBCollections());
      };

   } catch (getDBCollErr) {
      console.error(`getDBCollErr: ${getDBCollErr}`);
   };
};


// TODO > THIS SHOULD FIRE ON FILTER INPUT CHANGES
function populateResultsSidebar(dbCollection) {

   try {
      
      // CREATE NEW RESULT DIVS FOR EACH LEGACY CLUSTER
      if (dbCollection) {

         // TODO > FILTER OUT UNWANTED LEGACY AGCS
         dbCollection = dbCollection.slice(1)

         for (let idx = 0; idx < dbCollection.length; idx++) {

            let clusterGeoJSON = dbCollection[idx];

            // REMOVE
            // 1.
            // CONVERT STRING COORDS. IN ANY FEAT. TO INTEGER COORDS.
            // clusterGeoJSON = _sanitizeFeatCollCoords(clusterGeoJSON);
   
            // 2.
            const clusterResultDiv = _GenerateClusterMarkup.getClusterResultDiv(clusterGeoJSON);

            // 2a.
            _ManipulateDOM.populateDataset(clusterResultDiv, APP_STATE.CONFIG_DEFAULTS.CLUSTER_CARD_DATA_ATTR_NAME, JSON.stringify(clusterGeoJSON));
            
            // append result item div to sidebar
            _ManipulateDOM.appendList(_getDOMElements().resultsListWrapper, clusterResultDiv)
            _ManipulateDOM.appendList(_getDOMElements().resultsListWrapper, _ManipulateDOM.createDiv(`h-divider-grey-100`, "fuck-chicken"))
         };
      };

   } catch (popResultsSidebarErr) {
      console.error(`popResultsSidebarErr: ${popResultsSidebarErr}`)
   };
};


// FIXME > DON'T USE JQUERY
// SETTINGS SIDEBAR TOGGLE
$(document).ready(function () {
   $("#avg_settings_sidebar_toggle_btn").on("click", function () {
      $("#avg_settings_sidebar").toggleClass("active");
   });
   $("#settings_sidebar_close_btn").on("click", function () {
      $("#avg_settings_sidebar").toggleClass("active");
   });
});


// DOM ELEM. EVT. LIST'NRS.
function ActivateEventListeners() {

   try {

      window.addEventListener(`DOMContentLoaded`, async (windowObj) => {

         // save the UI default settings
         APP_STATE.saveDefaultSettings(pollAVGSettingsValues());
                  
         // await downloadDBCollections(windowObj);

         const legacyClustersColl = _TraverseObject.evaluateValue(APP_STATE.returnDBCollections(), [0], "data", "legacy_agcs");
         
         populateResultsSidebar(legacyClustersColl);
   
         // ADD CLICK HAND. AFTER DIVS HAVE BEEN MADE
         resultTitleClickHandler(_getDOMElements().resultTitleDivs);
      });

      // SETTINGS CHANGE EVENT SEQ.
      getAreaUnitsRadios().forEach(radio => {
         radio.addEventListener(`change`, async (e) => {
            if (APP_STATE.retreiveLastRenderedGJ()) {
               _RenderMaps.renderClusterPlotLabel(APP_STATE.retreiveLastRenderedGJ(), 
                  {
                     useBuffer: pollAVGSettingsValues().bufferFeatsChk,
                     bufferUnits: pollAVGSettingsValues().distanceUnits,
                     bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
                     areaUnits: pollAVGSettingsValues().areaUnits
                  }
               );
            };
         });
      });

      // CHANGE CLUSTER PLOTS MAP STYLE
      _getDOMElements().plotsMapStyleRadios.forEach(radio => {
         radio.addEventListener(`change`, _switchMapboxMapLayer);
      });

      // RESULT ITEM TITLE CLICK HAND.
      resultTitleClickHandler(_getDOMElements().resultTitleDivs);
      
      // RESULT ITEM CHECKBOX BEH.
      const slaveResultCheckboxes = getResultCheckboxes().resultItemCheckboxes;
      const selectAllResultsChk = getResultCheckboxes().masterResultCheckbox
      masterSlaveControl(selectAllResultsChk, slaveResultCheckboxes);

      // TODO
      // RESULT ITEM CHECKBOX EVENT SEQ.

      // TODO
      // FILTER CHECKBOX EVENT SEQ.
      getFilterCheckboxes().filterCheckboxes.forEach(filterCheckbox => {
         filterCheckbox.addEventListener(`change`, async (e)=>{
            const checkboxLabelTxt = e.target.labels[0].innerText; 
            if (e.target.checked) {
               console.log(`%c ${checkboxLabelTxt} checked`, `color: white; background-color:blue;`);
            } else {
               console.log(`%c ${checkboxLabelTxt} un-checked`, `color: white; background-color:green;`);
            };
            // filterResults(checkboxLabelTxt);
            // renderFilterPill(checkboxLabelTxt);
         });
      });
   
      // FILTER CHECKBOX BEH.
      getFilterCheckboxes().filterCheckboxMasters.forEach(masterCheckbox => {
         const inputGroupWrapper = _ManipulateDOM.getParentElement(masterCheckbox, {parentLevel: 4})
         const slaveCheckboxes = _ManipulateDOM.getSubordinates(inputGroupWrapper, masterCheckbox, ".form-check-input")
         masterSlaveControl(masterCheckbox, slaveCheckboxes);
      });

      // EXPAND APP SIDEBAR
      _getDOMElements().sidebarExpandBtn.addEventListener(`click`, ()=>{
         _getDOMElements().appSidebar.classList.toggle(`expanded`);
      });
      
   } catch (addEvtListenErr) {
      console.error(addEvtListenErr.message);
   };
};


export {ActivateEventListeners};