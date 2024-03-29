`use strict`
const turf = require('@turf/turf');
const chalk = require("./chalk-messages.js")


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


/**
 * @function _joinWordsArray
 * @description This function will take an array of strings and returns a single string with the option to separate the values by commas and/or wrap them in quotes.
 * @description If a nested array is found, it will be flattened and its elements will be concatenated.
 * @param {string[]} keywords - An array of strings to concatenate
 * @param {Object} [options] - Optional configuration object
 * @param {boolean} [options.inclQuotes=false] - Whether to wrap each string with quotes
 * @param {boolean} [options.commaSeparated=false] - Whether to separate strings with commas instead of spaces
 * @returns {string} - The concatenated string
 */
exports._joinWordsArray = (keywords, {inclQuotes=false, commaSeparated=false}={}) => {
  try {
    let concatArray = [];

    // Iterate over the array of keywords
    for (let i = 0; i < keywords.length; i++) {
      let keyword = keywords[i];

      // If the keyword is an array, flatten it and concatenate its elements
      if (Array.isArray(keyword)) {
        concatArray.push(exports._joinWordsArray(keyword, {inclQuotes, commaSeparated}));
      }

      // If the keyword is a string, wrap it in quotes if the `inclQuotes` option is enabled
      else if (typeof keyword === "string") {
        concatArray.push(inclQuotes ? `"${keyword}"` : keyword.trim());
      }
    }

    // Join the resulting array into a single string, using either spaces or commas as the separator
    return commaSeparated ? concatArray.join(", ") : concatArray.join(" ");

  } catch (error) {
    // If an error occurs during the process, log an error message to the console
    console.error(chalk.fail(`_joinWordsArray: ${error.message}`))
  }
};


/**
 * 
 * @function _combineObjArrays
 * @description A function that combines multiple arrays of objects into a single array.
 * @param {...Array<Object>} baseArrays - A variable number of arrays containing objects to be combined.
 * @returns {Array<Object>} An array of objects containing all of the objects from the input arrays.
 */
// REMOVE > DEPRC. BELOW
// exports._combineObjArrays = (...baseArrays) => {

//   // Create a new array to store the combined objects
//   const combinedObjsArray = [];

//   // Create a copy of the input arrays so we can modify them without affecting the original arrays
//   const arrays = [...baseArrays];

//   // Loop through each array in the arrays array
//   arrays.forEach((array) => {
//     console.log({ array })
//     // Check if the array is not null or undefined
//     if (array && array?.length > 0) {
//       // Loop through each element in the array and push it to the combinedObjsArray
//       // MTD. 1
//       array.forEach((el) => {
//         combinedObjsArray.push(el);
//       });
//       // MTD. 2
//       // combinedObjsArray.push(...array);
//     }
//   });

//   // Return the combined array of objects
//   return combinedObjsArray;
// }
exports._combineObjArrays = (...baseArrays) => {

	// Check if no arguments are passed to the function or if the arguments passed are not valid arrays
	if (
		!baseArrays ||
		baseArrays.length === 0 ||
		!baseArrays.every((array) => Array.isArray(array) && array.every((el) => typeof el === "object"))
	) {
		// Return an empty array if no valid arguments are passed
		return [];
	}

	// Create a new array to store the combined objects
	const combinedObjsArray = [];

	// // Combine the input arrays using the spread syntax
	// const arrays = [...baseArrays]; // REMOVE > UN-NEEDED

	// Concatenate all the objects from the input arrays into a new array
	// const concatenatedArray = [].concat(...arrays); // REMOVE > UN-NEEDED
	const concatenatedArray = [].concat(...baseArrays);

	// Loop through each element in the concatenated array
	concatenatedArray.forEach((el) => {
		// Check if the element is not null or undefined
		if (el) {
			// Push the element to the combinedObjsArray
			combinedObjsArray.push(el);
		}
	});

	// Return the combined array of objects
	return combinedObjsArray;
};



// REMOVE -> DEPRECATED FOR `repairPolygonFeatsCoords`
// fix the coords in each feat. and return the featColl.
const repairFeatsCoords = (featureCollection) => {

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

const repairPolygonFeatsCoords = (featureCollection) => {

  // Check if the input feature collection is defined
  if (featureCollection) {
    
    // Get the array of features from the feature collection
    const featuresArray = featureCollection.features;
    
    // Loop through each feature in the array
    for (let idx = 0; idx < featuresArray.length; idx++) {
      
      // Get the current feature and its coordinates
      const feature = featuresArray[idx];
      const featCoords = feature.geometry.coordinates[0];
      
      // Check if the feature is a polygon
      if (turf.getType(feature) === `Polygon`) {
        
        // Loop through each coordinate in the polygon
        for (let idxy = 0; idxy < featCoords.length; idxy++) {
          
          // get a coord. [lat, lng] array
          const polyCoord = featCoords[idxy];

          // Get the current coordinate and convert its latitude and longitude to integers
          feature.geometry.coordinates[0][idxy] = [+polyCoord[0], +polyCoord[1]];
        }

        // Append the first coordinate to the end of the array in order to "close" the polygon
        const firstCoord = feature.geometry.coordinates[0][0];
        feature.geometry.coordinates[0].push([+firstCoord[0], +firstCoord[1]]);
        
      } else {
        // TODO: add functionality for non-polygon features
      }
    }
    
    // Update the array of features in the original feature collection with the repaired features
    featureCollection.features = featuresArray;
    
    // Return the repaired feature collection
    return featureCollection;
    
  } else {
    // Return null if the input feature collection is not defined
    return null;
  }
};

// LOOP THRU EACH FEAT. AND CONVERT STRING COORDS. TO INTEGERS
exports._sanitizeFeatCollCoords = (featureCollection = mandatoryParam()) => {
	let modFeatureCollection = repairPolygonFeatsCoords(featureCollection);
	return modFeatureCollection ? modFeatureCollection : featureCollection;
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

/**
 * Wraps an asynchronous function and catches any errors that occur during its execution.
 *
 * @param {Function} fn - The asynchronous function to wrap.
 * @param {string} fnDescr - A description of the function (optional).
 * @returns {Function} A new function that catches errors and returns a Promise.
 */
exports._catchErrorAsync = (fn, fnDescr = null) => {
  return async function (...params) {
    try {
      return await fn(...params);
    } catch (err) {
      console.error(chalk.fail(`${fnDescr || fn.name} error:`, err.message));
      console.error({ err });
    }
  };
}

exports._catchErrorSync = (fn, fnDescr = null) => {
  return function (...params) {
    try {
      return fn(...params);
    } catch (err) {
      console.error(chalk.fail(`${fnDescr || fn.name} error:`, err.message));
    }
  }
}