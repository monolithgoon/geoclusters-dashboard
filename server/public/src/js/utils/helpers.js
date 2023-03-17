`use strict`;
import DEFAULT_APP_SETTINGS from "../constants/default-app-settings.js";

export const _delayExecution = async (durationMs) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), durationMs);
	});
};

export const _mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

// GLOBAL TRY CATCH ERR. HANDLER
export function _errorHandler(callback, errName) {
	try {
		console.log(callback);
		callback();
	} catch (tryCatchErr) {
		console.error(`${errName}: ${tryCatchErr.message}`);
	}
}

/**
 * @function _joinWordsArray
 * @description Joins an array of words into a single string, with optional quotes and comma separators
 *
 * @param {Array} keywords - An array of words to concatenate
 * @param {Object} [options={}] - An optional object with the following keys:
 * @param {Boolean} [options.inclQuotes=false] - Whether or not to include quotes around each keyword in the string
 * @param {Boolean} [options.commaSeparated=false] - Whether or not to separate the keywords by commas in the string
 *
 * @returns {String} A string of concatenated keywords
 */
export function _joinWordsArray(keywords, { inclQuotes = false, commaSeparated = false } = {}) {
	// Filter out any falsy values in the array and trim each word
	const concatArray = keywords
		.filter(Boolean)
		.map((keyword) => (inclQuotes ? `"${keyword.trim()}"` : keyword.trim()));

	// Join the array into a single string, using either commas or spaces as the separator
	return commaSeparated ? concatArray.join(", ") : concatArray.join(" ");
}

// REMOVE > DEPRECATED
// CALC. TIME TO EXE. A FN.
export const ExecutionMeasureFn = (function () {
	let returnedData, executionMs;

	return {
		execute: async function (callback) {
			console.log(
				`%c This funciton [${callback}] is executing ..`,
				`background-color: lightgrey; color: blue;`
			);

			let exeStart = window.performance.now();

			returnedData = await callback();

			let exeEnd = window.performance.now();

			executionMs = exeEnd - exeStart;
		},

		getExecutionTime: function () {
			console.log(
				`%c The fn. executed in: ${(executionMs / 1000).toFixed(2)} seconds`,
				`background-color: yellow; color: blue;`
			);
			return executionMs;
		},

		getData: function () {
			return returnedData;
		},
	};
})();


// TRAVERSE AN OBJECT USING AN ARRAY OF OBJ. PROPS.
// This code is a utility function that allows you to evaluate values from an object based on an array of keys.

// _TraverseObject object:
// This object evaluates the value of an object based on the properties in the array, and returns the final value. If the evaluation fails, it returns null.
// It also provides a method to retrieve the final value of the evaluation.

// evaluateValue:
// This method takes in an array of object properties and uses them to traverse the object. It uses a for loop to access each property one by one, starting from the first property in the array.
// The method returns the final value of the object after traversal, or null if the evaluation fails.

// getFinalValue:
// This method returns the final value of the evaluation performed by the evaluateValue method.
export const _TraverseObject = (() => {
	let finalValue;

	return {
		// This method evaluates the final value of an object being traversed with an array of properties.
		// The method takes in a rest parameter 'args' that contains the array of object properties.
		evaluateValue: function thisFunction(...args) {
			// console.log(thisFunction)

			const keys = [...args];

			try {
				// The 'tempValue' variable is assigned the first element of the 'keys' array.
				// This value will be used to traverse the object.
				let tempValue = keys[0];

				// The for loop iterates over the 'keys' array and sets the value of 'tempValue'
				// to the next property in the object being traversed.
				// The loop stops one iteration before the end of the 'keys' array to avoid accessing
				// an undefined property.
				for (let idx = 0; idx < keys.length - 1; idx++) {
					tempValue = tempValue[keys[idx + 1]];
					// console.log({tempValue});
				}

				// The 'finalValue' variable is assigned the value of 'tempValue', which is the final evaluated value of the object.
				finalValue = tempValue;
				// console.log({finalValue});

				// IMPORTANT > RETURN THIS TO INDICATE THAT THIS EVALUATED TO VALUE OR UNDEF.
				return finalValue;
			} catch (evaluateValueErr) {
				// console.log(`%c evaluateValueErr: ${evaluateValueErr.message}`,"background-color: orange; color: black;");
				return null;
			}
		},

		getFinalValue: function () {
			// This line of code returns the final evaluated value of the object.
			return finalValue;
		},
	};
})();

/**
 * @function _stringifyPropValues
 * @description Converts the property values of an object to strings
 * @param {Object} obj - The object to be modified.
 * @returns {Object} - A modified object with the property values now all being strings.
 */
export const _stringifyPropValues = (obj) => {
	return Object.keys(obj).reduce((modObject, key) => {
		modObject[key] = obj[key].toString();
		return modObject;
	}, {});
};

/**
 * @function _capitalizePropValues
 * @description Converts the values of an object to uppercase strings
 * @param {Object} obj - The object to be modified
 * @returns {Object} The modified object with capitalized values
 */
export const _capitalizePropValues = (obj) => {
	return Object.keys(obj).reduce((modObject, key) => {
		modObject[key] = (`` + obj[key]).toUpperCase();
		return modObject;
	}, {});
};

/**
 * @function _formatNumByThousand
 * @description Formats a number by adding commas as thousands separators.
 * @param {number} number - The number to be formatted.
 * @return {string} The formatted number as a string.
 */
export const _formatNumByThousand = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * @function _pluralizeString
 * @description Returns the pluralized string if the number is greater than 1
 * @param {string} string - The string to be pluralized.
 * @param {number} n - The number to determine if the string should be pluralized.
 * @return {string} The pluralized string.
 */
export function _pluralizeString(n, string) {
	if (n === 1) {
		return string;
	} else {
		return string + "s";
	}
}

/**
 * @function _capitalizeFirstLetter
 * @description Capitalizes the first letter of a string.
 * @param {string} string - The string to be capitalized.
 * @return {string} The capitalized string.
 */
export function _capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Gets the checked radio button in a group of radio buttons and returns its element and value.
 *
 * @param {Array<HTMLElement>} radioGroup - An array of radio button elements.
 * @return {Object} The checked radio button element and its value, or an error message if there is no checked radio or more than one checked radio in the group.
 */
export function _getCheckedRadio(radioGroup) {
	const checkedRadiosArray = [];
	let radioElement = null;
	let radioValue = null;

	try {
		if (radioGroup) {
			radioGroup.forEach((radio) => {
				if (radio.checked) {
					checkedRadiosArray.push(radio);
				}
			});

			if (checkedRadiosArray.length > 1) {
				throw new Error(`Cannot have more than one checked radio per group`);
			}
			if (checkedRadiosArray.length === 0) {
				throw new Error(`At least one radio must be checked by default`);
			}
			if (checkedRadiosArray.length > 0) {
				radioElement = checkedRadiosArray[0];
				radioValue = checkedRadiosArray[0].value;
			}

			return {
				radioElement,
				radioValue,
			};
		}
	} catch (getCheckedRadioErr) {
		console.error(`getCheckedRadioErr: ${getCheckedRadioErr.message}`);
	}
}

/**
 * Replaces the value of a specified data attribute in the dataset of a div element.
 *
 * @param {HTMLElement} div - The div element to modify.
 * @param {string} dataAttribute - The name of the data attribute to be replaced.
 * @param {string} data - The new value for the data attribute.
 */
export function _replaceDataset(div, dataAttribute, data) {
	if (div.dataset[dataAttribute]) {
		div.dataset[dataAttribute] = data;
	}
}

export const _GeometryMath = (() => {
	return {
		// MATH FORMULA TO CALC. BEARING
		computeBearing: (fromCoords, toCoords) => {
			const lat1 = fromCoords[0];
			const long1 = fromCoords[1];
			const lat2 = toCoords[0];
			const long2 = toCoords[1];

			// CONVERT COORDS. TO RADIANS > φ is latitude, λ is longitude in radians
			const φ1 = (lat1 * Math.PI) / 180;
			const φ2 = (lat2 * Math.PI) / 180;
			const λ1 = (long1 * Math.PI) / 180;
			const λ2 = (long2 * Math.PI) / 180;

			const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
			const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
			const θ = Math.atan2(y, x);
			const bearing = ((θ * 180) / Math.PI + 360) % 360; // in degrees

			return bearing;
		},

		// CONVERT DEGREES TO DEG. MIN. SEC. (DMS) FORMAT
		getDegMinSec: (deg) => {
			var absolute = Math.abs(deg);

			var degrees = Math.floor(absolute);
			var minutesNotTruncated = (absolute - degrees) * 60;
			var minutes = Math.floor(minutesNotTruncated);
			var seconds = ((minutesNotTruncated - minutes) * 60).toFixed(2);

			return `${degrees}° ${minutes}' ${seconds}"`;
		},
	};
})();

// FIXME
const catchError2 = function (fn, errDescr = null) {
	return function () {
		try {
			// console.log(fn)
			return fn.apply(this, arguments);
		} catch (err) {
			console.error(`${errDescr}: ${err.message}`);
		}
	};
};

const handleError = (err) => {
	console.error(err.message);
};

const catchError = (fn, errorHandler) => {
	return function () {
		fn().catch(errorHandler);
	};
};

export const _TurfHelpers = (() => {
	return {
		getType: (geoJSON) => {
			try {
				return turf.getType(geoJSON);
			} catch (getTypeErr) {
				console.error(`getTypeErr: ${getTypeErr.message}`);
			}
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

		buffer: (geoJSON, bufferRadius, { units = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS }) => {
			// return catchError2(turf.buffer(geoJSON, bufferRadius, {units}), "turfBufferErr");

			try {
				return turf.buffer(geoJSON, bufferRadius, { units });
			} catch (turfBufferErr) {
				console.error(`turfBufferErr: ${turfBufferErr.message}`);
			}
		},

		midpoint: (coords1, coords2) => {
			try {
				return turf.midpoint(coords1, coords2);
			} catch (turfMidpointErr) {
				console.error(`turfMidpointErr: ${turfMidpointErr.message}`);
			}
		},

		centerOfMass: (featGeometry) => {
			try {
				return turf.centerOfMass(featGeometry);
			} catch (comErr) {
				console.error(`comErr: ${comErr.message}`);
			}
		},

		distance: (coords1, coords2, { distUnits }) => {
			try {
				return turf.distance(coords1, coords2, { units: distUnits });
			} catch (turfDistanceErr) {
				console.error(`turfDistanceErr: ${turfDistanceErr.message}`);
			}
		},

		centerOfMass: (geoJSONFeature) => {
			try {
				return turf.centerOfMass(geoJSONFeature);
			} catch (pointOnFeatErr) {
				console.error(`pointOnFeatErr: ${pointOnFeatErr.message}`);
			}
		},

		unkinkPolygon: (gjPolygon) => {
			try {
				return turf.unkinkPolygon(gjPolygon);
			} catch (unkinkPolyErr) {
				console.error(`unkinkPolyErr: ${unkinkPolyErr.message}`);
			}
		},

		getLngLat: (geoJSONFeature) => {
			try {
				return _TurfHelpers.centerOfMass(geoJSONFeature).geometry.coordinates;
			} catch (getLngLatErr) {
				console.error(`getLngLatErr: ${getLngLatErr.message}`);
			}
		},

		calcPolyArea: (gjPolygon, { units = `hectares` } = {}) => {
			try {
				if (
					(gjPolygon && turf.getType(gjPolygon) === "Polygon") ||
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
					}

					return polyArea;
				}
			} catch (calcPolyAreaErr) {
				console.error(`calcPolyAreaErr: ${calcPolyAreaErr.message}`);
			}
		},
	};
})();

/**
 * Extracts the Polygon features from a GeoJSON geometry collection and returns them as an array.
 *
 * @param {Object} geojson - The GeoJSON object.
 * @return {Array<Object>} The Polygon features from the GeoJSON geometry collection, or `null` if there are no polygons.
 */
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
			polygonFeats = null;
		}
	});

	return polygonFeats;
}

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
			(refinedGeoJSON = geoJSON), (discardedMultipolyParts = null);
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
			}

			break;

		case "GeometryCollection":
			polygonFeats = getGeomCollPolyFeats(geoJSON);
			break;

		default:
			break;
	}

	if (polygonFeats && polygonFeats.length > 0) {
		// ONLY 1 POLYGON WAS FOUND IN THE GEOJSON
		if (polygonFeats.length === 1) {
			refinedGeoJSON = polygonFeats[0];
		} else {
			// console.warn(`[ Selecting a dominant polygon .. ]`)

			// LOOP THRU THE FEATURES & CHOOSE THE DOINANT FEAT.
			for (let feature of polygonFeats) {
				const featureAreaRatio =
					_TurfHelpers.calcPolyArea(feature) / _TurfHelpers.calcPolyArea(geoJSON);

				// console.log({featureAreaRatio});

				if (featureAreaRatio >= 0.6) {
					// CHOOSE THE DOINANT FEAT.
					refinedGeoJSON = feature;
				} else if (featureAreaRatio >= 0.4 && featureAreaRatio < 0.6) {
					// THE FEATURES ARE PROB. SIMILAR IN SIZE > LOOP THRU & TRY TO MERGE THEM

					// PERFORM A SIMPLE UNION, THEN COLLECT ALL THE PARTS THAT DON'T UNITE
					// refinedGeoJSON = turf.union(...polygonFeats);
					refinedGeoJSON = _ProcessGeoJSON.bufferUniteFeats(polygonFeats, {
						maxBufferAmt: 0.05,
						bufferStep: 0.0025,
					});

					if (_TurfHelpers.getType(refinedGeoJSON) !== "Polygon") {
						console.error(`FAILED REFINING GEOJSON`);
						discardedMultipolyParts.push(...polygonFeats);
						// } else {
						// 	return refinedGeoJSON;
					}
				} else if (featureAreaRatio >= 0.005 && featureAreaRatio < 0.4) {
					// TRACK SMALL, BUT NOT INSIGNIFICANT FEATURES

					// ADD CUSTOM PROPERTIES
					feature.properties["chunk_size"] = _TurfHelpers.calcPolyArea(feature);

					discardedMultipolyParts.push(feature);
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
		discardedMultipolyParts,
	};
}

// REMOVE > DEPRC.
// HACK > REMOVES THE "TAILS"  FROM THE CHUNKS
// SOMETIMES, BUFFERING A POLYGON DEFORMS IT
// turf.buffer SOMETIMES MUTILATES A MULTIPOLYGON CHUNK; DEAL WITH THAT
// THIS REVERTS THE BUFFER TO THE ORG. POLY IF ANY DEFORMATION WOULD HAPPEN
// export function _getBufferedPolygon(gjPolygon, bufferAmt, { bufferUnits = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS } = {}) {
// 	// if (_TurfHelpers.getType(gjPolygon) === "Polygon") { // REMOVE
// 	if (gjPolygon) {
// 		let bufferedPolygon = _TurfHelpers.buffer(gjPolygon, bufferAmt, { units: bufferUnits });

// 		// console.log(_TurfHelpers.calcPolyArea(gjPolygon))
// 		// console.log({bufferAmt}, {bufferUnits})
// 		// console.log({bufferedPolygon})
// 		// if (bufferedPolygon) console.log(_TurfHelpers.calcPolyArea(bufferedPolygon))

// 		// SOMETIMES turf.buffer RETURNES "undefined"
// 		// if (bufferedPolygon && _TurfHelpers.getType(bufferedPolygon) === "Polygon") { // REMOVE
// 		if (bufferedPolygon) {

// 			// turf.buffer removes feature.geometry._id ...
// 			// This puts it back
// 			bufferedPolygon.geometry["_id"] = gjPolygon.geometry._id;

// 			if (_TurfHelpers.calcPolyArea(gjPolygon) < 0.5) {
// 				return gjPolygon;
// 			} else if (_TurfHelpers.getType(gjPolygon) !== _TurfHelpers.getType(bufferedPolygon)) {
// 				return gjPolygon;
// 			} else if (
// 				bufferAmt > 0 &&
// 				_TurfHelpers.calcPolyArea(bufferedPolygon) < _TurfHelpers.calcPolyArea(gjPolygon)
// 			) {
// 				return gjPolygon;
// 			} else if (
// 				bufferAmt < 0 &&
// 				_TurfHelpers.calcPolyArea(bufferedPolygon) > _TurfHelpers.calcPolyArea(gjPolygon)
// 			) {
// 				return gjPolygon;
// 			} else {
// 				// console.error(_TurfHelpers.calcPolyArea(bufferedPolygon))
// 				return bufferedPolygon;
// 			}
// 		} else {
// 			return gjPolygon;
// 		}
// 	} else {
// 		return gjPolygon;
// 	}
// }

/**
 * Buffers a GeoJSON polygon feature by a specified amount
 * @param {Object} gjPolygon - GeoJSON polygon feature
 * @param {number} bufferAmt - Buffer amount
 * @param {Object} [options] - Optional parameters
 * @param {string} [options.bufferUnits=DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS] - Buffer units
 * @returns {Object} - Buffered GeoJSON polygon feature
 */
export function _getBufferedPolygon(gjPolygon, bufferAmt, { bufferUnits = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS } = {}) {

	// Check if gjPolygon exists
	if (gjPolygon) {

		// Buffer the polygon using Turf.js
		let bufferedPolygon = _TurfHelpers.buffer(gjPolygon, bufferAmt, { units: bufferUnits });

		// Handle potential issues with Turf.js buffer function
		if (bufferedPolygon) {
			
			// Put feature.geometry._id back into buffered polygon
			bufferedPolygon.geometry["_id"] = gjPolygon.geometry._id;

			// Calculate area of original and buffered polygons
			const originalArea = _TurfHelpers.calcPolyArea(gjPolygon);
			const bufferedArea = _TurfHelpers.calcPolyArea(bufferedPolygon);

			// Decide whether to return original or buffered polygon
			if (originalArea < 0.5) {
				// Return original polygon if area is too small
				return gjPolygon;
			} else if (_TurfHelpers.getType(gjPolygon) !== _TurfHelpers.getType(bufferedPolygon)) {
				// Return original polygon if types are different
				return gjPolygon;
			} else if (bufferAmt > 0 && bufferedArea < originalArea) {
				// Return original polygon if buffer caused deformation
				return gjPolygon;
			} else if (bufferAmt < 0 && bufferedArea > originalArea) {
				// Return original polygon if negative buffer caused deformation
				return gjPolygon;
			} else {
				// Return buffered polygon
				return bufferedPolygon;
			}
		} else {
			// Return original polygon if Turf.js buffer function returns undefined
			return gjPolygon;
		}
	} else {
		// Return null if gjPolygon is null or undefined
		return null;
	}
}

export const _ProcessGeoJSON = (() => {

	return {

		getId: (geoJSON) => {
			try {
				if (turf.getType(geoJSON) === `FeatureCollection`)
					return `feature_collection_${geoJSON._id}`;
				else if (geoJSON.geometry._id) return `feature_${geoJSON.geometry._id}`;
			} catch (getGeoJSONIdErr) {
				console.error(`getGeoJSONIdErr: ${getGeoJSONIdErr.message}`);
			}
		},

		// REMOVE
		// bufferUniteFeats: (featsArray, { maxBufferAmt, bufferStep } = {}) => {
		// 	const bufferedFeats = [];
		// 	try {
		// 		if (maxBufferAmt && bufferStep) {
		// 			let bufferAmount = bufferStep;
		// 			while (bufferAmount <= maxBufferAmt) {
		// 				bufferAmount += bufferStep;
		// 				console.log({ bufferAmount });
		// 				for (let idx = 0; idx < featsArray.length; idx++) {
		// 					let feat = featsArray[idx];
		// 					feat = _getBufferedPolygon(feat, bufferAmount);
		// 					bufferedFeats.push(feat);
		// 				}
		// 				const unitedFeats = turf.union(...bufferedFeats);
		// 				if (_TurfHelpers.getType(unitedFeats) === "Polygon") return unitedFeats;
		// 			}
		// 		} else {
		// 			return turf.union(...featsArray);
		// 		}
		// 	} catch (bufferFeatsErr) {
		// 		console.error(`bufferFeatsErr: ${bufferFeatsErr.message}`);
		// 	}
		// },
		/**
		 * Buffers and unites an array of features.
		 * This function buffers the input features with a certain amount and then unites them.
		 * The amount of buffering and the maximum amount of buffering can be specified using the options object.
		 * Note that if `maxBufferAmt` and `bufferStep` are not provided in the options object, the function will simply return the united features without buffering them.
		 * @param {Object[]} featsArray - The array of features to buffer and unite.
		 * @param {Object} [options] - The options object.
		 * @param {number} [options.maxBufferAmt] - The maximum buffer amount.
		 * @param {number} [options.bufferStep] - The buffer step amount.
		 * @returns {Object} The united polygon feature.
		 */
		bufferUniteFeats: (featsArray, { maxBufferAmt, bufferStep } = {}) => {

			// Initialize an array to store the buffered features
			const bufferedFeats = [];

			try {
				// If the maximum buffer amount and the buffer step are specified, buffer the features multiple times
				if (maxBufferAmt && bufferStep) {
					// Start with the buffer step
					let bufferAmount = bufferStep;

					// Keep buffering until the buffer amount exceeds the maximum buffer amount
					while (bufferAmount <= maxBufferAmt) {
						bufferAmount += bufferStep;

						// Buffer each feature and store it in the bufferedFeats array
						for (let idx = 0; idx < featsArray.length; idx++) {
							let feat = featsArray[idx];
							feat = _getBufferedPolygon(feat, bufferAmount);
							bufferedFeats.push(feat);
						}

						// Unite the buffered features
						const unitedFeats = turf.union(...bufferedFeats);

						// If the result is a polygon, return it
						if (_TurfHelpers.getType(unitedFeats) === "Polygon") return unitedFeats;
					}
				}
				// If the maximum buffer amount and the buffer step are not specified, unite the features as they are
				else {
					return turf.union(...featsArray);
				}
			} catch (bufferFeatsErr) {
				console.error(`bufferFeatsErr: ${bufferFeatsErr.message}`);
			}
		},


		getPresentationPoly: (geoJSONPoly, { useBuffer, bufferAmt, bufferUnits = DEFAULT_APP_SETTINGS.TURF_POLYGON_BUFFER_UNITS }) => {
			const presentationPolygon = useBuffer
				? _getBufferedPolygon(geoJSONPoly, bufferAmt, { bufferUnits })
				: geoJSONPoly;
			return presentationPolygon;
		},

		// IMPORTANT
		/**
		 * @description Returns a polygon GeoJSON object that represents the union of all the polygons in the given FeatureCollection.
		 * @param {Object} featColl - A FeatureCollection object with polygon features.
		 * @param {Object} [options={}] - An object that specifies the optional parameters to use.
		 * @param {Boolean} [options.useBuffer] - Specifies whether to buffer the polygon or not.
		 * @param {Number} [options.bufferAmt] - The amount to buffer the polygon by, in the units specified by `bufferUnits`.
		 * @param {String} [options.bufferUnits] - The units to use for buffering the polygon.
		 * @returns {Object} A GeoJSON polygon object representing the union of all the polygons in the given FeatureCollection.
		 */
		getFeatCollPoly: (featColl, { useBuffer, bufferAmt, bufferUnits } = {}) => {
			try {
				// Ensure that the input object is a FeatureCollection with polygons
				turf.geojsonType(featColl, "FeatureCollection", "getFeatCollPolyErr");

				// Debugging console.log statement
				console.log(featColl.properties.clusterName);

				// Get the union of all polygons and refine it if necessary
				let featCollPoly = _getUsableGeometry(turf.union(...featColl.features)).refinedGeoJSON;

				// Buffer the polygon if specified
				if (featCollPoly && useBuffer) {
					featCollPoly = _ProcessGeoJSON.getPresentationPoly(featCollPoly, {useBuffer, bufferAmt, bufferUnits});
				}

				// Debugging console.log statements
				// console.log({bufferAmt})
				// console.log(turf.area(featCollPoly))

				return featCollPoly;

			} catch (getFeatCollPolyErr) {
				// If there is an error, log it and return null
				console.error(`getFeatCollPolyErr: ${getFeatCollPolyErr.message}`);
				return null;
			}
		},

		getBbox: (geoJSON) => {
			try {
				return turf.bbox(geoJSON);z
			} catch (getBboxErr) {
				console.error(`getBboxErr: ${getBboxErr.message}`);
			}
		},

		getBboxPoly: (geoJSON) => {
			try {
				return turf.bboxPolygon(_ProcessGeoJSON.getBbox(geoJSON));
			} catch (getBboxPolyErr) {
				console.error(`getBboxPolyErr: ${getBboxPolyErr.message}`);
			}
		},
	};
})();

export const _Arrays = (() => {
	return {
		// ARR1. CONTAINS SOME ELEMENTS OF ARR2
		containsSomeChk: (baseArr, targetArr) => {
			targetArr.some((targetArrEl) => baseArr.indexOf(targetArrEl) >= 0);
		},

		// containsAllChk: (baseArr, targetArr) => {
		//    return targetArr.every(targetElement => baseArr.includes(targetElement));
		// },
		// ARR1. CONTAINS ALL ELEMENTS OF ARR2.
		containsAllChk: (baseArr, targetArr) => {
			const missingElements = [];
			const allMatchChk = targetArr.every((targetElement) => baseArr.includes(targetElement));
			if (!allMatchChk) {
				targetArr.forEach((targetElement) => {
					const targetElementChk = baseArr.includes(targetElement);
					if (!targetElementChk) missingElements.push(targetElement);
				});
			}
			return {
				allMatchChk,
				missingElements,
			};
		},

		identicalChk: (arr1, arr2) => {
			const len1 = arr1.length;
			if (len1 !== arr2.length) return false; // LENGTHS NOT EQUAL
			let idx = len1;
			while (idx--) {
				if (arr1[idx] !== arr2[idx]) return false;
			}
			return true;
		},

		// CHECK BOTH ARRAYS ARE IDENTICAL; CHECK NESTD ARRAYS RECURSIVELY
		deepIdenticalChk: (baseArr, targetArr, { isStrict }) => {
			// TODO > CONVERT FROM Array.prototype TO NORMAL FN.
			Array.prototype.compare = function (array, isStrict) {
				if (!array) return false;
				if (arguments.length === 1) isStrict = true;
				if (this.length !== array.length) return false;
				for (let idx = 0; idx < this.length; idx++) {
					const thisCurrElememnt = this[idx];
					// CHK FOR & COMPARE NESTED ARRAYS
					if (thisCurrElememnt instanceof Array && array[idx] instanceof Array) {
						if (!thisCurrElememnt.compare(array[idx], isStrict)) return false;
					} else if (isStrict && thisCurrElememnt !== array[idx]) return false;
					else if (!isStrict) return this.sort().compare(array.sort(), true);
				}
				return true;
			};
		},

		/**
		 * @function getNonDuplicateElements
		 * @description A function that compares two string arrays and returns the non-duplicate strings or empty [] if they are an exact match.
		 *
		 * @param {Array} expandingArray - The first array of strings to compare.
		 * @param {Array} staticArray - The second array of strings to compare.
		 *
		 * @returns {Array|[]} - Returns an array of non-duplicate strings, or empty [] if they are an exact match.
		 */
		getNonDuplicateElements: ({ expandingArray, staticArray }) => {
			let uniqueStrings = [];

			// Loop through each string in the first array
			for (let str1 of expandingArray) {
				// Check if the current string exists in the second array
				if (staticArray.indexOf(str1) === -1) {
					uniqueStrings.push(str1);
				}
			}

			// Return the list of duplicate strings
			return uniqueStrings;
		},

		/**
		 * @function getNonDuplicateObjs
		 * @description A function that finds the non-duplicate objects in two arrays based on a shared property.
		 *
		 * @param {Array} objArr1 - The first array of objects to search through.
		 * @param {Array} objArr2 - The second array of objects to search through.
		 * @param {string} prop - The property that the objects will be compared against.
		 *
		 * @returns {Array|false} - Returns an array of non-duplicate objects, or false if there are no duplicates.
		 */
		getNonDuplicateObjs: (objArr1, objArr2, prop) => {
			let uniqueObjs = [];

			// Loop through each array of objects
			for (let arr of [objArr1, objArr2]) {
				// Loop through each object in the current array
				for (let obj of arr) {
					let isDuplicate = false;

					// Check if the current object is a duplicate
					for (let uniqueObj of uniqueObjs) {
						if (uniqueObj[prop] === obj[prop]) {
							isDuplicate = true;
							break;
						}
					}

					// If the current object is not a duplicate, add it to the list of unique objects
					if (!isDuplicate) {
						uniqueObjs.push(obj);
					}
				}
			}

			// If there are no duplicates, return false
			if (uniqueObjs.length === [].concat(objArr1, objArr2).length) {
				return false;
			}

			// Otherwise, return the list of unique objects
			return uniqueObjs;
		},
	};
})();
