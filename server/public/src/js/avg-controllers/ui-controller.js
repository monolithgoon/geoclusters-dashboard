"use strict";
import {
	_TraverseObject,
	_getCheckedRadio,
	_stringifyPropValues,
	_TurfHelpers,
	_formatNumByThousand,
} from "../utils/helpers.js";
import { _ProcessGeoJSON, _getBufferedPolygon } from "../utils/helpers.js";
import { _RenderEngine } from "./maps-controller.js";
import { APP_STATE } from "./state-controller.js";
import {
	_GenerateClusterFeatMarkup,
	_GenerateClusterRecordMarkup,
	_GenClusterModalMarkup,
} from "../utils/markup-generators.js";
import { _clientSideRouter, _navigateTo } from "../routers/router.js";
import { GET_DOM_ELEMENTS } from "../utils/get-dom-elements.js";
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";
import _isValidGeoJSON from "../utils/validate-geojson.js";

export const _ManipulateDOM = (() => {
	return {
		createDiv: (...styleClasses) => {
			const newDiv = document.createElement("div");
			styleClasses.forEach((member) => {
				newDiv.classList.add(member);
			});
			return newDiv;
		},

		toggleClassList: (element, ...styleClasses) => {
			if (element && element.nodeType === 1) {
				styleClasses.forEach((member) => {
					element.classList.toggle(member);
				});
			}
		},

		addClass: (element, ...styleClasses) => {
			try {
				if (element && element.nodeType === 1) {
					styleClasses.forEach((styleClass) => {
						element.classList.add(styleClass);
					});
				}
			} catch (addClassErr) {
				console.error(`addClassErr: ${addClassErr.message}`);
			}
		},

		removeClass: (element, ...styleClasses) => {
			try {
				if (element && element.nodeType === 1) {
					styleClasses.forEach((styleClass) => {
						element.classList.remove(styleClass);
					});
				}
			} catch (removeClassErr) {
				console.error(`removeClassErr: ${removeClassErr.message}`);
			}
		},

		addRemoveClass: (element, classList) => {
			try {
				const activeItem = document.getElementsByClassName(`${classList}`);
				if (activeItem[0]) {
					activeItem[0].classList.remove(`${classList}`);
				}
				element.classList.add(`${classList}`);
			} catch (addRemoveClassErr) {
				console.error(`addRemoveClassErr: ${addRemoveClassErr.message}`);
			}
		},

		/**
		 * toggleInnerText is a function that switches the inner text of an element between two texts.
		 * @param {Element} element - The HTML element whose inner text will be modified.
		 * @param {string} text1 - The first text to switch to.
		 * @param {string} text2 - The second text to switch to.
		 */
		toggleInnerText: (element, text1, text2) => {
			// Check if the element exists
			if (element) {
				// Check if the element's inner text is equal to text1
				if (element.innerText === text1) {
					element.innerText = text2;
				} else {
					element.innerText = text1;
				}
			}
		},

		affectDOMElement: (elementId, activeClass) => {
			const relatedElement = document.getElementById(elementId);
			_ManipulateDOM.addRemoveClass(relatedElement, activeClass);
		},

		appendList: (listWrapper, element) => {
			try {
				listWrapper.appendChild(element);
			} catch (appendListErr) {
				console.error(`appendListErr: ${appendListErr}`);
			}
		},

		/**
		 * togleBlockElement is a function that toggles the display style of an HTML element between "block" and "none".
		 * @param {Element} element - The HTML element whose display style will be modified.
		 */
		togleBlockElement: (element) => {
			// Check if the display style of the element is not "block"
			if (element.style.display !== `block`) {
				element.style.display = `block`;
				// Check if the display style of the element is "block"
			} else if (element.style.display === `block`) {
				element.style.display = `none`;
				// Check if the display style of the element is "none"
			} else if (element.style.display === `none`) {
				element.style.display = `block`;
			}
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

		/**
		 * getDataset is a function that retrieves data from an HTML element's dataset attribute.
		 * This data came originally from the backend, and was passed to the frontend via PUG 
		 * @param {Element} div - The HTML element whose dataset attribute will be accessed.
		 * @return {Object|null} Returns the data stored in the dataset attribute as an object, or null if the dataset attribute is not found.
		 * 
		 The shape of the div.dataset object is a DOMStringMap.
		 A DOMStringMap is an object that maps data attributes (HTML data-* attributes) on an HTML element to properties. 
		 It is a JavaScript object that provides access to the data attributes on an element in a convenient, property-like manner.
		 In other words, div.dataset returns an object that contains key-value pairs, where each key represents the name of a data attribute (without the "data-" prefix), and the corresponding value is the value of that data attribute.
			
		 For example, if the HTML element has a data attribute like this:

		 <div id="myDiv" data-product-id="123456"></div>

		 Then `div.dataset` would return an object like this:
					{
						productId: "123456"
					}
		*/

		getDataset: (div) => {
			try {
				// Get the dataset attribute from the div element
				const divDataset = div.dataset;

				// If the dataset attribute is not found, return null
				if (!divDataset) return null;

				// Method 1 (NOT USED): Convert the DOMStringMap to an object
				const DOMStringMapToObject = function (dataset) {
					// Use reduce to convert the DOMStringMap to an object
					return Object.keys(dataset).reduce((object, key) => {
						// Add each key-value pair to the object
						object[key] = dataset[key];
						return object;
					}, {});
				};

				// Method 2: Loop through the properties of the DOMStringMap
				for (const d in divDataset) {
					// Get the data attribute name and its value
					const dataAttrName = d;
					const dataStream = divDataset[dataAttrName];

					// Return the value of the first data attribute found
					return dataStream;
				}
			} catch (getDataStreamErr) {
				// Log an error if an exception occurs
				console.error(`getDataStreamErr: ${getDataStreamErr}`);
			}
		},

		populateDataset: (div, dataAttribute, data) => {
			if (!div.dataset[dataAttribute]) {
				div.dataset[dataAttribute] = data;
			}
		},

		getParentElement: (element, { parentLevel = 1 }) => {
			let parent;
			if (element && element.nodeType === 1) {
				for (let idx = 0; idx < parentLevel; idx++) {
					parent = element.parentElement;
					element = parent;
				}
				return parent;
			}
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
					}
					siblingElement = siblingElement.nextSibling;
				}

				return siblingElements;
			} catch (getSibElemErr) {
				console.error(`getSibElemErr: ${getSibElemErr}`);
			}
		},

		// FIXME > ENDLESS WHILE LOOP
		getNestedSiblings: (element, numParents, nestPosition) => {
			var siblingResults = [];

			// return nothing if no parent
			if (!element.parentNode) return siblingResults;

			// find the relevant parent to target
			let parentDiv;
			while (numParents > 0) {
				parentDiv = element.parentNode;
				numParents = numParents - 1;
			}

			// get first sibling of parent (ie., self)
			let nestedSibling = parentDiv.childNodes[nestPosition - 1];
			console.log(nestedSibling);

			// while (nestedSibling) {
			//    if (nestedSibling.nodeType === 1 && nestedSibling !== element) {
			//       siblingResults.push(nestedSibling);
			//    };
			//    // get next nested sibling
			//    nestedSibling = parentDiv.nextSibling.childNodes[nestPosition-1];
			const nextNestedSibling = parentDiv.nextSibling.childNodes[nestPosition - 1];
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
							slaveElements.push(input);
						}
					}
				}

				return slaveElements;
			} catch (getSubElementsErr) {
				console.error(`getSubElementsErr: ${getSubElementsErr.message}`);
			}
		},

		scrollDOMElement: (elementId) => {
			const elem = document.getElementById(elementId);
			elem.scrollIntoView({
				behavior: `smooth`,
				block: `start`,
				inline: `nearest`,
			});
		},

		// MASTER-SLAVE CHECKBOX BEHAVIOR
		masterSlaveControl: (master, slaves) => {
			master.addEventListener(`change`, (e) => {
				if (e.target.checked) {
					// check slaves
					slaves.forEach((checkbox) => {
						checkbox.checked = true;
						if (checkbox.labels[0]) {
							const slaveCheckboxLabelTxt = checkbox.labels[0].innerText;
							// console.log(slaveCheckboxLabelTxt);
						}
					});
				} else {
					// uncheck slaves
					slaves.forEach((checkbox) => {
						checkbox.checked = false;
					});
				}
			});

			// TOGGLE MASTER TO 'OFF' WHEN SLAVE IS 'OFF'
			slaves.forEach((slaveCheckbox) => {
				slaveCheckbox.addEventListener(`change`, (e) => {
					// FIXME > THIS HARDCODED PARENT BEH. WILL FAIL
					// show master when slave is clicked
					console.log(`parentNode`, master.parentNode);
					console.log(`parentNode style`, master.parentNode.style.display);
					_ManipulateDOM.displayFlexElement(master.parentNode.parentNode);

					if (slaveCheckbox.checked === false) {
						master.checked = false;
					}
				});
			});

			// TODO
			// toggle master to "on" if ALL slaves are "on"
		},
	};
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
}

// GET CURRENT SETTINGS STATE / VALUES
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
				zoomValue: GET_DOM_ELEMENTS().clusterMapZoomRange.value,
			},

			bufferFeatsChk: GET_DOM_ELEMENTS().bufferFeatsChkBx.checked,
			renderMultiFeatsChk: GET_DOM_ELEMENTS().renderMultiFeatsChkBx.checked,
		};
	} catch (pollAppSettingsErr) {
		console.error(`pollAppSettingsErr: ${pollAppSettingsErr.message}`);
	}
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
					zoomValue: dom.clusterMapZoomRange.value,
				},

				bufferFeatsChk: dom.bufferFeatsChkBx.checked,
				renderMultiFeatsChk: dom.renderMultiFeatsChkBx.checked,
			};
		},
	};
})(GET_DOM_ELEMENTS());

// FUNCTIONS THAT COORDINATE WHAT HAPPENS WHEN DOM ELEMENTS IN THE SIDEBARS ARE CLICKED
const DOMSequence = ((domElements) => {

	/**
		This function defines the behavior when a geocluster result container div is clicked.
		It performs the following actions:
		Scrolls the result item div into view with a smooth animation
		Removes the "is-active" class from other result items
		Adds or removes the "is-active" class from the clicked result item div depending on its current class list
	*/
	function clickedResultContainerBehavior(resultItemDiv, otherResultItems) {

		// scroll the result into view
		resultItemDiv.scrollIntoView({
			behavior: `smooth`,
			block: `start`,
			inline: `nearest`,
		});

		// remove "active" class from other result items
		otherResultItems.forEach((result) => {
			if (result !== resultItemDiv) {
				_ManipulateDOM.removeClass(result, `is-active`);
			}
		});

		// set clicked result to active
		_ManipulateDOM.toggleClassList(resultItemDiv, `is-active`);
	}

	return {

	/**
		* clusterTitleClickSeq is a function that gets called when a cluster title is clicked on.
		* 
		* It performs the following actions:
		* 1. Populate the cluster details modal with the cluster's GeoJSON data
		* 2. Renders the cluster on the maps with the specified options: baseMapZoomLvl, bufferFeatsChk, distanceUnits, bufferAmt, areaUnits
		* 3. Saves the rendered GeoJSON to the DATA_STORE in APP_STATE
		* 4. Calls the clickedResultContainerBehavior function, passing in the main parent container and its sibling elements
		* 
		* @param {Object} evtObj - The event object from the click event on the cluster title
		* 
		*/
		clusterTitleClickSeq: (evtObj) => {

			evtObj.preventDefault();

			// REMOVE
			console.log(_pollAVGSettingsValues());
			console.log(_PollAppSettings.getValues());

			// get the main parent container
			const resultContainerDiv = _ManipulateDOM.getParentElement(evtObj.target, {
				parentLevel: 3,
			});

			// get the siblings of the main parent container
			const adjacentResultDivs = _ManipulateDOM.getSiblingElements(resultContainerDiv);

			// add effects to the adjacent divs
			clickedResultContainerBehavior(resultContainerDiv, adjacentResultDivs);

			// get the geojson for that cluster title
			const clusterGeoJSON = JSON.parse(_ManipulateDOM.getDataset(resultContainerDiv));

			/** 
			 * Verify that the GeoJSON comming from the DOM is legit
			*/
			if (_isValidGeoJSON(clusterGeoJSON)) {

				// 1. populate the cluster detail modal @ top of left sidebar
				_PopulateDOM.clusterDetailsModal(domElements.resultModalDiv, clusterGeoJSON);

				// 2. switch focus of right sidebar's tabs
				_ManipulateDOM.removeClass(domElements.clusterInsightsTabBtn, "active");
				_ManipulateDOM.removeClass(domElements.clusterInsightsTabPane, "active");
				_ManipulateDOM.addClass(domElements.clusterDetailsTabBtn, "active");
				_ManipulateDOM.addClass(domElements.clusterDetailsTabPane, "active");

				// 3. render cluster feature cards.
				_PopulateDOM.clusterFeatsSidebar(clusterGeoJSON);

				// 4. render it on both basemap and cluster plots map
				_RenderEngine.renderClusterOnMaps(clusterGeoJSON, {
					baseMapZoomLvl: DEFAULT_APP_SETTINGS.LEAFLET_ADMIN_LEVEL_3_ZOOM,
					useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
					bufferUnits: _pollAVGSettingsValues().distanceUnits,
					bufferAmt: DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_PLOTS_BUFFER,
					areaUnits: _pollAVGSettingsValues().areaUnits,
				});

				// 5. remember the geojson of the currently clicked cluster
				APP_STATE.saveRenderedGeojson(clusterGeoJSON);

				// 6.
				// clickedResultContainerBehavior(resultContainerDiv, adjacentResultDivs);
			}
		},

		/**
		 * Listen to the element and when it is clicked, do four things:
		 * 1. Get the geoJSON associated with the clicked link
		 * 2. Fly to the point
		 * 3. Close all other popups and display popup for clicked store
		 * 4. Highlight listing in sidebar (and remove highlight for all other listings)
		 **/
		featCardClickSeq: (clusterFeatures, evt) => {

			const clickedCard = evt.currentTarget;

			try {
				for (var i = 0; i < clusterFeatures.length; i++) {
					// this => clusterFeatCard
					if (evt.currentTarget.id === _ProcessGeoJSON.getId(clusterFeatures[i])) {
						_RenderEngine.panToClusterPlot(clusterFeatures[i], {
							zoomLevel: _pollAVGSettingsValues().clusterMap.zoomValue,
						});
						_RenderEngine.renderFeatPopup(
							clusterFeatures[i].properties,
							_TurfHelpers.getLngLat(clusterFeatures[i])
						);
					}
				}

				// HIGHLIGHT THE CLICKED CARD
				_ManipulateDOM.addRemoveClass(evt.currentTarget, "selected");

				// SHOW / HIDE CARD DRAWER
				const cardDrawer = _ManipulateDOM.getSiblingElements(evt.currentTarget)[0];
				cardDrawer.classList.toggle("flex-display");

				// GET CLUSTER FEAT. WRAPPER
				const clusterFeatWrapper = _ManipulateDOM.getParentElement(cardDrawer, {
					parentLevel: 1,
				});

				// SCROLL TO PARENT TOP
				clusterFeatWrapper.scrollIntoView(true);

				// DIM OTHER CLUSTER FEATS.
				const siblingFeatWrappers = _ManipulateDOM.getSiblingElements(clusterFeatWrapper);
				siblingFeatWrappers.forEach((sibling) => {
					_ManipulateDOM.toggleClassList(sibling, "dim-opacity", "disable-click");
				});
			} catch (cardClickSeqErr) {
				console.error(`cardClickSeqErr: ${cardClickSeqErr.message}`);
			}
		},
	};
})(GET_DOM_ELEMENTS());

export const _PopulateDOM = ((dom) => {

	function renderClusterSummary(props) {
		dom.clusterFeatsNumEl.innerText = _formatNumByThousand(+props.clusterFeatsNum);
		dom.clusterAreaEl.innerText = `${_formatNumByThousand(+props.clusterArea.toFixed(1))} ha.`;
		dom.clusterUsedAreaEl.innerText = `${_formatNumByThousand(+props.clusterUsedArea.toFixed(1))} ha.`;
		dom.clusterUnusedAreaEl.innerText = `${_formatNumByThousand(+props.clusterUnusedArea.toFixed(1))} ha.`;
	}

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
		clusterResultsSidebar: ({ dbCollection }) => {
			try {
				// CHECK IF dbCollection IS NOT EMPTY
				if (dbCollection.length) {
					// LOG THE dbCollection
					console.log({ dbCollection });

					// CREATE NEW DIVS FOR EACH GEOCLUSTER
					dbCollection.map((geoClusterGeoJSON) => {
						// GET THE CLUSTER RESULT DIV
						const clusterResultDiv =
							_GenerateClusterRecordMarkup.getClusterResultDiv(geoClusterGeoJSON);

						// Hydrate the dataset for the geocluster record div
						// This dataset will be read when the geocluster needs to be rendered on the mini-map in the right sidebar
						_ManipulateDOM.populateDataset(
							clusterResultDiv,
							DEFAULT_APP_SETTINGS.GEOCLUSTER_RECORD_DATA_ATTR_NAME,
							JSON.stringify(geoClusterGeoJSON)
						);

						// APPEND RESULT ITEM DIV TO THE SIDEBAR
						_ManipulateDOM.appendList(dom.resultsListWrapper, clusterResultDiv);
						_ManipulateDOM.appendList(
							dom.resultsListWrapper,
							_ManipulateDOM.createDiv(`h-divider-grey-100`)
						);
					});
				}
			} catch (clustersSidebarErr) {
				console.error(`clustersSidebarErr: ${clustersSidebarErr}`);
			}
		},

		clusterFeatsSidebar: async (clusterFeatColl) => {
			
			try {
				
				if (clusterFeatColl) {

					// display a suummary of the cluster under the cluster plots map
					renderClusterSummary(clusterFeatColl.properties);

					// get the features
					const clusterFeatures = clusterFeatColl.features;

					const listingWrapper = dom.featsListingDiv;

					// remove prev. rendered feats.
					listingWrapper.innerHTML = ``;

					// 2.
					for (let idx = 0; idx < clusterFeatures.length; idx++) {

						let clusterFeature = clusterFeatures[idx];

						console.log({clusterFeature})

						const { clusterFeatCard, clusterFeatCardWrapper } =
							await _GenerateClusterFeatMarkup.getClusterFeatDiv(clusterFeature.properties);

						// ASSIGN A UNIQE ID TO THE CARD DIV
						clusterFeatCard.id = _ProcessGeoJSON.getId(clusterFeature);

						// EVENT DELEGATION
						clusterFeatCard.addEventListener("click", (evt) => {
							DOMSequence.featCardClickSeq.call(evt, clusterFeatures, evt);
						});

						_ManipulateDOM.populateDataset(
							clusterFeatCard,
							`clusterfeatdatastream`,
							JSON.stringify(clusterFeature)
						);

						// _ManipulateDOM.appendList(listingWrapper, clusterFeatCard);
						_ManipulateDOM.appendList(listingWrapper, clusterFeatCardWrapper);
					}
				}
			} catch (clusterFeatsSidebarErr) {
				console.error(`clusterFeatsSidebarErr: ${clusterFeatsSidebarErr.message}`);
			}
		},
	};
})(GET_DOM_ELEMENTS());

const DelegatePreloadedDOMElementsEvents = ((dom) => {
	
	// SANDBOX
	$("#test_feat_card").on("click", function (evt) {
		const cardDrawer = _ManipulateDOM.getSiblingElements(evt.currentTarget)[0];
		cardDrawer.classList.toggle("flex-display");
		const clusterFeatWrapper = _ManipulateDOM.getParentElement(cardDrawer, { parentLevel: 1 });
		const siblingFeatWrappers = _ManipulateDOM.getSiblingElements(clusterFeatWrapper);
		siblingFeatWrappers.forEach((sibling) => sibling.classList.toggle("dim-opacity"));
	});

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
		}
	}

	// EXPAND DASHBOARD SIDEBAR
	if (dom.sidebarExpandBtn && dom.appSidebar) {
		dom.sidebarExpandBtn.addEventListener(`click`, () => {
			dom.appSidebar.classList.toggle(`expanded`);
		});
	}

	// TODO > WIP
	// RESULTS SEARCH BOX EVENT HANDLER >> NEW jQuery SEARCH
	if ($("#results_search_box")) {
		$("#results_search_box").on("change paste keyup", function () {
			var txt = $("#results_search_input").val();

			// COMPARE SEARCH TEXT & LISTING '.item'
			$(".result-item-title").each(function () {
				if ($(this).text().toUpperCase().indexOf(txt.toUpperCase()) != -1) {
					$(this).show();
				} else {
					$(this).hide();
				}
			});
		});
	}

	// SHOW SCROLL TO TOP BTN. ON GEOCLUSTER RECORDS LIST
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
					if (scrollTopBtn) scrollTopBtn.style.display = "block";
					break;
				default:
					if (filterBtn) filterBtn.style.display = "none";
					if (scrollTopBtn) scrollTopBtn.style.display = "none";
					break;
			}
		});
	}

	// SCROLL TO TOP ON CLICK
	if (dom.resultsScrollTopBtn) {
		dom.resultsScrollTopBtn.addEventListener("click", () => {
			const resultsBody = dom.clusterResultsBody;
			if (resultsBody) resultsBody.scrollTop = 0;
		});
	}

	// CHANGE CLUSTER PLOTS AREA UNITS
	if (dom.areaUnitsRadios) {
		const radios = dom.areaUnitsRadios;
		radios.forEach((radio) => {
			radio.addEventListener(`change`, async (e) => {
				if (APP_STATE.retreiveLastRenderedGJ()) {
					_RenderEngine.renderSidemapClusterPlotsLabels(APP_STATE.retreiveLastRenderedGJ(), {
						useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
						bufferUnits: _pollAVGSettingsValues().distanceUnits,
						bufferAmt: DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_PLOTS_BUFFER,
						areaUnits: _pollAVGSettingsValues().areaUnits,
					});
				}
			});
		});
	}

	// FIXME > NOT RENDERING PROPELY
	// CHANGE CLUSTER PLOTS MAP STYLE
	if (dom.plotsMapStyleRadios) {
		dom.plotsMapStyleRadios.forEach((radio) => {
			radio.addEventListener(`change`, (evtObj) => {
				_RenderEngine.refreshClusterPlotsMap(evtObj);
				console.log(APP_STATE.retreiveLastRenderedGJ());
				if (APP_STATE.retreiveLastRenderedGJ()) {
					console.log(`FUCK MIKE LINDEL`);
					// _RenderEngine.renderClusterPlotsOnSidemap(APP_STATE.retreiveLastRenderedGJ(),
					_RenderEngine.renderClusterOnMaps(APP_STATE.retreiveLastRenderedGJ(), {
						useBuffer: _pollAVGSettingsValues().bufferFeatsChk,
						bufferUnits: _pollAVGSettingsValues().distanceUnits,
						bufferAmt: DEFAULT_APP_SETTINGS.PARCELIZED_CLUSTER_PLOTS_BUFFER,
						areaUnits: _pollAVGSettingsValues().areaUnits,
					});
				}
			});
		});
	}

	// CHANGE INNER TEXT OF PANE RESIZE BTNS.
	console.log(dom.paneResizeBtns);
	if (dom.paneResizeBtns) {
		dom.paneResizeBtns.forEach((btn) =>
			btn.addEventListener(`click`, () => {
				_ManipulateDOM.toggleInnerText(btn, "EXPAND", "COLLAPSE");
			})
		);
	}

	// CLUSTER RESULT TITLE CLICK HAND.
	if (dom.clusterTitleDivs) {
		for (const resultTitle of dom.clusterTitleDivs) {
			resultTitle.addEventListener(`click`, DOMSequence.clusterTitleClickSeq);
		}
	}

	// CLUSTER RESULT ITEM CHECKBOX BEH.
	if (dom.resultItemCheckboxes && dom.masterResultCheckbox) {
		const slaveResultCheckboxes = dom.resultItemCheckboxes;
		const selectAllResultsChk = dom.masterResultCheckbox;
		_ManipulateDOM.masterSlaveControl(selectAllResultsChk, slaveResultCheckboxes);
	}

	// TODO > RESULT ITEM CHECKBOX MAP+FILTER EVENT SEQ.

	// FILTER CHECKBOX CHANGE EVENT SEQ.
	if (dom.clusterFilterCheckboxes) {
		const checkboxes = dom.clusterFilterCheckboxes;
		checkboxes.forEach((checkbox) => {
			checkbox.addEventListener(`change`, async (e) => {
				const checkboxLabelTxt = e.target.labels[0].innerText;
				if (e.target.checked) {
					console.log(
						`%c ${checkboxLabelTxt} checked`,
						`color: white; background-color:blue;`
					);
				} else {
					console.log(
						`%c ${checkboxLabelTxt} un-checked`,
						`color: white; background-color:green;`
					);
				}
				// TODO > WIP
				// filterResults(checkboxLabelTxt);
				// renderFilterPill(checkboxLabelTxt);
			});
		});
	}

	// MASTER FILTER CHECKBOX BEH.
	if (dom.clusterFilterCheckboxMasters) {
		const masterCheckboxes = dom.clusterFilterCheckboxMasters;
		masterCheckboxes.forEach((masterCheckbox) => {
			const inputGroupWrapper = _ManipulateDOM.getParentElement(masterCheckbox, {
				parentLevel: 4,
			});
			const slaveCheckboxes = _ManipulateDOM.getSubordinates(
				inputGroupWrapper,
				masterCheckbox,
				".form-check-input"
			);
			_ManipulateDOM.masterSlaveControl(masterCheckbox, slaveCheckboxes);
		});
	}

	return {
		// nothing here
	};
})(GET_DOM_ELEMENTS());
