`use strict`
const turf = require('@turf/turf');


mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

// function replaceAll(baseStr, subStr, replace) {
// 	return baseStr.replace(new RegExp(subStr, `g`), replace);
// };
// function escapeRegExp(string) {
// 	return string.replace()
// }
const findSubStr = (subStr, baseStr) => {
	// console.log({subStr})
	// console.log({baseStr})
	return subStr === baseStr;
};


/**
 * _TraverseObject is a closure that provides functions for evaluating the value of keys in a JavaScript object.
 * The evaluateValue function evaluates the value of the given keys in the JavaScript object and returns the evaluated value. If evaluation fails, it returns null.
 * The getFinalValue function returns the final value after evaluation.
 * The resetFinalValue function resets the final value to undefined.
 * 
 * EXAMPLE -> Evaluate the value of a nested key in an object:
 * 
 * const data = {
		order: {
			items: [
				{ name: "item 1", price: 10 },
				{ name: "item 2", price: 20 }
			],
			total: 30
		}
	};

 * const total = _TraverseObject.evaluateValue(data, "order", "total");
 * console.log(total) // 30
 * 
 */
exports._TraverseObject = (() => {
  // Declare a private variable to store the final value after evaluation
  let finalValue;

  /**
   * Evaluates the value of the given keys in a JavaScript object.
   * @param  {...any} args - The keys to be evaluated in the JavaScript object.
   * @return {any} The evaluated value, or null if evaluation failed.
   */
  function evaluateValue(...keys) {
    try {
      // Initialize a temporary variable with the first key in the keys argument
      let tempValue = keys[0];
      // Loop through the keys argument starting from the second key
      for (let i = 0; i < keys.length - 1; i++) {
        // Access the value of the current key in the tempValue object
        tempValue = tempValue[keys[i + 1]];
      }
      // Set the final value to the value of the last key in the keys argument
      finalValue = tempValue;
      // Return the final value
      return finalValue;
    } catch (error) {
      // Return null if an error occurred during evaluation
      return null;
    }
  }

  /**
   * Gets the final value after evaluation.
   * @return {any} The final value.
   */
  function getFinalValue() {                  
    // Return the final value
    return finalValue;
  }

  /**
   * Resets the final value to undefined.
   */
  function resetFinalValue() {
    // Set the final value to undefined
    finalValue = undefined;
  }

  // Return the public functions of the TraverseObject closure
	return {
		evaluateValue,
		getFinalValue,
		resetFinalValue
		};
	})();


// This is function capitalizes all the substrings in a base string.
exports._capitalizeWords = (baseStr, ...subStrings) => {
  
  // Convert the base string and all substrings to strings.
  baseStr = String(baseStr);
  subStrings = subStrings.map(subStr => String(subStr));

  try {
    // Check if the base string is not empty.
    if (baseStr) {
      // Loop through all substrings.
      for (let subStr of subStrings) {
        // Check if the current substring is not empty.
        if (subStr) {
					// console.log({subStr})
          // Create a regex pattern using the current substring.
          const regex = new RegExp(subStr, `g`);
          // Replace all occurrences of the substring with its uppercase version.
          baseStr = baseStr.replace(regex, subStr.toUpperCase());
					// console.log({baseStr})
        }
      }
    }
    // Return the capitalized base string.
    return baseStr;
  } catch (capWordsErr) {
    // Log an error message if the function encounters an exception.
    console.error(`capWordsErr: ${capWordsErr.message}`);
  }
};


exports._formatNumByThousand = (number) => {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};


// CONCAT. STRINGS FROM ARRAY; SEPARATE BY SPACE
exports._joinWordsArray = (keywords, {inclQuotes=false, commaSeparated=false}={}) => {
	let concatArray;
   concatArray = keywords.map((keyword) => {
		if (keyword) {
			if (inclQuotes) return `"${keyword}"`
			else return keyword.trim();
		};
   });
	return commaSeparated ? concatArray.join(",") : concatArray.join(" ");
};


/**
 * 
 * @function _combineObjArrays
 * @description A function that combines multiple arrays of objects into a single array.
 * @param {...Array<Object>} baseArrays - A variable number of arrays containing objects to be combined.
 * @returns {Array<Object>} An array of objects containing all of the objects from the input arrays.
 */
exports._combineObjArrays = (...baseArrays) => {

  // Create a new array to store the combined objects
  const combinedObjsArray = [];

  // Create a copy of the input arrays so we can modify them without affecting the original arrays
  const arrays = [...baseArrays];

  // Loop through each array in the arrays array
  arrays.forEach((array) => {
    // Check if the array is not null or undefined
    if (array && array?.length > 0) {
      // Loop through each element in the array and push it to the combinedObjsArray
      // MTD. 1
      array.forEach((el) => {
        combinedObjsArray.push(el);
      });
      // MTD. 2
      // combinedObjsArray.push(...array);
    }
  });

  // Return the combined array of objects
  return combinedObjsArray;
}


// fix the coords in each feat. and return the featColl.
repairFeatsCoords = (featureCollection) => {

	if (featureCollection) {

		const featuresArray = featureCollection.features;
							
		for (let idx = 0; idx < featuresArray.length; idx++) {
			// get a feat.
			const feature = featuresArray[idx];
			// get its coords.
			const featCoords = feature.geometry.coordinates[0];
			// loop thru its coords.
			if (turf.getType(feature) === `Polygon`) {
				for (let idxy = 0; idxy < featCoords.length; idxy++) {
					// get a coord. [lat, lng] array
					const polyCoord = featCoords[idxy];
					// convert both coords. to integers
					feature.geometry.coordinates[0][idxy] = [+polyCoord[0], +polyCoord[1]]
				};         
			} else {
				// TODO
			}
		};
	
		featureCollection.features = featuresArray;
	
		return featureCollection;

	} else {
		return null;
	};
};


exports._getFeatCenter = (featGeometry) => {

	try {

		const lngLat = turf.centerOfMass(featGeometry).geometry.coordinates; // LNG-LAT FORMAT		
		const latLng = [lngLat[1], lngLat[0]] // CONVERT TO LAT. LNG FORMAT

		return {
			lngLat,
			latLng,
		};
		
	} catch (getFeatCenterErr) {
		console.error(`getFeatCenterErr: ${getFeatCenterErr.message}`)
	};
};


// LOOP THRU EACH FEAT. AND CONVERT STRING COORDS. TO INTEGERS
exports._sanitizeFeatCollCoords = (featureCollection = mandatoryParam()) => {
	let modFeatureCollection = repairFeatsCoords(featureCollection);
	return modFeatureCollection ? modFeatureCollection : featureCollection;
};

/**
 * Wraps an asynchronous function and catches any errors that occur during its execution.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @param {string} fnDescr - A description of the function (optional).
 * @returns {Function} A new function that catches errors and returns a Promise.
 */
exports._catchAsyncError = (fn, fnDescr = null) => {
  return async function (...params) {
    try {
      return await fn(...params);
    } catch (err) {
      console.error(`${fnDescr || fn.name} error:`, err.message);
      throw err;
    }
  };
}
