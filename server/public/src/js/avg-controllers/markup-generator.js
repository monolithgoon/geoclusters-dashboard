import { _GetClusterProps, _GetClusterFeatProps } from "../cluster-props-adapter.js";
import { _createCard, _createDiv, _joinWordsArray, _populateDataset } from "../_utils.js";


export const _ClusterMarkupGenerator = ((classList) => {

   try {
      
      const initContainerDiv = function() {
         return _createDiv(classList);
      };
   
      const getClusterProps = function(propsGen, featureCollection) {

         return propsGen(featureCollection);
      };
   
      const populateMarkup = function(props) {
         const HTMLMarkup = `
            <div class='result-item-header flex-row-start'>
               <div class='result-item-titles flex-col-start flex-1'>
                  <a class='result-item-title' title='Geo Cluster Name' href='#' title='Geo Cluster Name'>${props.clusterName}</ac>
                  <small class='result-item-subtitle'>
                     <a>${props.clusterAdminLvl3}, ${props.clusterAdminLvl2}</a>
                  </small>
               </div>
               <div class="result-item-controls flex-row-center-end">
                  <div class="btn-group">
                     <button class="btn btn-outline btn-sm dropdown-toggle" id="dropdownMenuClickableInside" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">...</button>
                     <ul class="dropdown-menu" aria-labelledby="dropdownMenuClickableInside">
                        <li><a class="dropdown-item" href="#">Copy Map Preview Link</a></li>
                        <li><a class="dropdown-item" href="#">Open In New Tab</a></li>
                        <li><a class="dropdown-item" href="#">Share Cluster Details</a></li>
                     </ul>
                  </div>
                  <input class="form-check-input result-item-checkbox" id="select_result_item_chk_25" type="checkbox" value="resultItemCheckbox25" aria-label="select result checkbox">
            </div>
            </div>
            <div class="result-item-body flex-col-start">
               <div class="result-item-pill">
                  <span id="cluster_num_features">${props.clusterFeatsNum} farmers</span>
                  <span>•</span>
                  <span id="cluster_area">${props.clusterArea} hectares</span>
               </div>
               <a href="#" id="cluster_gov_admin1">AGC President ${_joinWordsArray(Object.values(props.clusterGovAdmin1))}</a>
            </div>
            <div class="result-item-footer">
               <span>
                  <img src="https://img.icons8.com/small/16/000000/point-objects.png" alt="Cluster Coords.">
               </span>
               <span>
                  <a href="" id="cluster_coords">5.3366065°E 6.0205548°N</a>
               </span>
               <span>
                  <img src="https://img.icons8.com/material-two-tone/13/small/spinach.png" alt="Cluster Unused Land">
               </span>
               <span id="cluster_unused_land">${props.clusterUnusedArea}</span>
               <span></span>
               <span></span>
               <span></span>
            </div>
         `;
         return HTMLMarkup;
      };
      
      const clusterFeatMarkup = ``;
   
      return {
   
         getClusterResultDiv: function(featureCollection) {
            const div = initContainerDiv();
            const clusterProps = getClusterProps(_GetClusterProps, featureCollection);
            div.innerHTML = populateMarkup(clusterProps);
            return div;
         },
      };

   } catch (clusterMarkupGenErr) {
      console.error(`clusterMarkupGenErr: ${clusterMarkupGenErr.message}`);
   };

})(["result-item", "flex-col-start"]);


export const _ClusterFeatMarkupGenerator = ((classList) => {

   try {
      
      const initContainerDiv = function() {
         return _createCard(classList);
      };
   
      // const getFeatureProps = function(featPropsGen, feature) {
      //    return featPropsGen(feature);
      // };

      const populateMarkup = function(props) {
         console.log(props.featureAdmin1ID)
         const HTMLMarkup = `
            <div class="card-content-wrapper">
               <div class="card-media-wrapper">
                  <div class="plot-owner-avatar">
                     <img
                        src="./assets/images/plot-owners/icons8-person-48.png"
                        alt="Plot Owner Avatar"/>
                  </div>
               </div>
               <div class="card-text-wrapper">
                  <div class="card-text-top">
                     <div class="main-card-text">
                        <span class="flex-center justify-start">${props.featureAdmin1.adminTitle1}</span>
                        <span>4.40435°E 12.034462°N</span>
                     </div>
                     <div class="card-pills">
                        <span class="flex-row-center">Plot ${props.featureIndex}</span>
                        <span class="flex-row-center">${props.featureArea} ha.</span>
                     </div>
                  </div>
                  <div class="card-text-bottom">
                     <div class="flex-row-center">
                        <span>FARMERID</span><span>${(props.featureAdmin1ID).slice(-2)}</span>
                     </div>
                     <div class="flex-row-center">
                        <span class="flex-row-center">VASTID</span>
                        <span class="flex-row-center">${props.featureID}</span>
                     </div>
                  </div>
               </div>
            </div>
         `;
         return HTMLMarkup;
      };
   
      return {
   
         getClusterFeatDiv: async function(featureProps) {
            const div = initContainerDiv();
            // const featProps = getFeatureProps(_GetClusterFeatProps, feature);
            div.innerHTML = populateMarkup(featureProps);
            return div;
         },   
      };
      
   } catch (featMarkupGenErr) {
      console.error(`featMarkupGenErr: ${featMarkupGenErr.message}`);
   };

})(["cluster-feature-card"]);