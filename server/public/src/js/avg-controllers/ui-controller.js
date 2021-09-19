'use strict'
import { _TraverseObject, _getCheckedRadio, _stringifyPropValues, _TurfHelpers } from "../utils/helpers.js";
import { _sanitizeFeatCollCoords, _ProcessGeoJSON, _getBufferedPolygon } from "../utils/helpers.js";
import { _RenderEngine } from "../controllers/maps-controller.js";
import { APP_STATE } from "./state-controller.js";
import { _GenerateClusterFeatMarkup, _GenerateClusterMarkup, _GenClusterModalMarkup } from "./markup-generator.js";
import { _clientSideRouter, _navigateTo } from "../routers/router.js";
import { GET_DOM_ELEMENTS } from "../utils/dom-elements.js";


export const _ManipulateDOM = (() => {

	return {

		createDiv: (...styleClasses) => {
			const newDiv = document.createElement('div');
			styleClasses.forEach(member => {
				newDiv.classList.add(member);
			});
			return newDiv;		
		},

		toggleClassList: (element, ...styleClasses) => {
			if (element && element.nodeType === 1 ) {
				styleClasses.forEach(member => {
					element.classList.toggle(member);
				});
			};
		},

		addRemoveClass: (element, classList) => {
			try {
				const activeItem = document.getElementsByClassName(`${classList}`);
				if (activeItem[0]) {
					activeItem[0].classList.remove(`${classList}`);
				};
				element.classList.add(`${classList}`);
			} catch (addRemoveClassErr) {
				console.error(`addRemoveClassErr: ${addRemoveClassErr.message}`)
			};
		},

		removeClass: (element, styleClass) => {
			if (element && element.nodeType === 1 ) {
				element.classList.remove(styleClass);
			};
		},

      toggleInnerHTML: (element, text1, text2) => {
         if (element) {
            console.log({element})
            if (element.innerHTML === text1) element.innerHTML = text2;
            if (element.innerHTML === text2) element.innerHTML = text1;
         };
      },

		affectDOMElement: (elementId, activeClass) => {
			const relatedElement = document.getElementById(elementId);
			_ManipulateDOM.addRemoveClass(relatedElement, activeClass);
		},

		appendList: (listWrapper, element) => {
			try {
				listWrapper.appendChild(element);
			} catch (appendListErr) {
				console.error(`appendListErr: ${appendListErr}`)
			};   
		},

		togleBlockElement: (element) => {
			if (element.style.display !== `block`) { element.style.display = `block`}
			else if (element.style.display === `block`) { element.style.display = `none`}
			else if (element.style.display === `none`) { element.style.display = `block`}
		},

		blockElement: (element) => {
			element.style.display = `block`;
		},

      displayFlexElement: (element) => {
         element.style.display = `flex`;
      },

		hideElement: (element) => {
			element.style.display = `none`;
		},

		// RETREIVE DATA (FROM BACKEND) VIA HTML DATASET ATTRIBUTE
		getDataset: (div) => {

			try {

				const divDataset = div.dataset; // this returns: DOMStringMap => {[dataAttrName], [data]}

				if (!divDataset) return null;

				// MTD. 1
				// TODO > NOT TESTED
				const DOMStringMapToObject = function(dataset) {
					return Object.keys(dataset).reduce((object, key) => {
						object[key] = dataset[key];
						return object;
					}, {});
				};
				
				// MTD. 2
				for (const d in divDataset) {

					// console.log(d, divDataset[d])

					const dataAttrName = d;

					const dataStream = divDataset[dataAttrName];

					return dataStream;
				};
				
			} catch (getDataStreamErr) {
				console.error(`getDataStreamErr: ${getDataStreamErr}`);
			};
		},
		
		populateDataset: (div, dataAttribute, data) => {
			if (!(div.dataset[dataAttribute])) {
				div.dataset[dataAttribute] = data;
			};
		},

		getParentElement: (element, {parentLevel=1}) => {
			let parent;
			if (element && element.nodeType === 1) {
				for (let idx = 0; idx < parentLevel; idx++) {
					parent = element.parentElement;
					element = parent;
				};
				return parent;
			};
			return null;		
		},

		getSiblingElements: (element) => {
			
			try {

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
						
				return siblingElements;
				
			} catch (getSibElemErr) {
				console.error(`getSibElemErr: ${getSibElemErr}`)
			};		
		},

		// FIXME > ENDLESS WHILE LOOP
		getNestedSiblings: (element, numParents, nestPosition) => {

			var siblingResults = [];

			// return nothing if no parent
			if (!element.parentNode) return siblingResults;

			// find the relevant parent to target
			let parentDiv;
			while(numParents > 0) {
				parentDiv = element.parentNode;
				numParents = numParents - 1;
			};
			
			// get first sibling of parent (ie., self)
			let nestedSibling = parentDiv.childNodes[nestPosition-1];
			console.log(nestedSibling)

			// while (nestedSibling) {
				//    if (nestedSibling.nodeType === 1 && nestedSibling !== element) {
					//       siblingResults.push(nestedSibling);
					//    };
					//    // get next nested sibling
					//    nestedSibling = parentDiv.nextSibling.childNodes[nestPosition-1];
							const nextNestedSibling = parentDiv.nextSibling.childNodes[nestPosition-1];
							nestedSibling = nextNestedSibling;
				// };
			console.log(siblingResults);
			return siblingResults;
		},

		getSubordinates: (parentWrapper, masterElement, elementsClass) => {

			try {
				
				let slaveElements = [];
				
				// collect adjacent parents
				if (parentWrapper.nodeType === 1) {
					let inputs = parentWrapper.querySelectorAll(`${elementsClass}`);
					for (const input of inputs) {
						if (input !== masterElement) {
							slaveElements.push(input)
						};
					};
				};
			
				return slaveElements; 

			} catch (getSubElementsErr) {
				console.error(`getSubElementsErr: ${getSubElementsErr.message}`)
			};
		},
		
		scrollDOMElement: (elementId) => {
			const elem = document.getElementById(elementId)
			elem.scrollIntoView({
				behavior: `smooth`,
				block: `start`,
				inline: `nearest`,
			});	
		},

      // MASTER-SLAVE CHECKBOX BEHAVIOR
      masterSlaveControl: (master, slaves) => {
      
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
               console.log(`parentNode`, master.parentNode)
               console.log(`parentNode style`, master.parentNode.style.display);
               _ManipulateDOM.displayFlexElement(master.parentNode.parentNode);

               if (slaveCheckbox.checked === false) { master.checked = false}
            });
         });

         // TODO
         // toggle master to "on" if ALL slaves are "on"
      },
	}
})();


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

   // settings 'keys'
   const baseMapKey = _getCheckedRadio(dom.baseMapRadios).radioValue;
   const plotsMapStyleKey = _getCheckedRadio(dom.plotsMapStyleRadios).radioValue;
   const distanceUnits = _getCheckedRadio(dom.distanceUnitsRadios).radioValue;
   const areaUnits = _getCheckedRadio(dom.areaUnitsRadios).radioValue;
   
   return {
      getValues: () => {
         return {
            baseMapKey,
            plotsMapStyleKey,
            distanceUnits,
            areaUnits,
      
            clusterMap: {
               zoomValue: (dom.clusterMapZoomRange).value,
            },
      
            bufferFeatsChk: (dom.bufferFeatsChkBx).checked,
            renderMultiFeatsChk: (dom.renderMultiFeatsChkBx).checked,      
         };
      },
   };

})(GET_DOM_ELEMENTS());


export const _PopulateDOM = ((dom) => {

   function renderClusterSummary(props) {
      dom.clusterFeatsNumEl.innerText = props.clusterFeatsNum;
      dom.clusterAreaEl.innerText = `${+(props.clusterArea).toFixed(1)} ha.`;
      dom.clusterUsedAreaEl.innerText = `${+(props.clusterUsedArea).toFixed(1)} ha.`;
      dom.clusterUnusedAreaEl.innerText = `${+(props.clusterUnusedArea).toFixed(1)} ha.`;
   };
   

   return {

      // open modal for clicked cluster
      clusterDetailsModal: (modalDiv, featureCollection) => {

         modalDiv.innerHTML = ``;

         const clusterProps = featureCollection.properties;

         modalDiv.innerHTML += _GenClusterModalMarkup.getInnerMarkup(clusterProps);

         _ManipulateDOM.blockElement(modalDiv);

         // MODAL CLOSE BTN.
         GET_DOM_ELEMENTS().resultModalCloseBtn.addEventListener(`click`, () => {
            _ManipulateDOM.hideElement(GET_DOM_ELEMENTS().resultModalDiv);
         });

         // TODO > MODAL TITLE CLICK EVENT HANDLER

         // TODO > MODAL AVATAR CLICK EVENT HANDLER
      },
      
      // TODO > THIS SHOULD FIRE ON FILTER INPUT CHANGES
      clusterResultsSidebar: ({dbCollection}) => {

         try {
      
            // CREATE NEW RESULT DIVS FOR EACH LEGACY CLUSTER
            if (dbCollection) {
            
               for (let idx = 0; idx < dbCollection.length; idx++) {
      
                  let clusterGeoJSON = dbCollection[idx];
               
                  // 2.
                  const clusterResultDiv = _GenerateClusterMarkup.getClusterResultDiv(clusterGeoJSON);
      
                  // 2a.
                  _ManipulateDOM.populateDataset(clusterResultDiv, APP_STATE.CONFIG_DEFAULTS.CLUSTER_RESULT_DATA_ATTR_NAME, JSON.stringify(clusterGeoJSON));
                  
                  // append result item div to sidebar
                  _ManipulateDOM.appendList(dom.resultsListWrapper, clusterResultDiv)
                  _ManipulateDOM.appendList(dom.resultsListWrapper, _ManipulateDOM.createDiv(`h-divider-grey-100`, "fuck-chicken"))
               };
            };
      
         } catch (clustersSidebarErr) {
            console.error(`clustersSidebarErr: ${clustersSidebarErr}`)
         };      
      },
      
      clusterFeatsSidebar: async (clusterFeatColl) => {

         try {

            if (clusterFeatColl) {
            
               renderClusterSummary(clusterFeatColl.properties);
      
               // get the features
               const clusterFeatures = clusterFeatColl.features;
      
               // remove prev. rendered feats.
               const listingWrapper = dom.featsListingDiv;
               listingWrapper.innerHTML = ``;
               
               // 2.
               for (let idx = 0; idx < clusterFeatures.length; idx++) {
      
                  let clusterFeature = clusterFeatures[idx];
                  
                  const clusterFeatCard = await _GenerateClusterFeatMarkup.getClusterFeatDiv(clusterFeature.properties);
      
                  // ASSIGN A UNIQE ID TO THE CARD DIV
                  clusterFeatCard.id = _ProcessGeoJSON.getId(clusterFeature);
      
                  clusterFeatCard.addEventListener('click', evt => { DOMSequence.featCardClickSeq.call(evt, clusterFeatures, evt); });
      
                  _ManipulateDOM.populateDataset(clusterFeatCard, `clusterfeatdatastream`, JSON.stringify(clusterFeature));
      
                  _ManipulateDOM.appendList(listingWrapper, clusterFeatCard);
               };
            };
            
         } catch (clusterFeatsSidebarErr) {
            console.error(`clusterFeatsSidebarErr: ${clusterFeatsSidebarErr.message}`);
         };      
      },
   };
})(GET_DOM_ELEMENTS());


const DOMSequence = ((dom) => {

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
   
   return {

      clusterTitleClickSeq: (evtObj) => {

         evtObj.preventDefault();
      
         // REMOVE
         console.log(_pollAVGSettingsValues());
         console.log((_PollAppSettings.getValues()))
      
         // get the main parent container
         const resultContainerDiv = _ManipulateDOM.getParentElement(evtObj.target, {parentLevel: 3});
      
         // get the siblings of the main parent container
         const adjacentResultDivs = _ManipulateDOM.getSiblingElements(resultContainerDiv);
      
         // get the geojson for that result
         const clusterGeoJSON = JSON.parse(_ManipulateDOM.getDataset(resultContainerDiv));
      
         // TODO > VALIDATE GJ. HERE
         if (clusterGeoJSON) {
            
            // 1.
            _PopulateDOM.clusterDetailsModal(dom.resultModalDiv, clusterGeoJSON);
      
            // 1b.
            // render cluster feature cards.
            _PopulateDOM.clusterFeatsSidebar(clusterGeoJSON);
            
            // 2.
            _RenderEngine.renderEverythingNow(clusterGeoJSON, 
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
      },      

      /**
       * Listen to the element and when it is clicked, do four things:
       * 1. Get the geoJSON associated with the clicked link
       * 2. Fly to the point
       * 3. Close all other popups and display popup for clicked store
       * 4. Highlight listing in sidebar (and remove highlight for all other listings)
       **/
      featCardClickSeq: (clusterFeatures, evt) => {
  
        try {
           
           for (var i = 0; i < clusterFeatures.length; i++) {
  
              // this => clusterFeatCard
              if (evt.currentTarget.id === _ProcessGeoJSON.getId(clusterFeatures[i])) {
                 _RenderEngine.panToClusterPlot(clusterFeatures[i], {zoomLevel: _pollAVGSettingsValues().clusterMap.zoomValue});
                 _RenderEngine.renderFeatPopup(clusterFeatures[i].properties, _TurfHelpers.getLngLat(clusterFeatures[i]));
              };
           };
  
           _ManipulateDOM.addRemoveClass(evt.currentTarget, 'selected');
  
        } catch (cardClickSeqErr) {
           console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
        };
     },
   };

})(GET_DOM_ELEMENTS());


const DelegateImputsEvents = (dom => {

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

   // TODO > WIP
   // RESULTS SEARCH BOX EVENT HANDLER >> NEW jQuery SEARCH 
   if ($("#results_search_box")) {
      $("#results_search_box").on("change paste keyup", function() {
   
         var txt = $("#results_search_input").val();
   
         // COMPARE SEARCH TEXT & LISTING '.item'
         $(".result-item-title").each(function() {
            if ( $(this).text().toUpperCase().indexOf(txt.toUpperCase()) != -1 ) {
               $(this).show();
            } else {
               $(this).hide();
            }
         });
      });
   };

   if (dom.clusterResultsBody) {

      const resultsBody = dom.clusterResultsBody;
      const filterBtn = dom.resultsFilterBtn;
      const scrollTopBtn = dom.resultsScrollTopBtn;

      resultsBody.addEventListener("scroll", () => {

         switch (true) {
            case resultsBody.scrollTop > 300 && resultsBody.scrollTop < 1000:
               if (filterBtn) filterBtn.style.display = "block";
               break;
            case resultsBody.scrollTop > 1000:
               console.log("show scroll top");
               if (scrollTopBtn) scrollTopBtn.style.display = "block";
               break;
            default:
               if (filterBtn) filterBtn.style.display = "none";
               if (scrollTopBtn) scrollTopBtn.style.display = "none";
               break;
         }
      });
   };

   if (dom.resultsScrollTopBtn) {
      dom.resultsScrollTopBtn.addEventListener("click", () => {
         const resultsBody = dom.clusterResultsBody;
         if (resultsBody) resultsBody.scropTop = 0;
      });
   };

   // CHANGE CLUSTER PLOTS AREA UNITS
   if (dom.areaUnitsRadios) {
      const radios = dom.areaUnitsRadios;
      radios.forEach(radio => {
         radio.addEventListener(`change`, async (e) => {
            if (APP_STATE.retreiveLastRenderedGJ()) {
               _RenderEngine.renderClusterPlotsLabels(APP_STATE.retreiveLastRenderedGJ(), 
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
            _RenderEngine.refreshClusterPlotsMap(evtObj);
            console.log(APP_STATE.retreiveLastRenderedGJ());
            if (APP_STATE.retreiveLastRenderedGJ()) {
               console.log(`FUCK MIKE LINDEL`)
               // _RenderEngine.renderClusterPlots(APP_STATE.retreiveLastRenderedGJ(),
               _RenderEngine.renderEverythingNow(APP_STATE.retreiveLastRenderedGJ(),
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

   console.log(dom.paneResizeBtns);
   if (dom.paneResizeBtns) {
      dom.paneResizeBtns.forEach(btn => btn.addEventListener(`click`, () => {
        _ManipulateDOM.toggleInnerHTML(btn, "Expand", "Collapse");
      }));
   };

   // CLUSTER RESULT TITLE CLICK HAND.
   if (dom.clusterTitleDivs) {
      for (const resultTitle of dom.clusterTitleDivs) {
         resultTitle.addEventListener(`click`, DOMSequence.clusterTitleClickSeq);
      };
   };

   // CLUSTER RESULT ITEM CHECKBOX BEH.
   if (dom.resultItemCheckboxes && dom.masterResultCheckbox) {
      const slaveResultCheckboxes = dom.resultItemCheckboxes;
      const selectAllResultsChk = dom.masterResultCheckbox
      _ManipulateDOM.masterSlaveControl(selectAllResultsChk, slaveResultCheckboxes);
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
         _ManipulateDOM.masterSlaveControl(masterCheckbox, slaveCheckboxes);
      });
   };
         
   return {
      // nothing here
   };

})(GET_DOM_ELEMENTS());