'use strict'
import { getDatastreamData, APIHTTPRequest, queryAPI } from "./data-controller.js";
import { _mapboxRenderGeojson, _mapboxDrawFeature, _leafletRenderGeojson, _mapboxDrawLabels } from "../geojson-render.js";
import { AVG_BASE_MAP, CLUSTER_PLOTS_MAP } from "./maps-controller.js";
import { _getCheckedRadio, _calcPolyArea } from "../_utils.js";
import { APP_STATE } from "./state-controller.js";
import { _getClusterProps, _getClusterFeatureProps } from "../cluster-props-adapter.js";

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
   
   const datastreamDiv = document.getElementById('api_data_stream');
   const apiTriggerBtn = document.getElementById('results_scroll_top_button');
   
   const resultsCountDiv = document.getElementById('results_count');
   const resultsStatus = document.getElementById('results_status');

   const resultModal = document.getElementById(`result_item_modal`);
   const resultModalCloseBtn = document.getElementById(`result_item_modal_close_btn`);
   const resultItemDivs = document.querySelectorAll(`.result-item`);
   const resultTitleDivs = document.querySelectorAll(`.result-item-title`);

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
      datastreamDiv,
      resultsCountDiv,
      resultsStatus,
      resultItemDivs,
      resultTitleDivs,
      resultModal,
      resultModalCloseBtn,
      apiTriggerBtn,
   };
}

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
   for (const radio of areaUnitsRadios) {
      if (radio.checked) { APP_STATE.saveDefaultAreaUnitRadio(radio) };
   };
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
function pollAppSettingsValues() {

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
}

// TODO > MOVE TO _utils.js
function blockElement(element) {
   element.style.display = `block`;
};

// TODO > MOVE TO _utils.js
function hideElement(element) {
   element.style.display = `none`;
};

// TODO > MOVE TO _utils.js
function toggleClassList(element, styleClass) {
   if (element && element.nodeType === 1 ) {
      element.classList.toggle(styleClass);
   };
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
         }
      }
   }

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
      }
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
   }
   
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

   const drawFeatureColl = (geojson) => {
      _mapboxRenderGeojson({mapboxMap: CLUSTER_PLOTS_MAP, featOrFeatColl: geojson});
   };
   const drawFeature = (geojson) => {
      geojson.features.forEach((clusterPlot,idx)=>{
         _mapboxDrawFeature(CLUSTER_PLOTS_MAP, clusterPlot, {featureIdx: idx, bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER, bufferUnits: pollAppSettingsValues().distanceUnits});
      });
   };
   const drawFeatureLabels = (geojson) => {
      geojson.features.forEach((clusterPlot,idx)=>{
         _mapboxDrawLabels(CLUSTER_PLOTS_MAP, clusterPlot, {featureIdx: idx, bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER, areaUnits: pollAppSettingsValues().areaUnits});
      });
   };
   const panBaseMap__ = (geojson) => {
      _leafletRenderGeojson(AVG_BASE_MAP, geojson, {zoomLevel: APP_STATE.CONFIG_DEFAULTS.LEAFLET_ADMIN_LEVEL_3_ZOOM})
   };

   try {
      
      return {
         renderClusterPlotsMap: (geojson) => {
            drawFeatureColl(geojson);
         },
         renderClusterPlot: (geojson) => {
            drawFeature(geojson);
         },
         renderClusterPlotLabel: (geojson) => {
            drawFeatureLabels(geojson);
         },
         renderBaseMap: (geojson) => {
            panBaseMap__(geojson);
         },
         renderEverythingNow: (geojson) => {
            const previousRenderedGJ = APP_STATE.retreiveLastRenderedGJ();
            console.log({previousRenderedGJ});
            drawFeatureColl(geojson);
            drawFeature(geojson);
            drawFeatureLabels(geojson);
            panBaseMap__(geojson);
            APP_STATE.saveRenderedGeojson(geojson);
         },
      };

   } catch (renderMapsErr) {
      console.error(`renderMapsErr: ${renderMapsErr.message}`)
   };
   
})();

// RESULT TITLE MAIN PARENT SEQ.
function clickedResultWrapperSeq(resultItemDiv, otherResultItems) {
   
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
   toggleClassList(resultItemDiv, `is-active`);
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

function DOMLoadEvents() {
   
   try {
      
      //
      $(`api_data_stream`).ready(()=> {
         const datasetName = `geoclustersdatastream`
         const datastreamData = JSON.parse(getDatastreamData(getDOMElements().datastreamDiv, datasetName));
         console.log(datastreamData);
      });
      
      //
      window.addEventListener(`DOMContentLoaded`, async (e) => {

         // save the UI default settings
         APP_STATE.saveDefaultSettings(pollAppSettingsValues());
         console.log(APP_STATE.retreiveDefaultSettings());
         
         for (const apiCollectionPath of APP_STATE.CONFIG_DEFAULTS.API_COLLECTION_PATHS) {
            
            const dbQueryStr = APP_STATE.CONFIG_DEFAULTS.LEGACY_CLUSTER_QUERY_STR;
            
            // create an intermediate "pipeline"?? fn.
            const apiDataQuery = function() {
               return queryAPI.call(e, APP_STATE.CONFIG_DEFAULTS.API_HOST_LOCAL, apiCollectionPath, {});
            };
      
            // EXECUTE THE API CALL
            await MonitorExecution.execute(apiDataQuery);
   
           MonitorExecution.getExecutionTime();
            
            // SAVE THE RETURNED DATA
            APP_STATE.saveDBCollection(apiCollectionPath, MonitorExecution.getData());

            console.info(MonitorExecution.getData());
            // console.log(...APP_STATE.returnDBCollections());   
         };
      });

      // SETTINGS SIDEBAR TOGGLE
      $(document).ready(function () {
         $("#avg_settings_sidebar_toggle_btn").on("click", function () {
            $("#agv_settings_sidebar").toggleClass("active");
         });
         $("#settings_sidebar_close").on("click", function () {
            $("#agv_settings_sidebar").toggleClass("active");
         });
      });

   } catch (DOMEventsErr) {
      console.error(`DOMEventsErr: ${DOMEventsErr}`);
   };
};

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
      console.log(APP_STATE.retreiveDefaultAreaUnitRadio());

      // RESULT ITEM TITLE CLICK
      for (const resultTitle of getDOMElements().resultTitleDivs) {
         
         resultTitle.addEventListener(`click`, async (e) => {

            e.preventDefault();
            
            // get the main parent container
            const resultItemWrapper = getParentElement(e.target, {parentLevel: 3});
            // get the siblings of the main parent container
            const adjacentResultItems = getSiblingElements(resultItemWrapper);
            // get the geojson for that result
            const clusterGeoJSON = JSON.parse(getDatastreamData(resultItemWrapper, `geoclusterdatastream`));

            // 3.
            clickedResultWrapperSeq(resultItemWrapper, adjacentResultItems);
            // 1.
            activateResultModal(getDOMElements().resultModal, clusterGeoJSON);
            // 2.
            console.info(pollAppSettingsValues());
            // await renderMaps(clusterGeoJSON);
            RenderMaps.renderEverythingNow(clusterGeoJSON);
            // 4. 
            APP_STATE.saveRenderedGeojson(clusterGeoJSON);
            
         });
      };

      // RESULT ITEM CHECKBOX BEH.
      const slaveResultCheckboxes = getResultCheckboxes().resultItemCheckboxes;
      masterSlaveControl(getResultCheckboxes().masterResultCheckbox, slaveResultCheckboxes);

      // TODO
      // RESULT ITEM CHECKBOX EVENT SEQ.

      // MODAL CLOSE BTN.
      getDOMElements().resultModalCloseBtn.addEventListener(`click`, () => {
         hideElement(getDOMElements().resultModal);
      });

      // TODO
      // FILTER CHECKBOX EVENT SEQ.
      getFilterCheckboxes().filterCheckboxes.forEach(filterCheckbox => {
         filterCheckbox.addEventListener(`change`, async (e)=>{
            const checkboxLabelTxt = e.target.labels[0].innerText; 
            if (e.target.checked) {
               console.log(`%c ${checkboxLabelTxt} checked`, `color: white; background-color:blue;`);
            } else {
               console.log(`%c ${checkboxLabelTxt} un-checked`, `color: white; background-color:green;`);
            }
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

      // SANDBOX > API BTN TRIGGER EVENT SEQ.
      // pass params. using call
      // getDOMElements().apiTriggerBtn.addEventListener(`click`, evt => APIHTTPRequest.call(evt.target, queryString));
      // pass params. using bind
      const queryString = `?fields=properties,features.properties.plot_owner_bvn,`      
      const triggerBtn = getDOMElements().apiTriggerBtn;
      triggerBtn.addEventListener(`click`, APIHTTPRequest.bind(triggerBtn, queryString), false);
      
   } catch (addEvtListenErr) {
      console.error(addEvtListenErr.message);
   };
;}

// FIXME > THIS SHOULD FIRE ON INPUT CHANGES????
function populateModal(jsonObj) {

   // renderJSONOnDOM(jsonObj, domElement);

   jsonObj.forEach(legacyAGC => {

      const legacyAGCDiv = document.createElement('div');
      legacyAGCDiv.className = 'result-item flex-col-start';
      document.getElementById('results_list_wrapper').appendChild(legacyAGCDiv);

      const legacyAGCTitleDiv = document.createElement('a')
      const legacyAGCSubtitleDiv = document.createElement('small')
      legacyAGCTitleDiv.innerText = legacyAGC.properties.geo_cluster_name;
      legacyAGCTitleDiv.className = `result-item-titles`;
      legacyAGCSubtitleDiv.innerText = legacyAGC.properties.geo_cluster_total_features
      
      legacyAGCDiv.appendChild(legacyAGCTitleDiv);
      legacyAGCDiv.appendChild(legacyAGCSubtitleDiv);

      const horizontalDividerDiv = document.createElement('div');
      horizontalDividerDiv.className = `h-divider-grey-50`;
      legacyAGCDiv.insertAdjacentHTML(`afterend`, horizontalDividerDiv);
   });

};

// open modal for clicked result
function activateResultModal(modalElement, featureCollection) {
   blockElement(modalElement);
   console.log(_getClusterProps(featureCollection));
   featureCollection.features.forEach(feature => {
      console.log(_getClusterFeatureProps(feature))
   })
   // populateModal(_getClusterProps(featureCollection));
};

export {DOMLoadEvents, AddEventListeners};