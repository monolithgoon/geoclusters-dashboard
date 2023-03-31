const APP_CONFIG = require("../config/config");
const API_URLS = require("../constants/api-urls");
const { CLUSTER_FEATS_PROP_PATHS } = require("../constants/cluster-feature-prop-path-selectors");
const _fetchData = require("../utils/fetch-data");
const { _catchErrorAsync, _joinWordsArray, _getFeatCenter } = require("../utils/helpers");
const { returnFirstValidPropValue, calculateAge } = require("./helpers");

const mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};

// REMOVE > DEPRC. BELOW
// const getAdditionalFeatureProps = _catchErrorAsync(async (featureResourcePath, apiAuthToken) => {

// 	let additionalFeatProps = {};

// 	// Return null if featureResourcePath is falsy
// 	if (!featureResourcePath) return null;

// 	// IMPORTANT
// 	// Build the full URL from the resource path
// 	const featAPIUrl = `${APP_CONFIG.geoclustersHostUrl}/${featureResourcePath}?fields=-farmer_bvn,-farmer_image_base64`;

// 	// Log the URL for debugging purposes
// 	console.log({ featAPIUrl });

// 	// Fetch the additional feature properties from the API
// 	const apiResponse = await _fetchData(featAPIUrl, { timeout: 60000 });

// 	// Store in var.
// 	additionalFeatProps = apiResponse?.data[0];

// 	// Return the additional feature properties
// 	return additionalFeatProps;
// }, `getAdditionalFeatureProps`);

/**
 * @async
 * @function getAdditionalFeatureProps
 * @description Fetches additional properties for a feature from a separate API.
 * @param {string} featureResourcePath - The resource path for the feature.
 * @param {string} [apiAuthToken] - An optional API auth token.
 * @returns {Promise<Object|null>} A Promise that resolves with the additional feature properties, or null if featureResourcePath is falsy.
 */
const getAdditionalFeatureProps = async (featureResourcePath, apiAuthToken) => {
	let additionalFeatProps = {};

	// Return {} if featureResourcePath is falsy
	if (!featureResourcePath) return {};

	// IMPORTANT
	// Build the full URL from the resource path
	const featAPIUrl = `${APP_CONFIG.geoclustersHostUrl}/${featureResourcePath}?fields=-farmer_bvn,-farmer_image_base64`;

	// Log the URL for debugging purposes
	console.log({ featAPIUrl });

	try {
		// Fetch the additional feature properties from the API
		const apiResponse = await _fetchData(featAPIUrl, { timeout: 60000 });

		console.log({ apiResponse });

		if (apiResponse) {
			// Store in var.
			additionalFeatProps = apiResponse.data[0];
		}

	} catch (error) {
		// Handle the error gracefully
		console.error(`Error in getAdditionalFeatureProps: ${error.message}`);
		additionalFeatProps = {};
	}

	// Return the additional feature properties
	return additionalFeatProps;
};

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

		// Get additional feature properties by fetching with the feature resource path
		const additionalFeatProps = await getAdditionalFeatureProps(featureResourcePath, "apiAuthToken");

		const mergedProps = {
			...props,
			...additionalFeatProps,
		};

		// if (additionalFeatProps) console.log({ mergedProps });

		// Calculate the feature index as the featIdx parameter plus one
		const featureIndex = featIdx + 1;

		// Get the feature ID from the properties object
		const featureID = returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ID);

		//
		featureArea = returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_AREA);

		//
		featureAreaUnits = returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_AREA_UNITS);

		// Get the feature admin object from the properties object
		const featureAdmin = Object.freeze({
			admin1: {
				id: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_ID),
				name1: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_NAME1),
				name2: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_NAME2),
				name3: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_NAME3),
				statedNames: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_NAMES),
				dob: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_DOB),
				gender: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_GENDER),
				govIdType: returnFirstValidPropValue(
					mergedProps,
					CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_GOV_ID_TYPE
				),
				govIdNo: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_GOV_ID_NO),
				phoneNo: returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_PHONE_NO),
				emailAddress: returnFirstValidPropValue(
					mergedProps,
					CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_EMAIL_ADDRESS
				),
				imageUrl:
					returnFirstValidPropValue(mergedProps, CLUSTER_FEATS_PROP_PATHS.FEATURE_ADMIN_PERSON_IMAGE_URL) ||
					"/dist/assets/icons/icons8-person-48.png",
			},
		});

		// Construct the feature admin1's full name
		const featureAdmin1FullName =
			featureAdmin.admin1.statedNames ||
			_joinWordsArray([featureAdmin.admin1.name1, featureAdmin.admin1.name2, featureAdmin.admin1.name3], {
				commaSeparated: false,
			});

		// Assign the value of "featureAdmin1FullName" to the "fullName" property in the "admin1" object of "featureAdmin"
		featureAdmin.admin1["fullName"] = featureAdmin1FullName;

		// Assign the calculated age of admin1's dob to the "age" property in featureAdmin object.
		featureAdmin.admin1["age"] = calculateAge(featureAdmin.admin1.dob);

		//
		// if (clusterFeature.geometry) {
		const [featureCenterLat, featureCenterLng] = [..._getFeatCenter(clusterFeature.geometry).latLng];
		// }

		// Return an object containing the flattened properties of the cluster feature
		return {
			featureID,
			featureIndex,
			featureAdmin,
			featureArea,
			featureAreaUnits,
			featureCenterLat,
			featureCenterLng,
		};
	},
	`_getFlattenedClusterFeatProps`
);
