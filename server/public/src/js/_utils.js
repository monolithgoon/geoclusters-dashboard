`use strict`


// FIXME> TEST THE OUTPUTS
// CONCAT. STRINGS FROM ARRAY; SEPARATE BY SPACE
export function _joinWordsArray(keywords, {inclQuotes=false, commaSeparated=false}={}) {
	let concatArray;
   concatArray = keywords.map((keyword) => {
		if (keyword) {
			if (inclQuotes) return `"${keyword}"`
			else return keyword;
		} 
   });
	return commaSeparated ? concatArray.join(",") : concatArray.join(" ");
};


export function _createDiv(classArray) {
   const newDiv = document.createElement('div');
   newDiv.classList.add(...classArray);
   return newDiv;
};


export function _createCard(classArray) {
   const newCard = document.createElement('card');
   newCard.classList.add(...classArray);
   return newCard;
};


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
		}
	}
})();


// CALC. TIME TO EXE. A FN.
export const _ExecutionMeasureFn = (function() {

	let returnedData, executionMs;

	return {

		execute: async function(callback) {
							
         console.log(`%c This funciton [${callback}] is executing ..`, `background-color: lightgrey; color: blue;`);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;

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


// TRAVERSE AN OBJECT USING AN ARRAY OF OBJ. PROPS.
export const _TraverseObject = (() => {

	let finalValue;

	return {

		evaluateValue: function thisFunction(...args) {
			// console.log(thisFunction)

			const keys = [...args];

			try {

				let tempValue = keys[0];

				for (let idx = 0; idx < keys.length - 1; idx++) {
					tempValue = tempValue[keys[idx + 1]];
               // console.log({tempValue});
				};

				finalValue = tempValue;
            // console.log({finalValue});
            
            // IMPORTANT > RETURN THIS TO INDICATE THAT THIS EVALUATED TO VALUE OR UNDEF.
            return finalValue;
            
			} catch (evaluateValueErr) {
            // console.log(`%c evaluateValueErr: ${evaluateValueErr.message}`,"background-color: orange; color: black;");
            return null;
			};
		},

		getFinalValue: function() {
                  
			return finalValue;
		},
	};
})();


// CONVERT THE OBJ'S VALUES TO STRINGS
export const _stringifyPropValues = (obj) => {
	return Object.keys(obj).reduce((modObject, key) => {
		modObject[key] = (obj[key]).toString();
		// modObject[key] = ``+obj[key];
		return modObject;
	}, {});
};


// CONVERT THE OBJ'S VALUES TO UPPERCASE STRINGS
export const _capitalizePropValues = (obj) => {
	return Object.keys(obj).reduce((modObject, key) => {
		modObject[key] = (``+obj[key]).toUpperCase();
		return modObject;
	}, {});
};


// get element states
export function _getCheckedRadio(radioGroup) {

   const checkedRadiosArray = [];
   let radioElement = null;
   let radioValue = null;

   try {

		if (radioGroup) {

			radioGroup.forEach(radio => {
				if (radio.checked) { checkedRadiosArray.push(radio) };
			});

			if (checkedRadiosArray.length > 1) { throw new Error(`Cannot have more than one checked radio per group`)}
			if (checkedRadiosArray.length === 0) { throw new Error(`At least one radio must be checked by default`)}
			if (checkedRadiosArray.length > 0) {
				radioElement = checkedRadiosArray[0];
				radioValue = checkedRadiosArray[0].value;
			};
			
			return {
				radioElement,
				radioValue,
			};
		};

   } catch (getCheckedRadioErr) {
      console.error(`getCheckedRadioErr: ${getCheckedRadioErr.message}`)
   };
};


export function _replaceDataset(div, dataAttribute, data) {
	if (div.dataset[dataAttribute]) {
		div.dataset[dataAttribute] = data;
	};
};


export const _mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};


export const _TurfHelpers = (()=>{
	return {
		centerOfMass: function(geoJSONFeature) {
			try {
				return turf.centerOfMass(geoJSONFeature);
			} catch (pointOnFeatErr) {
				console.log(`pointOnFeatErr: ${pointOnFeatErr.message}`)
			};
		},
		getLngLat: function(geoJSONFeature) {
			const lngLat = this.centerOfMass(geoJSONFeature).geometry.coordinates;
			return lngLat;
		},
		 calcPolyArea: (polygon, {units = `hectares`}) => {
			let polyArea;
			try {
				if (polygon) {
					polyArea = turf.area(polygon);
					switch (true) {
						case units === `hectares` || units === `ha.` || units === `ha`:
							polyArea = polyArea / 10000;
							break;
						case units === `acres` || units === `ac.` || units === `ac`:
							polyArea = polyArea / 4046.86;
							break;
						case units === `sqkm` || units === `square kilometers`:
							polyArea = polyArea / 1000000;
							break;
						case units === `sqm` || units === `square meters`:
							polyArea = polyArea;
							break;
						default:
							break;
					}
					return polyArea;
				};
			} catch (calcPolyAreaErr) {
				console.error(`calcPolyAreaErr: ${calcPolyAreaErr.message}`)
			};
		},
	};
})();


export const _CheckGeoJSON = (()=>{

	return {

		isValidPolygon: function(geoJSON) {
			try {
				if (turf.area(geoJSON)) return true;
				return false;			
			} catch (GeoJSONCheckErr) {
				console.error(`GeoJSONCheckErr: ${GeoJSONCheckErr.message}`)
			};
		},

		isValidFeatColl: function(geoJSON=_mandatoryParam()) {
			if (geoJSON) {
				if (turf.getType(geoJSON) === `FeatureCollection`) return geoJSON;
				return false;
			};
		},

		hasItirableFeats: function(featsArray) {
			if (Array.isArray(featsArray)) { return featsArray };
			return false;
		},

		isValidFeat: function(geoJSON = _mandatoryParam()) {
			try {				
				if (turf.getType(geoJSON) === `Feature`) return geoJSON
				else throw new Error(`The supplied GeoJSON is not a valid Feature`);
			} catch (invalidFeatErr) {
				console.error(`invalidFeatErr: ${invalidFeatErr.message}`)
				return false;
			};
		},

		isValidFeatOrColl: function(geoJSON = _mandatoryParam()) {
			if (
				turf.getType(geoJSON) === `Feature` ||
				turf.getType(geoJSON) === `FeatureCollection`
				) return geoJSON;
			return false;
		},

		// CHECK IF featColl. has feats. with coords. that can be rendered
		hasInvalidFeatsCoords: function(featureCollection = mandatoryParam()) {
			try {
				turf.centerOfMass(featureCollection);
				return null;
			} catch (validFeatCoordsErr) {
				console.log(`%c validFeatCoordsErr: The feat. coll. has feats. with invalid coords. [turf-error: ${validFeatCoordsErr.message} ]`, `color: red; background: lightgrey;`)
				return featureCollection;
			};
		},

		getId: (geoJSON) => {
			try {
				
				if (turf.getType(geoJSON) === `FeatureCollection`) return `feature_collection_${geoJSON._id}`
				else if (geoJSON.geometry._id) return `feature_${geoJSON.geometry._id}`

			} catch (getGeoJSONIdErr) {
				console.error(`getGeoJSONIdErr: ${getGeoJSONIdErr.message}`)
			};
		},
	};
})();


// fix the coords in each feat. and return the featColl.
export function _repairFeatsCoords (featureCollection) {

	if (featureCollection) {

		const featuresArray = featureCollection.features;
							
		for (let idx = 0; idx < featuresArray.length; idx++) {
			// get a feat.
			const feature = featuresArray[idx];
			// get its coords.
			const featCoords = feature.geometry.coordinates[0];
			// loop thru its coords.
			for (let idxy = 0; idxy < featCoords.length; idxy++) {
				// get a coord. [lat, lng] array
				const polyCoord = featCoords[idxy];
				// convert both coords. to integers
				feature.geometry.coordinates[0][idxy] = [+polyCoord[0], +polyCoord[1]]
			};         
		};
	
		featureCollection.features = featuresArray;
	
		return featureCollection;

	} else {
		return null;
	};
};


// LOOP THRU EACH FEAT. AND CONVERT STRING COORDS. TO INTEGERS
export function _sanitizeFeatCollCoords(featureCollection = mandatoryParam()) {
	let modFeatureCollection = _repairFeatsCoords(_CheckGeoJSON.hasInvalidFeatsCoords(_CheckGeoJSON.isValidFeatColl(featureCollection)))
	return modFeatureCollection ? modFeatureCollection : featureCollection;
};


// HACK > REMOVES THE "TAILS"  FROM THE CHUNKS
export function _getBufferedPolygon(polygon, bufferAmt, {bufferUnits="kilometers"}) {

	try {
		
		let bufferedPolygon;
	
		if (bufferAmt) {
	
			bufferedPolygon = turf.buffer(polygon, bufferAmt, { unit: bufferUnits });
	
			// SOMETIMES turf.buffer RETURNS "undefined" > DEAL WITH IT
			bufferedPolygon = bufferedPolygon ? bufferedPolygon : polygon;
	
			// switch (true) {
			// 	case calcArea:
					
			// 		break;
			
			// 	default:
			// 		break;
			// }
			
		} else {
			bufferedPolygon = polygon;
		};
	
		return bufferedPolygon;

	} catch (bufferPolyErr) {
		console.error(`bufferPolyErr: ${bufferPolyErr.message}`);
		return polygon;
	};
};


// export function _calcPolyArea(polygon, { units = `hectares` }) {
// 	let polyArea;
// 	if (polygon) {
// 		polyArea = turf.area(polygon);
// 		switch (true) {
// 			case units === `hectares` || units === `ha.` || units === `ha`:
// 				polyArea = polyArea / 10000;
// 				break;
// 			case units === `acres` || units === `ac.` || units === `ac`:
// 				polyArea = polyArea / 4046.86;
// 				break;
// 			case units === `sqkm` || units === `square kilometers`:
// 				polyArea = polyArea / 1000000;
// 				break;
// 			case units === `sqm` || units === `square meters`:
// 				polyArea = polyArea;
// 				break;
// 			default:
// 				break;
// 		}
// 		return polyArea;
// 	};
// };