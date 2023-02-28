`use strict`;
const _startcase = require("lodash.startcase");
const CAPITALIZE_THESE_WORDS = require("../constants/words-to-capitalize.js");
const { _capitalizeWords, _joinWordsArray } = require("../utils/helpers.js");
const { CLUSTER_PROP_PATHS } = require("../constants/cluster-prop-path-selectors.js");
const chalk = require("../utils/chalk-messages.js");

const mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

// TRAVERSE AN OBJECT USING AN ARRAY OF OBJ. PROPS.
let finalValue;
const TraverseObject = (() => {
	// let finalValue;

	return {
		evaluateValue: function thisFunction(...args) {
			// console.log(thisFunction)

			const keys = [...args];

			try {
				let tempValue = keys[0];

				for (let idx = 0; idx < keys.length - 1; idx++) {
					tempValue = tempValue[keys[idx + 1]];
					// console.log({tempValue});
				}

				finalValue = tempValue;
				// console.log({finalValue});

				// IMPORTANT > RETURN THIS TO INDICATE THAT THIS EVALUATED TO VALUE OR UNDEF.
				return finalValue;
				// return finalValue;
			} catch (evaluateValueErr) {
				// console.log(`%c evaluateValueErr: ${evaluateValueErr.message}`,"background-color: orange; color: black;");
				return null;
			}
		},

		getFinalValue: function () {
			return finalValue;
		},

		resetFinalValue: function () {
			finalValue = undefined;
		},
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

/**
 * @function formatClusterLocation
 * @description Formats a location string with comma-separated values, capitalizing the first letter of each word.
 * @param {string} locationStr - The input location string.
 * @returns {string} The formatted location string.
 */
function formatClusterLocation(locationStr) {

  // Remove leading and trailing spaces and split the string into an array, and remove empty strings
  const arr = locationStr.trim().split(', ').filter(str=>str.length>0);

  // Capitalize the first letter of each word and join them with a comma
  return arr.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ");
}


/**
 * Returns an object containing various properties of a geocluster feature collection.
 * @param {object} clusterFeatureCollection - The cluster feature collection to extract properties from.
 * @returns {object} An object containing various properties of the cluster feature collection.
 */
exports._getFlatClusterProps = (clusterFeatureCollection = mandatoryParam()) => {

  try {
    // Extract properties from clusterFeatureCollection object
    const props = clusterFeatureCollection.properties;

    // Extract cluster ID and cluster name from properties
    const clusterID = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_ID);
    let clusterName = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_TITLE);
				clusterName = clusterName
					? _capitalizeWords(_startcase(clusterName.toLowerCase()), ...CAPITALIZE_THESE_WORDS)
					: clusterName;

    // Extract other properties from properties object
    const clusterCreatedDate = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_CREATED_DATE);
    const clusterFeatsNum = clusterFeatureCollection.features.length;
    const clusterArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_AREA) || 0;
    const clusterUsedArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_USED_AREA) || 0;
    const clusterUnusedArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_UNUSED_AREA) || 0;
    const clusterCenterFeat = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_CENTER_POINT_FEAT);
    const clusterAdminLvl1 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL1);
    const clusterAdminLvl2 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL2);
    const clusterAdminLvl3 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL3);
    const clusterAdminLvl4 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL4);
		// Merge Ward, LGA, State, Country into one string representing the cluster locaiton
    const clusterLocationSpecific = _joinWordsArray(
			[clusterAdminLvl4, clusterAdminLvl3, clusterAdminLvl2, clusterAdminLvl1],
      { commaSeparated: true }
			);
		const clusterLocationGeneral = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_GENERAL) || `Nigeria`
		const clusterLocation = formatClusterLocation(`${clusterLocationSpecific}, ${clusterLocationGeneral}`);
    const clusterRenderHash = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_RENDER_HASH);
    const subdivideMetadata = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.AUTO_SUBDIVISION_METADATA);
    let clusterCommodities = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_COMMODITIES);
				clusterCommodities = _startcase(clusterCommodities);
    const clusterGovAdmin1 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_GOV_ADMIN1_NAME1);
    const clusterGovAdmin2 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_GOV_ADMIN1_NAME2);

    // Return object with extracted properties
    return {
      clusterID,
      clusterName,
      clusterCreatedDate,
      clusterFeatsNum,
      clusterArea,
      clusterUsedArea,
      clusterUnusedArea,
      clusterCenterFeat,
      clusterAdminLvl1,
      clusterAdminLvl2,
      clusterAdminLvl3,
      clusterAdminLvl4,
      clusterLocation,
      clusterRenderHash,
      subdivideMetadata,
      clusterCommodities,
      clusterGovAdmin1,
      clusterGovAdmin2,
    };
  } catch (error) {
    // Handle errors
    console.error(chalk.fail(`_getFlatClusterProps: ${error.message}`));
  }
};
