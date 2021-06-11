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


// RETREIVE DATA (FROM BACKEND) VIA HTML DATASET ATTRIBUTE
export function _getDataset(div) {

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
};


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


// populate 
export function _populateDataset(div, dataAttribute, data) {
	if (!(div.dataset[dataAttribute])) {
		div.dataset[dataAttribute] = data;
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

	let bufferedPolygon;

	if (bufferAmt) {

		bufferedPolygon = turf.buffer(polygon, bufferAmt, { unit: bufferUnits });

		// SOMETIMES turf.buffer RETURNS "undefined" > DEAL WITH IT
		bufferedPolygon = bufferedPolygon ? bufferedPolygon : polygon;

		switch (true) {
			case calcArea:
				
				break;
		
			default:
				break;
		}
		
	} else {
		bufferedPolygon = polygon;
	};

	return bufferedPolygon;
};


export function _calcPolyArea(polygon, { units = `hectares` }) {
	let polyArea;
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
};