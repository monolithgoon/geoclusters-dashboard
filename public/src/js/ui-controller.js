'use strict'

function GetFilterCheckboxes() {

   const filterCheckboxes = document.querySelectorAll(`.results-filter-checkbox[type=checkbox]`);

   const filterCheckboxMasters = document.querySelectorAll(`.results-filter-checkbox.master-checkbox[type=checkbox]`)
   
   return {
      filterCheckboxes,
      filterCheckboxMasters,
   }
}

function getAPITriggers() {
   const apiTrigger = document.getElementById('results_scroll_top_button')
   return apiTrigger
}

function GetSiblingElements(element) {

   // var for collecting siblings
   let siblingElements = [];

   // if no parent, return no sibling
   if (!element.parentNode) return siblingElements;

   // get fist child of parent node
   let siblingElement = element.parentNode.firstChild 

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
            console.log(adjacentInput);
         }
      }
      parentElement = parentElement.nextSibling;
   }

   return siblingElements
}

function GetAdjacentInputs(inputElement) {
   
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
}
   
function AddEventListeners() {
         
   // CHECKBOX EVENT
   GetFilterCheckboxes().filterCheckboxes.forEach(filterCheckbox => {
      filterCheckbox.addEventListener(`change`, (e)=>{
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

   // CONTROL SLAVE CHECKBOXES WITH MASTER CHECKBOX EVENT
   GetFilterCheckboxes().filterCheckboxMasters.forEach(masterCheckbox => {
      const slaveCheckboxes = GetAdjacentInputs(masterCheckbox);
      masterCheckbox.addEventListener(`change`, (e)=>{
         if (e.target.checked) {
            slaveCheckboxes.forEach(checkbox => {
               const slaveCheckboxLabelTxt = checkbox.labels[0].innerText;
               // console.log(slaveCheckboxLabelTxt);
               checkbox.checked = true;
            })
         } else {
            slaveCheckboxes.forEach(checkbox => {
               checkbox.checked = false;
            })
         }
      })
      // TOGGLE MASTER TO 'OFF' WHEN SLAVE IS 'OFF'
      slaveCheckboxes.forEach(slaveCheckbox => {
         slaveCheckbox.addEventListener(`change`, (e)=>{
            if (slaveCheckbox.checked === false) { masterCheckbox.checked = false}
         })
      })
   });

   // API BTN TRIGGER EVENT
   getAPITriggers().addEventListener(`click`, () => {
      console.log(`CALLED THE API`)
   });
}

async function passJSONToDOM(jsonObj) {

   // renderJSONOnDOM(jsonObj, domElement);

   jsonObj.forEach(legacyAGC => {

      const legacyAGCDiv = document.createElement('div');
      legacyAGCDiv.className = 'result-item flex-col-start';
      document.getElementById('results_list_wrapper').appendChild(legacyAGCDiv);

      const legacyAGCTitleDiv = document.createElement('a')
      const legacyAGCSubtitleDiv = document.createElement('small')
      legacyAGCTitleDiv.innerText = legacyAGC.properties.geo_cluster_name;
      legacyAGCTitleDiv.className = `result-item-title`;
      legacyAGCSubtitleDiv.innerText = legacyAGC.properties.geo_cluster_total_features
      
      legacyAGCDiv.appendChild(legacyAGCTitleDiv);
      legacyAGCDiv.appendChild(legacyAGCSubtitleDiv);

      const horizontalDividerDiv = document.createElement('div');
      horizontalDividerDiv.className = `h-divider-grey-50`;
      legacyAGCDiv.insertAdjacentHTML(`afterend`, horizontalDividerDiv);
   });

}

export {AddEventListeners, passJSONToDOM};