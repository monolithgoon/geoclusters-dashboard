`use strict`;
const chalk = require("../utils/chalk-messages.js");
const _startcase = require("lodash.startcase");
const CAPITALIZE_THESE_WORDS = require("../constants/words-to-capitalize.js");
const { _capitalizeWords, _getFeatCenter, _joinWordsArray } = require("../utils/helpers.js");
const { CLUSTER_PROPS_PATHS } = require("../constants/cluster-props-paths.js");

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
 * This fn. is used to safely access nested properties within an object. 
 * If the specified properties exist and have a value, their value is returned. 
 * If not, the default value of `null` is returned.
 * 
 * @param {Object} baseProp - The base property to start evaluation from.
 * @param {any} options.defaultReturn - The value to be returned if the evaluation is not successful.
 * @param {Array} otherProps - An array of properties to be evaluated.
 * @returns {any} - The result of the evaluation.
 * 
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
 * const zip = evaluateObjectProps(dataObj, {}, "user", "address", "zip"); // Output: "12345"

 * When a key path is found and evaluated to a value that is not undefined, null, or an empty string, 
 * the value will be returned. 
 * 
 * const unknown = evaluateObjectProps(dataObj, {}, "user", "phone"); // Output: null
 * 
 * If the key path is not found or the evaluated value is undefined, null, or an empty string, 
 * null will be returned since no default return value is specified.
 * 
 */
function evaluateObjectProps(baseProp, { defaultReturn }, ...otherProps) {
	TraverseObject.resetFinalValue();
	TraverseObject.evaluateValue(baseProp, ...otherProps);
	if (
		TraverseObject.getFinalValue() &&
		TraverseObject.getFinalValue() !== "undefined" &&
		TraverseObject.getFinalValue() !== "null"
	)
		return TraverseObject.getFinalValue();
	else if (defaultReturn) return defaultReturn;
	else return null;
}

function returnValidProp(propsObj, propertyPaths) {
	return propertyPaths.reduce((acc, path) => {
		if (acc) return acc;
		const propValue = evaluateObjectProps(propsObj, {}, ...propertyPaths.split("."));
		return propValue === propValue ? propValue : null;
	});
}

exports._getClusterProps = (clusterFeatureCollection = mandatoryParam()) => {
  
	const props = clusterFeatureCollection.properties;

	const clusterID = returnValidProp(props, CLUSTER_PROPS_PATHS.CLUSTER_ID);

	const clusterName = returnValidProp(props, CLUSTER_PROPS_PATHS.CLUSTER_TITLE);

	console.log(chalk.consoleY(clusterID, clusterName));

	return {
		clusterID,
		clusterName,
	};
};
