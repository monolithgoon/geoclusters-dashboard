`use strict`


export const _mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};


// GLOBAL TRY CATCH ERR. HANDLER
export function _errorHandler(callback, errName) {
	try {
		console.log(callback)
		callback();
	} catch (tryCatchErr) {
		console.error(`${errName}: ${tryCatchErr.message}`)
	};
};


// FIXME > TEST THE OUTPUTS
// CONCAT. STRINGS FROM ARRAY; SEPARATE BY SPACE
export function _joinWordsArray(keywords, {inclQuotes=false, commaSeparated=false}={}) {
	let concatArray;
   concatArray = keywords.map((keyword) => {
		if (keyword) {
			if (inclQuotes) return `"${keyword}"`
			else return keyword.trim();
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


export const _GeometryMath = (()=>{

	return {

		// MATH FORMULA TO CALC. BEARING
		computeBearing: (fromCoords, toCoords) => {
			const lat1 = fromCoords[0];
			const long1 = fromCoords[1];
			const lat2 = toCoords[0];
			const long2 = toCoords[1];
			
			// CONVERT COORDS. TO RADIANS > φ is latitude, λ is longitude in radians
			const φ1 = lat1 * Math.PI/180; 
			const φ2 = lat2 * Math.PI/180;
			const λ1 = long1 * Math.PI/180;
			const λ2 = long2 * Math.PI/180;
		
			const y = Math.sin(λ2-λ1) * Math.cos(φ2);
			const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
			const θ = Math.atan2(y, x);
			const bearing = (θ*180/Math.PI + 360) % 360; // in degrees
			
			return bearing;		
		},
		
		// CONVERT DEGREES TO DEG. MIN. SEC. (DMS) FORMAT
		getDegMinSec: (deg) => {
			var absolute = Math.abs(deg);
		
			var degrees = Math.floor(absolute);
			var minutesNotTruncated = (absolute - degrees) * 60;
			var minutes = Math.floor(minutesNotTruncated);
			var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);
		
			return `${degrees}° ${minutes}' ${seconds}"`		
		},
	};
})();


// FIXME
const catchError2 = function(fn, errDescr=null) {
	return function() {
		try {
			// console.log(fn)
			return fn.apply(this, arguments);
		} catch(err) {
			console.error(`${errDescr}: ${err.message}`)
		};
	};
};

const handleError = (err) => {
	console.error(err.message);
};

const catchError = (fn, errorHandler) => {
	return function() {
		fn().catch(errorHandler)
	};
};


export const _TurfHelpers = (()=>{

	return {

		getType: (geoJSON) => {
			try {
				return turf.getType(geoJSON);
			} catch (getTypeErr) {
				console.error(`getTypeErr: ${getTypeErr.message}`);
			};
		},

		// buffer: catchError(async (geoJSON, bufferRadius, {units='kilometers'}) => {

		// 	// return catchError(turf.buffer(geoJSON, bufferRadius, {units}), "turfBufferErr");

		// 	return turf.buffer(geoJSON, bufferRadius, {units});

		// 	// try {
		// 	// 	return turf.buffer(geoJSON, bufferRadius, {units});
		// 	// } catch (turfBufferErr) {
		// 	// 	console.error(`turfBufferErr: ${turfBufferErr.message}`)
		// 	// };
				
		// }, handleError),

		buffer: (geoJSON, bufferRadius, {units='kilometers'}) => {

			// return catchError2(turf.buffer(geoJSON, bufferRadius, {units}), "turfBufferErr");

			try {
				return turf.buffer(geoJSON, bufferRadius, {units});
			} catch (turfBufferErr) {
				console.error(`turfBufferErr: ${turfBufferErr.message}`)
			};
		},

		midpoint: (coords1, coords2) => {
			try {
				return turf.midpoint(coords1, coords2)
			} catch (turfMidpointErr) {
				console.error(`turfMidpointErr: ${turfMidpointErr.message}`)
			};
		},

		centerOfMass: (featGeometry) => {
			try {
				return turf.centerOfMass(featGeometry);
			} catch (comErr) {
				console.error(`comErr: ${comErr.message}`)
			};
		},

		distance: (coords1, coords2, {distUnits}) => {
			try {
				return turf.distance(coords1, coords2, {units: distUnits})
			} catch (turfDistanceErr) {
				console.error(`turfDistanceErr: ${turfDistanceErr.message}`)
			};
		},

		centerOfMass: (geoJSONFeature) => {
			try {
				return turf.centerOfMass(geoJSONFeature);
			} catch (pointOnFeatErr) {
				console.error(`pointOnFeatErr: ${pointOnFeatErr.message}`)
			};
		},

		unkinkPolygon: (gjPolygon) => {
			try {
				return turf.unkinkPolygon(gjPolygon);
			} catch (unkinkPolyErr) {
				console.error(`unkinkPolyErr: ${unkinkPolyErr.message}`)
			};
		},

		getLngLat: (geoJSONFeature) => {
			try {
				return _TurfHelpers.centerOfMass(geoJSONFeature).geometry.coordinates;
			} catch (getLngLatErr) {
				console.error(`getLngLatErr: ${getLngLatErr.message}`)
			};
		},

		calcPolyArea: (gjPolygon, {units = `hectares`}={}) => {

			try {
				
				if (
						gjPolygon &&
						turf.getType(gjPolygon) === "Polygon" ||
						turf.getType(gjPolygon) === "MultiPolygon"
					) {

						let polyArea = turf.area(gjPolygon);

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
							case !units:
								polyArea = polyArea;
							default:
								break;
						};

						return polyArea;
					};
			} catch (calcPolyAreaErr) {
				console.error(`calcPolyAreaErr: ${calcPolyAreaErr.message}`)
			};
		},
	};
})();


function getGeomCollPolyFeats(geojson) {

	const geomCollPolyFeatures = [];
	
	geojson.geometry.geometries.forEach((geom) => {

		// EXTRACT THE POLYGONS
		if (_TurfHelpers.getType(geom) === "Polygon") {
			
			const geomFeature = turf.feature(geom);

			geomCollPolyFeatures.push(geomFeature);

			polygonFeats = geomCollPolyFeatures;

		} else {

			// NO POLYGONS IN THE GEOM. COLL.
			polygonFeats = null
		};
	});

return polygonFeats;
};

// SIMPLIFY MULTIPOLYGON & GEOMETRY COLL. GEOMETRIES > 
// EXTRACT POLYGONS FROM MultiPolygons & GeometryCollections
// SELECT THE DOMINANT POLYGON OR ATTEMPT TO MERGE THEM
export function _getUsableGeometry(geoJSON) {

	let polygonFeats,
		refinedGeoJSON,
		discardedMultipolyParts = [];

	switch (_TurfHelpers.getType(geoJSON)) {

		case "Polygon":
			// DO NOTHING IF ALREADY POLYGON
			refinedGeoJSON = geoJSON,
			discardedMultipolyParts = null;
			break;

		case "MultiPolygon":

		// REMOVE > DEPRC.
			// const multiPolyFeatColl = _TurfHelpers.unkinkPolygon(geoJSON); // HACKY WAY OF CONVERTING MULTIPOLY. TO FEAT. COLL.
			// if (multiPolyFeatColl) {
			// 	polygonFeats = multiPolyFeatColl.features;
			// } else {
			// 	const multiPolyFeats = [];
			// 	for (let idx = 0; idx < geoJSON.geometry.coordinates.length; idx++) {
			// 		const polygonCoords = geoJSON.geometry.coordinates[idx];
			// 		multiPolyFeats.push(turf.polygon(polygonCoords));
			// 		polygonFeats = multiPolyFeats;
			// 	};
			// };

			const multiPolyFeats = [];
			for (let idx = 0; idx < geoJSON.geometry.coordinates.length; idx++) {
				const polygonCoords = geoJSON.geometry.coordinates[idx];
				multiPolyFeats.push(turf.polygon(polygonCoords));
				polygonFeats = multiPolyFeats;
			};

			break;	

		case "GeometryCollection":
			polygonFeats = getGeomCollPolyFeats(geoJSON);
			break;	

		default:
			break;
	}

	if (polygonFeats && polygonFeats.length > 0) {
		
		// ONLY 1 POLYGON WAS FOUND IN THE GEOJSON
		if (polygonFeats.length === 1 ) {
			
			refinedGeoJSON = polygonFeats[0];
			
		} else {

			// console.warn(`[ Selecting a dominant polygon .. ]`)
			
			// LOOP THRU THE FEATURES & CHOOSE THE DOINANT FEAT.
			for (let feature of polygonFeats) {

				const featureAreaRatio = _TurfHelpers.calcPolyArea(feature) / _TurfHelpers.calcPolyArea(geoJSON);

				// console.log({featureAreaRatio});

				if (featureAreaRatio >= 0.60) {

					// CHOOSE THE DOINANT FEAT.
					refinedGeoJSON = feature;
					
				} else if (featureAreaRatio >= 0.40 && featureAreaRatio < 0.60) {
					// THE FEATURES ARE PROB. SIMILAR IN SIZE > LOOP THRU & TRY TO MERGE THEM
					
					// PERFORM A SIMPLE UNION, THEN COLLECT ALL THE PARTS THAT DON'T UNITE
					// refinedGeoJSON = turf.union(...polygonFeats);
					refinedGeoJSON = _ProcessGeoJSON.bufferUniteFeats(polygonFeats, {maxBufferAmt: 0.05, bufferStep: 0.0025});
					
					if (_TurfHelpers.getType(refinedGeoJSON) !== "Polygon") {
						console.error(`FAILED REFINING GEOJSON`);
						discardedMultipolyParts.push(...polygonFeats);
					// } else {
					// 	return refinedGeoJSON;
					};
					
				} else if (featureAreaRatio >= 0.005 && featureAreaRatio < 0.40) {

					// TRACK SMALL, BUT NOT INSIGNIFICANT FEATURES

					// ADD CUSTOM PROPERTIES
					feature.properties['chunk_size'] = _TurfHelpers.calcPolyArea(feature);

					discardedMultipolyParts.push(feature)

				} else if (featureAreaRatio > 0 && featureAreaRatio < 0.005) {
					// TODO > IGNORE THESE TINY PARTICLES?? 
					// discardedMultipolyParts.push(feature)
				}
			}
		}

	} else {
		// console.warn(`No complex geometries to simplify ..`)
	}

	return {
		refinedGeoJSON,
		discardedMultipolyParts
	};
};

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
export function _sanitizeFeatCollCoords(featureCollection = _mandatoryParam()) {
let modFeatureCollection = _repairFeatsCoords(_ProcessGeoJSON.hasInvalidFeatsCoords(_ProcessGeoJSON.isValidFeatColl(featureCollection)))
return modFeatureCollection ? modFeatureCollection : featureCollection;
};


// HACK > REMOVES THE "TAILS"  FROM THE CHUNKS
// SOMETIMES, BUFFERING A POLYGON DEFORMS IT
// turf.buffer SOMETIMES MUTILATES A MULTIPOLYGON CHUNK; DEAL WITH THAT
// THIS REVERTS THE BUFFER TO THE ORG. POLY IF ANY DEFORMATION WOULD HAPPEN
export function _getBufferedPolygon(gjPolygon, bufferAmt, {bufferUnits="kilometers"}={}) {

// if (_TurfHelpers.getType(gjPolygon) === "Polygon") { // REMOVE
if(gjPolygon) {
	
	let bufferedPolygon = _TurfHelpers.buffer(gjPolygon, bufferAmt, {units: bufferUnits});

	// console.log(_TurfHelpers.calcPolyArea(gjPolygon))
	// console.log({bufferAmt}, {bufferUnits})
	// console.log({bufferedPolygon})
	// if (bufferedPolygon) console.log(_TurfHelpers.calcPolyArea(bufferedPolygon))
	
	// SOMETIMES turf.buffer RETURNES "undefined"
	// if (bufferedPolygon && _TurfHelpers.getType(bufferedPolygon) === "Polygon") { // REMOVE
	if (bufferedPolygon) {

		// turf.buffer removes feature.geometry._id ...
		bufferedPolygon.geometry["_id"] = gjPolygon.geometry._id;

		if (_TurfHelpers.calcPolyArea(gjPolygon) < 0.5) { return gjPolygon; }
		else if (_TurfHelpers.getType(gjPolygon) !== _TurfHelpers.getType(bufferedPolygon)) {
			return gjPolygon;
		} 
		else if (bufferAmt > 0 && _TurfHelpers.calcPolyArea(bufferedPolygon) < _TurfHelpers.calcPolyArea(gjPolygon)) { 
			return gjPolygon;
		}
		else if (bufferAmt < 0 && _TurfHelpers.calcPolyArea(bufferedPolygon) > _TurfHelpers.calcPolyArea(gjPolygon)) { 
			return gjPolygon; 
		} else {
			// console.error(_TurfHelpers.calcPolyArea(bufferedPolygon))
			return bufferedPolygon
		};

	} else {
		return gjPolygon;
	};

} else {
	return gjPolygon;
};
};


export const _ProcessGeoJSON = (()=>{

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
		hasInvalidFeatsCoords: function(featureCollection = _mandatoryParam()) {
			try {
				turf.centerOfMass(featureCollection);
				return null;
			} catch (validFeatCoordsErr) {
				console.error(`%c validFeatCoordsErr: The feat. coll. has feats. with invalid coords. [turf-error: ${validFeatCoordsErr.message} ]`, `color: red; background: lightgrey;`)
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

		bufferUniteFeats: (featsArray, {maxBufferAmt, bufferStep}={}) => {
			const bufferedFeats = [];
			try {
				if (maxBufferAmt && bufferStep) {
					let bufferAmount = bufferStep;
					while (bufferAmount <= maxBufferAmt) {
						bufferAmount += bufferStep;
						console.log({bufferAmount});
						for (let idx = 0; idx < featsArray.length; idx++) {
							let feat = featsArray[idx];
							feat = _getBufferedPolygon(feat, bufferAmount);
							bufferedFeats.push(feat);
						};
						const unitedFeats = turf.union(...bufferedFeats);
						if (_TurfHelpers.getType(unitedFeats) === "Polygon") return unitedFeats;
					};
				} else {
					return turf.union(...featsArray);
				};
			} catch (bufferFeatsErr) {
				console.error(`bufferFeatsErr: ${bufferFeatsErr.message}`);
			};
		},		

		getPresentationPoly: (geoJSONPoly, {useBuffer, bufferAmt, bufferUnits='kilometers'}) => {
			const presentationPolygon = useBuffer ? _getBufferedPolygon(geoJSONPoly, bufferAmt, {bufferUnits}) : geoJSONPoly;
			return presentationPolygon;
		},

		getFeatCollPoly: (featColl, {useBuffer, bufferAmt, bufferUnits}={}) => {
			
			try {

				turf.geojsonType(featColl, "FeatureCollection", "getFeatCollPolyErr");

					console.log(featColl.properties.clusterName)

				let featCollPoly = _getUsableGeometry(turf.union(...featColl.features)).refinedGeoJSON;
				
					// console.log(turf.getType(featCollPoly), _TurfHelpers.calcPolyArea(featCollPoly));

				if (featCollPoly) featCollPoly = _ProcessGeoJSON.getPresentationPoly(featCollPoly, {useBuffer, bufferAmt, bufferUnits});

					// console.log({bufferAmt})
					// console.log(turf.area(featCollPoly))

				return featCollPoly;

			} catch (getFeatCollPolyErr) {
				console.error(`getFeatCollPolyErr: ${getFeatCollPolyErr.message}`)
			};
		},

		getBbox: geoJSON => {
			try {
				return turf.bbox(geoJSON);
			} catch (getBboxErr) {
				console.error(`getBboxErr: ${getBboxErr.message}`);
			};
		},

		getBboxPoly: (geoJSON) => {
			try {
				return turf.bboxPolygon(_ProcessGeoJSON.getBbox(geoJSON));
			} catch (getBboxPolyErr) {
				console.error(`getBboxPolyErr: ${getBboxPolyErr.message}`);
			};
		},
	};
})();