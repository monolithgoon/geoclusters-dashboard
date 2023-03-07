const API_URLS = require("../constants/api-urls");
const { CLUSTER_FEATS_PROP_PATHS } = require("../constants/cluster-features-prop-path-selectors");
const _fetchData = require("../utils/fetch-data");
const { _catchErrorAsync } = require("../utils/helpers");
const { returnFirstValidPropValue } = require("./helpers");

const mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

/**
 * @async
 * @function getAdditionalFeatureProps
 * @description Fetches additional properties for a feature from a separate API.
 * @param {string} featureResourcePath - The resource path for the feature.
 * @param {string} [apiAuthToken] - An optional API auth token.
 * @returns {Promise<Object|null>} A Promise that resolves with the additional feature properties, or null if featureResourcePath is falsy.
 */
const getAdditionalFeatureProps = _catchErrorAsync(async(featureResourcePath, apiAuthToken) => {

  let additionalFeatProps = {};

	// Return null if featureResourcePath is falsy
	if (!featureResourcePath) return null;

	// Build the full URL from the resource path
	const featAPIUrl = `${API_URLS.GEOCLUSTERS.HOST.LOCAL}/${featureResourcePath}?fields=-farmer_bvn,-farmer_image_base64`;
  
	// Log the URL for debugging purposes
	console.log({ featAPIUrl });

	// Fetch the additional feature properties from the API
	const apiResponse = await _fetchData(featAPIUrl, { timeout: 60000 });

  // Store in var.
  additionalFeatProps = apiResponse?.data;

	// Return the additional feature properties
  	return additionalFeatProps;
}, `getAdditionalFeatureProps`)

// REMOVE > DEPRECATED
// exports._getFlattenedClusterFeatProps = _catchErrorAsync(

// 	async (clusterFeature = mandatoryParam(), { featIdx } = {}) => {

// 		// Extract properties from clusterFeature GeoJSOn object
// 		const props = clusterFeature.properties;

// 		if (!props) throw new Error(`propsInterfaceError: cannot get properties of the cluster feature`);

// 		//
// 		const featureResourcePath = returnFirstValidPropValue(
// 			props,
// 			CLUSTER_FEATS_PROP_PATHS.FEATURE_API_URL
// 		);

//     // 
// 		const additionalFeatProps = await getAdditionalFeatureProps(featureResourcePath, "apiAuthToken");

// 		const featureIndex = featIdx + 1;
// 		const featureID = returnFirstValidPropValue(props, CLUSTER_FEATS_PROP_PATHS.FEATURE_ID);
// 		const featureAdmin = Object.freeze({
// 			admin1: Object.freeze({
// 				id: returnFirstValidPropValue(props, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_ID) || `..`,
// 				names: Object.freeze({
// 					name1: returnFirstValidPropValue(
// 						props,
// 						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE1
// 					),
// 					name2: returnFirstValidPropValue(
// 						props,
// 						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE2
// 					),
// 					name3: returnFirstValidPropValue(
// 						props,
// 						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE3
// 					),
// 				}),
// 			}),
// 		});

// 		return {
// 			featureID,
// 			featureIndex,
// 			// featureArea,
// 			// // featCenterFeat,
// 			// featCenterLat,
// 			// featCenterLng,
// 			// // featOwnerID,
// 			// // featOwnerName: {
// 			// //    firstName,
// 			// //    middleName,
// 			// //    lastName,
// 			// // },
// 			featureAdmin,
// 			// featRenderHash,
// 		};
// 	},
// 	`_getFlattenedClusterFeatProps`
// );

/**
 * @async
 * @function _getFlattenedClusterFeatProps
 * @description Returns a flattened version of the properties of a GeoJSON object representing a cluster feature.
 * @param {Object} clusterFeature - A GeoJSON object representing a cluster feature.
 * @param {Object} [options] - An optional object containing additional options.
 * @param {number} [options.featIdx] - The index of the feature.
 * @returns {Promise<Object>} A Promise that resolves with an object containing the flattened properties of the cluster feature.
 * @throws {Error} Throws an error if the clusterFeature object does not contain a properties object.
 */
exports._getFlattenedClusterFeatProps = _catchErrorAsync(

	async (clusterFeature = mandatoryParam(), { featIdx } = {}) => {

		// Extract properties from clusterFeature GeoJSON object
		const props = clusterFeature.properties;

		// Throw an error if the clusterFeature object does not contain a properties object
		if (!props) throw new Error(`propsInterfaceError: cannot get properties of the cluster feature`);

		// Get the feature resource path from the properties object
		const featureResourcePath = returnFirstValidPropValue(
			props,
			CLUSTER_FEATS_PROP_PATHS.FEATURE_ADDITIONAL_PROPS_API_URL
		);

		// Get additional feature properties by fetching the feature resource path
		const additionalFeatProps = await getAdditionalFeatureProps(featureResourcePath, "apiAuthToken");

    const mergedProps = {
      ...props,
      ...additionalFeatProps,
    }

    if (additionalFeatProps) console.log({ mergedProps })

		// Calculate the feature index as the featIdx parameter plus one
		const featureIndex = featIdx + 1;

		// Get the feature ID from the properties object
		const featureID = returnFirstValidPropValue(props, CLUSTER_FEATS_PROP_PATHS.FEATURE_ID);

		// Get the feature admin object from the properties object
		const featureAdmin = Object.freeze({
			admin1: Object.freeze({
				id: returnFirstValidPropValue(props, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_ID) || `..`,
				names: Object.freeze({
					name1: returnFirstValidPropValue(
						props,
						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE1
					),
					name2: returnFirstValidPropValue(
						props,
						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE2
					),
					name3: returnFirstValidPropValue(
						props,
						CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_TITLE3
					),
				}),
			}),
		});

		// Return an object containing the flattened properties of the cluster feature
		return {
			featureID,
			featureIndex,
			featureAdmin,
		};
	},
	`_getFlattenedClusterFeatProps`
);
