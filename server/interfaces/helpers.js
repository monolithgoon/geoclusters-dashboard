const mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

/**
 * TraverseObject is a closure that provides functions for evaluating the value of keys in a JavaScript object.
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

let finalValue;

const TraverseObject = (() => {

	// Declare a private variable to store the final value after evaluation
	// let finalValue;

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
		resetFinalValue,
	};
})();

/**
 * @function evaluatePropertyValueWithDefault
 * @description This fn. is used to safely access nested properties within an object. 
 *   If the specified properties exist and have a value, their value is returned. 
 *   If not, the default value of `null` is returned.
 * @param {Object} baseProp - The base property to start evaluation from.
 * @param {any} options.defaultReturn - The value to be returned if the evaluation is not successful.
 * @param {Array} otherProps - An array of properties to be evaluated.
 * @returns {any} - The result of the evaluation.
 * 
 * EXAMPLE: 
 * const dataObj = {
		user: {
			name: "John Doe",
			age: 30,
			address: {
				street: "123 Main St",
				city: "Anytown",
				state: "CA",
				zip: "12345"
			}
		}
};
 * const zip = evaluatePropertyValueWithDefault(dataObj, {}, "user", "address", "zip"); // Output: "12345"

 * When a key path is found and evaluated to a value that is not undefined, null, or an empty string, 
 * the value will be returned. 
 * 
 * const unknown = evaluatePropertyValueWithDefault(dataObj, {}, "user", "phone"); // Output: null
 * 
 * If the key path is not found or the evaluated value is undefined, null, or an empty string, 
 * null will be returned since no default return value is specified.
 * 
 */
function evaluatePropertyValueWithDefault(baseProp, { defaultReturn }, ...propPaths) {
	TraverseObject.resetFinalValue();
	TraverseObject.evaluateValue(baseProp, ...propPaths);
	if (
		TraverseObject.getFinalValue() &&
		TraverseObject.getFinalValue() !== "undefined" &&
		TraverseObject.getFinalValue() !== "null"
	)
		return TraverseObject.getFinalValue();
	else if (defaultReturn) return defaultReturn;
	else return null;
}

/**
 * @function returnFirstValidPropValue
 * @description This function takes two arguments: `props`, which is the object to search, and `propertyPaths`, 
 *   which is an array of property paths to check, some of which might have dot notation
 *   It uses the reduce() method to loop through each property path in `propertyPaths`, checking for a truthy value in the `props` object using the evaluatePropertyValueWithDefault() fn. 
 *   If a truthy value is found, the final value of the traversal is returned as the result of the fn.
 *   If none of the property paths yield a truthy value, null is returned.
 * @param {Object} propsObj - The base property to start evaluation from.
 * @param {Array} propertyPaths - An array of property paths
 * 
 * You can then call this fn with any array of property paths you like, for example:
 * 
 * const clusterId = findFirstTruthyValue(props, ["geo_cluster_id", "agc_id", "legacy_agc_id"]);
 * const clusterArea = findFirstTruthyValue(props, ["geo_cluster_details.delineated_area", "legacy_agc_details.delineated_area", "agc_area"]);
 * 
 * This fn. is a generic version of this:
 * 
    const clusterId = ["geo_cluster_id", "agc_id", "legacy_agc_id"].reduce((acc, clusterProp) => {
      if (acc) {
        return acc;
      }
      const value = evaluateObjProps(props, {}, clusterProp);
      return value ? value.toUpperCase() : null;
    }, null);
 */

function returnFirstValidPropValue(propsObj, propertyPaths) {

	return propertyPaths.reduce((acc, path) => {

		if (acc) return acc;
		/**
		 * ...path.split(".") spreads a path with dot notation into an array of strings that can be traversed,
		 * and pass them as multiple arguments to the `evaluatePropertyValueWithDefault()` function.
		 *
		 * For example:
		 * evaluatePropertyValueWithDefault(propsObj, {}, ...[`geo_cluster_details.delineated_area`].split("."))
		 * becomes ->
		 * evaluatePropertyValueWithDefault(propsObj, "geo_cluster_details", "delineated_area")
		 */
		const propValue = evaluatePropertyValueWithDefault(propsObj, {}, ...path.split("."));

		return propValue === propValue ? propValue : null;
	}, null);
}

function calculateAge(dateOfBirth) {
  // Return null if dateOfBirth is falsy
  if (!dateOfBirth) {
    return null;
  }
  
  // Parse dateOfBirth as a Date object
  const dobDate = new Date(dateOfBirth);
  
  // Return null if dobDate is invalid
  if (isNaN(dobDate.getTime())) {
    return null;
  }
  
  // Calculate the age in milliseconds
  const ageInMilliseconds = Date.now() - dobDate.getTime();
  
  // Calculate the age in years, and round down to the nearest integer
  const ageInYears = ageInMilliseconds / 31556926000;
  const age = Math.floor(ageInYears);
  
  // Return the age as a number
  return age;
}


module.exports = {
  mandatoryParam,
  returnFirstValidPropValue,
  calculateAge,
};
