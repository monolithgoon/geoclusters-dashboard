import { _GetClusterProps, _getClusterFeatProps } from "../cluster-props-adapter.js";
import { _createCard, _createDiv, _joinWordsArray } from "../_utils.js";


export const _GenerateClusterMarkup = ((classList) => {

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
                        <li><a class="dropdown-item" href="#">Copy Coordinates</a></li>
                        <li><a class="dropdown-item" href="#">Open Cluster Map</a></li>
                        <li><a class="dropdown-item" href="#">Share Cluster</a></li>
                     </ul>
                  </div>
                  <input class="form-check-input result-item-checkbox" id="select_result_item_chk_25" type="checkbox" value="resultItemCheckbox25" aria-label="select result checkbox">
            </div>
            </div>
            <div class="result-item-body flex-col-start">
            <a href="#" class="admin1-name" id="cluster_gov_admin1">President ${_.startCase(_joinWordsArray(Object.values(props.clusterGovAdmin1)))}</a>
            <div class="result-item-pill">
               <span id="cluster_num_features">${props.clusterFeatsNum} Farmers</span>
               <span>•</span>
               <span id="cluster_area">${props.clusterArea} Hectares</span>
               <span>•</span>
               <span id="cluster_area">${props.clusterArea} Cassava</span>
            </div>
            </div>
         `;
         return HTMLMarkup;
      };
         
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


export const _GenClusterModalMarkup = (() => {
   try {
      const populateMarkup = function(props) {
         const HTMLMarkup = `
            <div class="result-item-modal-header flex-row-center-btw">
               <span>Block AGC</span><span>25 Ha.</span>
            </div>
            <div class="result-item-modal-title flex-row-center-btw">
               <span id="modal_title">${props.clusterName}</span>
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
                     src="/assets/images/users/img_avatar2.png"
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

      return {

         getInnerMarkup: (modalProps) => {
            return populateMarkup(modalProps);
         },
      };

   } catch (modalMarkupGenErr) {
      console.error(`modalMarkupGenErr: ${modalMarkupGenErr}`)
   };
})();


export const _GenerateClusterFeatMarkup = ((classList) => {

   try {
      
      const initContainerDiv = function() {
         return _createCard(classList);
      };

      
      const populateMarkup = function(props) {
         const HTMLMarkup = `
            <div class="card-content-wrapper">
               <div class="card-media-wrapper">
                  <div class="feat-admin-avatar">
                     <img
                        src="/assets/icons/icons8-person-48.png"
                        alt="Plot Owner Avatar"/>
                  </div>
               </div>
               <div class="card-text-wrapper">
                  <div class="card-text-top">
                     <div class="main-card-text">
                        <span>
                           <a class="feat-admin1-title flex-center justify-start" href="#">${_.startCase(_joinWordsArray(Object.values(props.featureAdmin.admin1.titles)))}</a>
                        </span>
                        <span>4.40435°E 12.034462°N</span>
                     </div>
                     <div class="card-pills">
                        <span class="flex-row-center">Plot ${props.featureIndex}</span>
                        <span class="flex-row-center">${props.featureArea} ha.</span>
                     </div>
                  </div>
                  <div class="card-text-bottom">
                     <div class="flex-row-center">
                        <span>FID</span><span>${`${(props.featureAdmin.admin1.id)}`.slice(0)}</span>
                     </div>
                     <div class="flex-row-center">
                        <span class="flex-row-center">VASTID</span>
                        <span id="feat_card__feat_id" class="flex-row-center">${`${props.featureID}`.slice(0)}</span>
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
            div.innerHTML = populateMarkup(featureProps);
            return div;
         },   
      };
      
   } catch (featMarkupGenErr) {
      console.error(`featMarkupGenErr: ${featMarkupGenErr.message}`);
   };

})(["cluster-feature-card"]);


export const _clusterFeatPopupMarkup = (props) => {

   try {
      
      const HTMLMarkup = `
         <div class="mapboxgl-popup-body flex-row-center">
         
            <div class="mapboxgl-popup-media-wrapper">
               <img src="${props.featureAdmin.admin1.photoURL}" alt=Feature Admin Photo" style="max-width:100%; opacity: 1;">
            </div>
      
            <div class="mapboxgl-popup-text-wrapper">
               <span class="mapboxgl-popup-title">${_.startCase(_joinWordsArray(Object.values(props.featureAdmin.admin1.titles)))}</span>
               <span>VASTID • ${undefined}</span>
               <span>Lat ${undefined}°N Lng ${undefined}°E </span>
            </div>      

         </div>`

      return HTMLMarkup;

   } catch (featPopupMarkupErr) {
      console.error(`featPopupMarkupErr: ${featPopupMarkupErr.message}`)
   };
};


export const _leafletMarkerMarkup = (props) => {
   const HTMLMarkup =  `
      <div class= "plot-metadata-label--chunk-size"> 
         <span> ${props.featureArea} hectares </span>
         <span> ${(props.featureArea * 2.47105).toFixed(1)} acres </span> 
      </div>
      <div class="metadata-label--owner-info"> 
         <span> Plot-${props.featureIndex} </span>
         <span> ${_.startCase(_joinWordsArray(Object.values(props.featureAdmin.admin1.titles)))} </span>
      </div>
      <div class="metadata-label--turn-by-turn" id="metadata_label_turn_by_turn">
         <a href="#" role="button" title="Plot boundary turn-by-turn directions" aria-label="Plot boundary turn-by-turn directions"></a>
            <span >
               <i id="" class="fas fa-route"></i>
            </span>
      </div>`
   return HTMLMarkup;
}