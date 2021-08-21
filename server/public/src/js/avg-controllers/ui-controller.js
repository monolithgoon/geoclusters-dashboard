'use strict'
import { _TraverseObject, _getCheckedRadio, _stringifyPropValues, _TurfHelpers, _ManipulateDOM } from "../utils/helpers.js";
import { _sanitizeFeatCollCoords, _ProcessGeoJSON, _getBufferedPolygon } from "../utils/helpers.js";
import { _AnimateClusters } from "../controllers/maps-controller.js";
import { APP_STATE } from "./state-controller.js";
import { _getClusterFeatProps, _GetClusterProps } from "../interfaces/cluster-props-adapter.js";
import { _GenerateClusterFeatMarkup, _GenerateClusterMarkup, _GenClusterModalMarkup } from "./markup-generator.js";
import { _clientSideRouter, _navigateTo } from "../routers/router.js";
import { GET_DOM_ELEMENTS } from "../utils/dom-elements.js";


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
   const clusterTitleDivs = document.querySelectorAll(`.result-item-title`);

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
      clusterTitleDivs,
      clusterFeatsNumEl,
      clusterAreaEl,
      clusterUsedAreaEl,
      clusterUnusedAreaEl,
      featsListingDiv,
      bufferFeatsChkBx,
      renderMultiFeatsChkBx,
   };
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
export const _pollAVGSettingsValues = () => {

   try {
            
      // settings 'keys'
      const baseMapKey = _getCheckedRadio(GET_DOM_ELEMENTS().baseMapRadios).radioValue;
      const plotsMapStyleKey = _getCheckedRadio(GET_DOM_ELEMENTS().plotsMapStyleRadios).radioValue;
      const distanceUnits = _getCheckedRadio(GET_DOM_ELEMENTS().distanceUnitsRadios).radioValue;
      const areaUnits = _getCheckedRadio(GET_DOM_ELEMENTS().areaUnitsRadios).radioValue;
   
      return {
         baseMapKey,
         plotsMapStyleKey,
         distanceUnits,
         areaUnits,

         clusterMap: {
            zoomValue: (GET_DOM_ELEMENTS().clusterMapZoomRange).value,
         },

         bufferFeatsChk: (GET_DOM_ELEMENTS().bufferFeatsChkBx).checked,
         renderMultiFeatsChk: (GET_DOM_ELEMENTS().renderMultiFeatsChkBx).checked,
      };
      
   } catch (pollAppSettingsErr) {
      console.error(`pollAppSettingsErr: ${pollAppSettingsErr.message}`)
   };
};

export const _PollAppSettings = ((dom) => {
   return {
      getValues: () => {

      }
   }
})(GET_DOM_ELEMENTS());


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
         console.log(master.parentNode.style.display);
         _ManipulateDOM.blockElement(master.parentNode);

         if (slaveCheckbox.checked === false) { master.checked = false}
      });
   });

   // TODO
   // toggle master to "on" if ALL slaves are "on"
};


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
         if (this.currentTarget.id === _ProcessGeoJSON.getId(clusterFeatures[i])) {
            _AnimateClusters.panToClusterPlot(clusterFeatures[i], {zoomLevel: _pollAVGSettingsValues().clusterMap.zoomValue});
            _AnimateClusters.renderFeatPopup(_getClusterFeatProps(clusterFeatures[i], i), _TurfHelpers.getLngLat(clusterFeatures[i]));
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
//                if (this.currentTarget.id === _ProcessGeoJSON.getId(clusterFeatures[i])) {
//                      _AnimateClusters.panToClusterPlot(clusterFeatures[i], {zoomLevel: _pollAVGSettingsValues().clusterMap.zoomValue});
//                   _AnimateClusters.renderFeatPopup(mapboxMap, _TurfHelpers.getLngLat(clusterFeatures[i]));
//                };
//             };
      
//             _ManipulateDOM.addRemoveClass(this.currentTarget, 'selected');

//          } catch (cardClickSeqErr) {
//             console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
//          };
//       },
//    };      

// })(CLUSTER_PLOTS_MAP);


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
            clusterFeatCard.id = _ProcessGeoJSON.getId(clusterFeature);

            clusterFeatCard.addEventListener('click', e => { featCardClickSeq.call(e, clusterFeatures); });

            _ManipulateDOM.populateDataset(clusterFeatCard, `clusterfeatdatastream`, JSON.stringify(clusterFeature));

            _ManipulateDOM.appendList(listingWrapper, clusterFeatCard);
         };
      };
      
   } catch (clusterFeatsSidebarErr) {
      console.error(`clusterFeatsSidebarErr: ${clusterFeatsSidebarErr.message}`);
   };
};


function clusterTitleClickSeq(evtObj) {

   evtObj.preventDefault();

   // REMOVE
   console.log(_pollAVGSettingsValues());

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
      _AnimateClusters.renderEverythingNow(clusterGeoJSON, 
         {
            baseMapZoomLvl: APP_STATE.CONFIG_DEFAULTS.LEAFLET_ADMIN_LEVEL_3_ZOOM,
            useBuffer: _pollAVGSettingsValues().bufferFeatsChk, 
            bufferUnits: _pollAVGSettingsValues().distanceUnits,
            bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
            areaUnits: _pollAVGSettingsValues().areaUnits
         }
      );

      // 2b. 
      APP_STATE.saveRenderedGeojson(clusterGeoJSON);
      
      // 3.
      clickedResultContainerSeq(resultContainerDiv, adjacentResultDivs);
   };
};


// REMOVE > DEPRC.
function clusterTitleClickHandler(clusterTitleDivs) {

   try {

      for (const resultTitle of clusterTitleDivs) {

         // CLEAR THE CLICK LISTENERS ON "PRE-LOADED" RESULT DIVS
         resultTitle.removeEventListener(`click`, clusterTitleClickSeq);
            
         resultTitle.addEventListener(`click`, clusterTitleClickSeq);
      };

   } catch (resultTitleClickErr) {
      console.error(`resultTitleClickErr: ${resultTitleClickErr.message}`)
   };
};


function renderClusterSummary(props, dom) {
   dom.clusterFeatsNumEl.innerText = props.clusterFeatsNum;
   dom.clusterAreaEl.innerText = `${+(props.clusterArea).toFixed(1)} ha.`;
   dom.clusterUsedAreaEl.innerText = `${+(props.clusterUsedArea).toFixed(1)} ha.`;
   dom.clusterUnusedAreaEl.innerText = `${+(props.clusterUnusedArea).toFixed(1)} ha.`;
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
            _ManipulateDOM.populateDataset(clusterResultDiv, APP_STATE.CONFIG_DEFAULTS.CLUSTER_RESULT_DATA_ATTR_NAME, JSON.stringify(clusterGeoJSON));
            
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


const DelegateImputsEvents = (dom => {
   
   // ADD RIPPLES TO BTN. CLICKS
   if (dom.buttons) {

      for (const button of dom.buttons) {

         button.addEventListener(`click`, (evt) => {

            const button = evt.currentTarget;
          
            const rippleCircle = document.createElement("span");
            const circleDiameter = Math.max(button.clientWidth, button.clientHeight);
            const circleRadius = circleDiameter / 2;
          
            rippleCircle.style.width = rippleCircle.style.height = `${circleDiameter}px`;
            rippleCircle.style.left = `${evt.clientX - button.offsetLeft - circleRadius}px`;
            rippleCircle.style.top = `${evt.clientY - button.offsetTop - circleRadius}px`;
            rippleCircle.classList.add("ripple-circle");
          
            const rippleEl = button.getElementsByClassName("ripple-circle")[0];
          
            if (rippleEl) rippleEl.remove();
          
            button.appendChild(rippleCircle);      
         });
      };
   };

   // EXPAND DASHBOARD SIDEBAR
   if (dom.sidebarExpandBtn && dom.appSidebar) {
      dom.sidebarExpandBtn.addEventListener(`click`, ()=>{
         dom.appSidebar.classList.toggle(`expanded`);
      });
   };   

   // CHANGE CLUSTER PLOTS AREA UNITS
   if (dom.areaUnitsRadios) {
      const radios = dom.areaUnitsRadios;
      radios.forEach(radio => {
         radio.addEventListener(`change`, async (e) => {
            if (APP_STATE.retreiveLastRenderedGJ()) {
               _AnimateClusters.renderClusterPlotsLabels(APP_STATE.retreiveLastRenderedGJ(), 
                  {
                     useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
                     bufferUnits: _pollAVGSettingsValues().distanceUnits,
                     bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
                     areaUnits: _pollAVGSettingsValues().areaUnits,
                  }
               );
            };
         });
      });
   };

   // FIXME > NOT RENDERING PROPELY
   // CHANGE CLUSTER PLOTS MAP STYLE
   if (dom.plotsMapStyleRadios) {
      dom.plotsMapStyleRadios.forEach(radio => {
         radio.addEventListener(`change`, (evtObj) => {
            _AnimateClusters.refreshClusterPlotsMap(evtObj);
            console.log(APP_STATE.retreiveLastRenderedGJ());
            if (APP_STATE.retreiveLastRenderedGJ()) {
               console.log(`FUCK MIKE LINDEL`)
               // _AnimateClusters.renderClusterPlots(APP_STATE.retreiveLastRenderedGJ(),
               _AnimateClusters.renderEverythingNow(APP_STATE.retreiveLastRenderedGJ(),
                  {
                     useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
                     bufferUnits: _pollAVGSettingsValues().distanceUnits,
                     bufferAmt: APP_STATE.CONFIG_DEFAULTS.RENDERED_PLOT_BUFFER,
                     areaUnits: _pollAVGSettingsValues().areaUnits,
                  }
               );
            };
         });
      });
   };

   // CLUSTER RESULT TITLE CLICK HAND.
   if (dom.clusterTitleDivs) {
      for (const resultTitle of dom.clusterTitleDivs) {
         resultTitle.addEventListener(`click`, clusterTitleClickSeq);
      };
   };

   // CLUSTER RESULT ITEM CHECKBOX BEH.
   if (dom.resultItemCheckboxes && dom.masterResultCheckbox) {
      const slaveResultCheckboxes = dom.resultItemCheckboxes;
      const selectAllResultsChk = dom.masterResultCheckbox
      masterSlaveControl(selectAllResultsChk, slaveResultCheckboxes);
   };

   // TODO > RESULT ITEM CHECKBOX MAP+FILTER EVENT SEQ.

   // FILTER CHECKBOX CHANGE EVENT SEQ.
   if (dom.clusterFilterCheckboxes) {
      const checkboxes = dom.clusterFilterCheckboxes;
      checkboxes.forEach(checkbox => {
         checkbox.addEventListener(`change`, async (e)=>{
            const checkboxLabelTxt = e.target.labels[0].innerText; 
            if (e.target.checked) {
               console.log(`%c ${checkboxLabelTxt} checked`, `color: white; background-color:blue;`);
            } else {
               console.log(`%c ${checkboxLabelTxt} un-checked`, `color: white; background-color:green;`);
            };
            // TODO > WIP
            // filterResults(checkboxLabelTxt);
            // renderFilterPill(checkboxLabelTxt);
         });
      });
   };

   // MASTER FILTER CHECKBOX BEH.
   if (dom.clusterFilterCheckboxMasters) {
      const masterCheckboxes = dom.clusterFilterCheckboxMasters;
      masterCheckboxes.forEach(masterCheckbox => {
         const inputGroupWrapper = _ManipulateDOM.getParentElement(masterCheckbox, {parentLevel: 4})
         const slaveCheckboxes = _ManipulateDOM.getSubordinates(inputGroupWrapper, masterCheckbox, ".form-check-input")
         masterSlaveControl(masterCheckbox, slaveCheckboxes);
      });
   };
         
   return {
      // nothing here
   };

})(GET_DOM_ELEMENTS());