'use strict'
import { _queryAPI } from "./data-controller.js";
import { _mapboxPanToGeoJSON, _mapboxDrawFeatFeatColl, _mapboxDrawFeature, _leafletRenderGeojson, _mapboxDrawLabels, _openMapboxPopup } from "../geojson-render.js";
import { _getDataset, _joinWordsArray, _createDiv, _TraverseObject, _getCheckedRadio, _stringifyPropValues, _TurfHelpers, _ManipulateDOM } from "../_utils.js";
import { _sanitizeFeatCollCoords, _populateDataset, _replaceDataset, _CheckGeoJSON, _getBufferedPolygon } from "../_utils.js";
import { AVG_BASE_MAP, CLUSTER_PLOTS_MAP, _switchMapboxMapLayer } from "./maps-controller.js";
import { APP_STATE } from "./state-controller.js";
import { _GetClusterFeatProps, _GetClusterProps } from "../cluster-props-adapter.js";
import { _ClusterFeatMarkupGenerator, _ClusterMarkupGenerator } from "./markup-generator.js";


function getDOMElements () {

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

   const clusterFeatsListingDiv = document.getElementById(`cluster_feats_list_body`);

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
      clusterFeatsListingDiv,
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
// TODO > SAVE TO APP_STATE IF INPUTS ABOVE CHANGE
function getAppSettingsInputs() {
   return {
      toggleInputs: [],
      radioInputs: [],
      textInputs: [],
      selectInputs: [],
   };
};


// GET SETTINGS VALUES
function pollAVGSettingsValues() {

   try {
            
      // settings 'keys'
      const baseMapKey = _getCheckedRadio(getDOMElements().baseMapRadios).radioValue;
      const plotsMapStyleKey = _getCheckedRadio(getDOMElements().plotsMapStyleRadios).radioValue;
      const distanceUnits = _getCheckedRadio(getDOMElements().distanceUnitsRadios).radioValue;
      const areaUnits = _getCheckedRadio(getDOMElements().areaUnitsRadios).radioValue;
   
      return {
         baseMapKey,
         plotsMapStyleKey,
         distanceUnits,
         areaUnits,

         clusterMap: {
            zoomValue: (getDOMElements().clusterMapZoomRange).value,
         }
      };
      
   } catch (pollAppSettingsErr) {
      console.error(`pollAppSettingsErr: ${pollAppSettingsErr.message}`)
   };
};


// TODO > MOVE TO _utils.js
function togleBlockElement(element) {
   console.log(element.style.display);
   if (element.style.display !== `block`) { element.style.display = `block`}
   else if (element.style.display === `block`) { element.style.display = `none`}
   else if (element.style.display === `none`) { element.style.display = `block`}
};


// TODO > MOVE TO _utils.js
function blockElement(element) {
   element.style.display = `block`;
};


// TODO > MOVE TO _utils.js
function hideElement(element) {
   element.style.display = `none`;
};


// TODO > MOVE TO _utils.js
function removeClass(element, styleClass) {
   if (element && element.nodeType === 1 ) {
      element.classList.remove(styleClass);
   };
};


// TODO > MOVE TO _utils.js
function getSiblingElements(element) {

   // var for collecting siblings
   let siblingElements = [];

   // if no parent, return no sibling
   if (!element.parentNode) return siblingElements;

   // get fist child of parent node
   let siblingElement = element.parentNode.firstChild;

   // collect siblings
   while (siblingElement) {
      if (siblingElement.nodeType === 1 && siblingElement !== element) {
         siblingElements.push(siblingElement);
      };
      siblingElement = siblingElement.nextSibling;
   }

   // get parent node
   let parentElement = element.parentNode.parentNode.parentNode.parentNode;

   // collect adjacent parents
   while (parentElement) {
      if (parentElement.nodeType === 1) {
         let adjacentInput = parentElement.querySelectorAll('.form-check-input');
         if (adjacentInput !== element) {
         };
      };
      parentElement = parentElement.nextSibling;
   }

   return siblingElements;
};


// TODO > MOVE TO _utils.js
function getAdjacentInputs(inputElement) {
   
   let adjacentInputs = [];
   
   // get main parent wrapper node
   let parentElement = inputElement.parentNode.parentNode.parentNode.parentNode;

   // collect adjacent parents
   if (parentElement.nodeType === 1) {
      let inputs = parentElement.querySelectorAll('.form-check-input');
      for (const input of inputs) {
         if (input !== inputElement) {
            adjacentInputs.push(input)
         };
      };
   };

   return adjacentInputs;  
};


// TODO > MOVE TO _utils.js
function getParentElement(element, {parentLevel=1}) {
   let parent;
   if (element && element.nodeType === 1) {
      for (let idx = 0; idx < parentLevel; idx++) {
         parent = element.parentElement;
         element = parent;
      } {
      };
      return parent;
      return null;
   }
};


// TODO > MOVE TO _utils.js
// FIXME > ENDLESS WHILE LOOP
function getNestedSiblings(resultDiv, numParents, nestPosition) {
   var siblingResults = [];
   // return nothing if no parent
   if (!resultDiv.parentNode) return siblingResults;

   // find the relevant parent to target
   let parentDiv;
   while(numParents > 0) {
      parentDiv = resultDiv.parentNode;
      numParents = numParents - 1;
   };
   
   // get first sibling of parent (ie., self)
   let nestedSibling = parentDiv.childNodes[nestPosition-1];
   console.log(nestedSibling)

   // while (nestedSibling) {
      //    if (nestedSibling.nodeType === 1 && nestedSibling !== resultDiv) {
         //       siblingResults.push(nestedSibling);
         //    };
         //    // get next nested sibling
         //    nestedSibling = parentDiv.nextSibling.childNodes[nestPosition-1];
               const nextNestedSibling = parentDiv.nextSibling.childNodes[nestPosition-1];
               nestedSibling = nextNestedSibling;
      // };
   console.log(siblingResults);
   return siblingResults;
};


// SEQ. THAT HAPPENS TO RENDER GEOJSON ON BOTH MAPS
const RenderMaps = (function() {

   try {

      console.log(pollAVGSettingsValues());

      // pan map to entire cluster
      const panToClusterGeoJSON = (geoJSON) => {
         const gjCenterCoords = turf.coordAll(turf.centerOfMass(geoJSON))[0];
         const gjBounds = turf.bbox(geoJSON);
         _mapboxPanToGeoJSON(CLUSTER_PLOTS_MAP, gjCenterCoords, gjBounds, {zoom:16, pitch:0, bearing:0, boundsPadding:0});
      };
      
      // pan to a single cluster feat.
      const panToClusterFeat = (map, geoJSONFeat) => {

         try {
            
            console.log(geoJSONFeat)
                        
            const gjCenterCoords = turf.coordAll(turf.centerOfMass(geoJSONFeat))[0];
            const gjBounds = turf.bbox(geoJSONFeat);
            // FIXME > ZOOM VALUE OVER-RIDDEN BY BOUNDS
            _mapboxPanToGeoJSON(map, gjCenterCoords, gjBounds, {zoom:pollAVGSettingsValues().clusterMap.zoomValue, pitch:0, bearing:0, boundsPadding:0});
            
         } catch (panClusterMapErr) {
            console.error(`panClusterMapErr: ${panClusterMapErr.message}`);
         };
      };

      const drawFeatureColl = (geojson) => {
         _mapboxDrawFeatFeatColl({mapboxMap: CLUSTER_PLOTS_MAP, featOrFeatColl: geojson});
      };

      const drawFeatures = (geojson, useBuffer) => {
         geojson.features.forEach((clusterPlot,idx)=>{
            _mapboxDrawFeature(CLUSTER_PLOTS_MAP, clusterPlot, useBuffer, {featureIdx: idx, bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER, bufferUnits: pollAVGSettingsValues().distanceUnits});
         });
      };

      const drawFeatureLabels = (geojson, useBuffer) => {
         geojson.features.forEach((clusterPlot,idx)=>{
            _mapboxDrawLabels(CLUSTER_PLOTS_MAP, clusterPlot, useBuffer, {featureIdx: idx, bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER, areaUnits: pollAVGSettingsValues().areaUnits});
         });
      };
      
      const panBaseMap__ = (geojson) => {
         _leafletRenderGeojson(AVG_BASE_MAP, geojson, {zoomLevel: APP_STATE.CONFIG_DEFAULTS.LEAFLET_ADMIN_LEVEL_3_ZOOM})
      };

      const createMapboxPopup = (map, lnglat, popupMarkup) => {
         _openMapboxPopup(map, lnglat, popupMarkup);
      };
      
      return {
         // TODO > CHANGE "geojson" TO "featureCollection"
         // TODO > USE DEP. INJ. TO PASS THE MAPBOX MAP
         renderPopup: (map, lnglat, HTMLMarkup) => {
            createMapboxPopup(map, lnglat, HTMLMarkup);
         },         
         panClusterPlotsMap: (geojson) => {
            panToClusterGeoJSON(geojson);
         },
         panClusterPlotsFeatMap: (map, geoJSONFeat) => {
            panToClusterFeat(map, geoJSONFeat);
         },
         renderCluster: (geojson) => {
            drawFeatureColl(geojson);
         },
         renderClusterPlots: (geojson) => {
            drawFeatures(geojson);
         },
         renderClusterPlotLabel: (geojson) => {
            drawFeatureLabels(geojson);
         },
         renderBaseMap: (geojson) => {
            panBaseMap__(geojson);
         },
         renderEverythingNow: (geojson, {useBuffer=false}) => {
            
            const previousRenderedGJ = APP_STATE.retreiveLastRenderedGJ();
            console.info({previousRenderedGJ});

            panToClusterGeoJSON(geojson);
            drawFeatureColl(geojson);
            drawFeatures(geojson, useBuffer);
            drawFeatureLabels(geojson, useBuffer);
            panBaseMap__(geojson);

            APP_STATE.saveRenderedGeojson(geojson);
         },
      };

   } catch (renderMapsErr) {
      console.error(`renderMapsErr: ${renderMapsErr.message}`)
   };
   
})();


// RESULT TITLE MAIN PARENT SEQ.
function clickedResultContainerSeq(resultItemDiv, otherResultItems) {
   
   // scroll the result into view
   resultItemDiv.scrollIntoView({
      behavior: `smooth`,
      block: `start`,
      inline: `nearest`,
   });
   // resultItemDiv.scrollIntoView(true);
   
   // remove "active" class from other result items
   otherResultItems.forEach(result => {
      if (result !== resultItemDiv) {
         removeClass(result, `is-active`);
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
         if (slaveCheckbox.checked === false) { master.checked = false}
      });
   });
   // TODO
   // toggle master to "on" if ALL slaves are "on"
};


// ACTIVATE THE DIV THAT DISPLAYS APP ACTIVITY
function toggleActivityIndicator(indDivWrapper, indDiv) {
   indDivWrapper.classList.toggle(`reveal`);
   indDiv.innerHTML = ``;
   indDiv.classList.toggle(`spinner-grow`);
   indDiv.classList.toggle(`text-light`);
   indDiv.classList.toggle(`spinner-grow-sm`);
};


// CALC. TIME TO EXE. A FN. && DISPLAY INDICATOR
const MonitorExecution = (function() {

	let returnedData, executionMs;

	return {

		execute: async function(callback) {
						
			toggleActivityIndicator(getDOMElements().appActivityIndWrapper, getDOMElements().appActivityInd);
	
         console.log(`%c This funciton [${callback}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

			toggleActivityIndicator(getDOMElements().appActivityIndWrapper, getDOMElements().appActivityInd);
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


function generateModalMarkup (clusterProps) {
   const HTMLMarkup = `
         <div class="result-item-modal-header flex-row-center-btw">
            <span>Block AGC</span><span>25 Ha.</span>
         </div>
         <div class="result-item-modal-title flex-row-center-btw">
            <span id="modal_title">${clusterProps.clusterName}</span>
            <button
               class="btn-close"
               id="result_item_modal_close_btn"
               type="button"
               aria-label="close"
            ></button>
         </div>
         <div class="result-item-modal-body flex-col-center">
            <span class="modal-person-avatar">
               <img
                  class="rounded-circle"
                  src="./assets/images/users/img_avatar2.png"
                  alt="Modal Avatar" />
            </span>
            <span class="modal-person-details flex-col-center">Abdulsalam Dansuki, President</span>
            <span class="modal-person-contact flex-row-center-btw">
               <span>08022242548</span><span>mallam-dan@gmail.com</span>
               <span>Directions</span></span>
         </div>
         <div class="result-item-modal-subtext">
            <span>
               Prim. commodity: Maize, Rice . Clay soil . No irriation . Closest PMRO
               site 40km away . No power . Closest market 10km away . No processing
               capability . Funded June 17, 2019. 13.3 hectares unused.</span>
         </div>
         <div class="result-item-modal-footer flex-row-center-btw">
            <span>200 Farmers</span><span>Kastina State</span>
         </div>
   `;
   return HTMLMarkup;
};


// open modal for clicked result
function activateResultModal(modalDiv, featureCollection) {

   modalDiv.innerHTML = ``;

   const clusterProps = _GetClusterProps(featureCollection);

   modalDiv.innerHTML += generateModalMarkup(clusterProps);

   blockElement(modalDiv);

   // MODAL CLOSE BTN.
   getDOMElements().resultModalCloseBtn.addEventListener(`click`, () => {
      hideElement(getDOMElements().resultModalDiv);
   });

   // TODO > MODAL TITLE CLICK EVENT HANDLER

   // TODO > MODAL AVATAR CLICK EVENT HANDLER
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
         if (this.currentTarget.id === `cluster_feat_${clusterFeatures[i].geometry._id}`) {
            RenderMaps.panClusterPlotsFeatMap(CLUSTER_PLOTS_MAP, clusterFeatures[i]);
            RenderMaps.renderPopup(CLUSTER_PLOTS_MAP, _TurfHelpers.getLngLat(clusterFeatures[i]));
         };
      };

      _ManipulateDOM.addRemoveClass(this.currentTarget, 'selected');

   } catch (cardClickSeqErr) {
      console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
   };
};


async function populateClusterFeatsSidebar(clusterFeatColl) {
   
   try {

      if (clusterFeatColl) {

         // 1.
         // SANITIZE COORDS.
         clusterFeatColl = _sanitizeFeatCollCoords(clusterFeatColl);

         // get the features
         const clusterFeatures = clusterFeatColl.features;

         // remove prev. rendered feats.
         const listingWrapper = getDOMElements().clusterFeatsListingDiv
         listingWrapper.innerHTML = ``
         
         // 2.
         for (let idx = 0; idx < clusterFeatures.length; idx++) {

            let clusterFeature = clusterFeatures[idx];
            
            // _CheckGeoJSON.isValidFeat(clusterFeature+1); // TODO <

            // FIXME > _stringifyPropValues NOT WORKING
            // console.log(_stringifyPropValues(_GetClusterFeatProps(idx, clusterFeature)));
            // const clusterFeatCard = await _ClusterFeatMarkupGenerator.getClusterFeatDiv(_stringifyPropValues(_GetClusterFeatProps(idx, clusterFeature)));
            const clusterFeatCard = await _ClusterFeatMarkupGenerator.getClusterFeatDiv(_GetClusterFeatProps(idx, clusterFeature));

            // SANDBOX
            // ASSIGN A UNIQE ID TO THE CARD DIV
            clusterFeatCard.id = `cluster_feat_${clusterFeature.geometry._id}`;

            // SANDBOX
            // REMOVE
            /* Add the link to the individual listing created above. */
            // const featTitleLink = clusterFeatCard.querySelector(`.feat-admin1-title`);
            // featTitleLink.id = `cluster_feat_${clusterFeature.geometry._id}`;

            clusterFeatCard.addEventListener('click', e => { featCardClickSeq.call(e, clusterFeatures); });

            _populateDataset(clusterFeatCard, `clusterfeatdatastream`, JSON.stringify(clusterFeature));

            _ManipulateDOM.appendList(listingWrapper, clusterFeatCard);
         };
      };
      
   } catch (clusterFeatsSidebarErr) {
      console.error(`clusterFeatsSidebarErr: ${clusterFeatsSidebarErr.message}`);
   };
};


function clusterTitleClickSeq(evtObj) {

   evtObj.preventDefault();

   // get the main parent container
   const resultContainerDiv = getParentElement(evtObj.target, {parentLevel: 3});

   // get the siblings of the main parent container
   const adjacentResultDivs = getSiblingElements(resultContainerDiv);

   // get the geojson for that result
   const clusterGeoJSON = JSON.parse(_getDataset(resultContainerDiv));

   // TODO > VALIDATE GJ. HERE
   if (clusterGeoJSON) {
      
      // 1.
      activateResultModal(getDOMElements().resultModalDiv, clusterGeoJSON);

      // 1b.
      // render cluster feature cards.
      populateClusterFeatsSidebar(clusterGeoJSON);
      
      // 2.
      RenderMaps.renderEverythingNow(clusterGeoJSON, {useBuffer: true});
      
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


// FIXME > THIS SHOULD FIRE ON FILTER INPUT CHANGES????
function appendResultsSidebar(resultItemDiv) {
   const dividerDiv = _createDiv([`h-divider-grey-100`, "fuck-chicken"]);
   getDOMElements().resultsListWrapper.appendChild(resultItemDiv);
   getDOMElements().resultsListWrapper.appendChild(dividerDiv);
};


function populateResultsSidebar(dbCollection) {

   try {
      
      // CREATE NEW RESULT DIVS FOR EACH LEGACY CLUSTER
      if (dbCollection) {

         // TODO > FILTER OUT UNWANTED LEGACY AGCS
         dbCollection = dbCollection.slice(1)

         for (let idx = 0; idx < dbCollection.length; idx++) {

            let clusterGeoJSON = dbCollection[idx];

            // 1.
            // CONVERT STRING COORDS. IN ANY FEAT. TO INTEGER COORDS.
            clusterGeoJSON = _sanitizeFeatCollCoords(clusterGeoJSON);
   
            // 2.
            const clusterResultDiv = _ClusterMarkupGenerator.getClusterResultDiv(clusterGeoJSON);

            // 2a.
            _populateDataset(clusterResultDiv, APP_STATE.CONFIG_DEFAULTS.CLUSTER_CARD_DATA_ATTR_NAME, JSON.stringify(clusterGeoJSON));

            // append result item div to sidebar
            appendResultsSidebar(clusterResultDiv);
         };
      };

   } catch (popResultsSidebarErr) {
      console.error(`popResultsSidebarErr: ${popResultsSidebarErr}`)
   };
};


function DOMLoadEvents() {
   
   try {

      window.addEventListener(`DOMContentLoaded`, async (windowObj) => {

         // save the UI default settings
         APP_STATE.saveDefaultSettings(pollAVGSettingsValues());
                  
         // await downloadDBCollections(windowObj);

         const legacyClustersColl = _TraverseObject.evaluateValue(APP_STATE.returnDBCollections(), [0], "data", "legacy_agcs");
         
         populateResultsSidebar(legacyClustersColl);
   
         // ADD CLICK HAND. AFTER DIVS HAVE BEEN MADE
         resultTitleClickHandler(getDOMElements().resultTitleDivs);
      });


   } catch (DOMEventsErr) {
      console.error(`DOMEventsErr: ${DOMEventsErr}`);
   };
};


// FIXME > DON'T USE JQUERY
// SETTINGS SIDEBAR TOGGLE
$(document).ready(function () {
   $("#avg_settings_sidebar_toggle_btn").on("click", function () {
      $("#agv_settings_sidebar").toggleClass("active");
   });
   $("#settings_sidebar_close").on("click", function () {
      $("#agv_settings_sidebar").toggleClass("active");
   });
});


// DOM ELEM. EVT. LIST'NRS.
function AddEventListeners() {

   try {

      // SANDBOX
      // SETTINGS CHANGE EVENT SEQ.
      getAreaUnitsRadios().forEach(radio => {
         radio.addEventListener(`change`, async (e) => {
            RenderMaps.renderClusterPlotLabel(APP_STATE.retreiveLastRenderedGJ());
         });
      });

      // CHANGE CLUSTER PLOTS MAP STYLE
      getDOMElements().plotsMapStyleRadios.forEach(radio => {
         radio.addEventListener(`change`, _switchMapboxMapLayer)
      })

      // RESULT ITEM TITLE CLICK HAND.
      resultTitleClickHandler(getDOMElements().resultTitleDivs);
      
      // RESULT ITEM CHECKBOX BEH.
      const slaveResultCheckboxes = getResultCheckboxes().resultItemCheckboxes;
      masterSlaveControl(getResultCheckboxes().masterResultCheckbox, slaveResultCheckboxes);

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
         const slaveCheckboxes = getAdjacentInputs(masterCheckbox);
         masterSlaveControl(masterCheckbox, slaveCheckboxes);
      });

      // EXPAND APP SIDEBAR
      getDOMElements().sidebarExpandBtn.addEventListener(`click`, ()=>{
         getDOMElements().appSidebar.classList.toggle(`expanded`);
      });
      
   } catch (addEvtListenErr) {
      console.error(addEvtListenErr.message);
   };
};


export {DOMLoadEvents, AddEventListeners};