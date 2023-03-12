`use strict`;
const _startcase = require("lodash.startcase");
const CAPITALIZE_THESE_WORDS = require("../constants/words-to-capitalize.js");
const {
	_capitalizeWords,
	_getFeatCenter,
	_joinWordsArray,
} = require("../utils/helpers.js");

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
 * const zip = evaluateObjProps(dataObj, {}, "user", "address", "zip"); // Output: "12345"

 * When a key path is found and evaluated to a value that is not undefined, null, or an empty string, 
 * the value will be returned. 
 * 
 * const unknown = evaluateObjProps(dataObj, {}, "user", "phone"); // Output: null
 * 
 * If the key path is not found or the evaluated value is undefined, null, or an empty string, 
 * null will be returned since no default return value is specified.
 * 
 */
function evaluateObjProps(baseProp, { defaultReturn }, ...otherProps) {
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

exports._GetClusterProps = (clusterFeatureCollection = mandatoryParam()) => {
	try {
		const props = clusterFeatureCollection.properties;

		// REMOVE > DEPRC.
		// let clusterID = TraverseObject.evaluateValue(props, "geo_cluster_id")
		// 	? TraverseObject.getFinalValue()
		// 	: TraverseObject.evaluateValue(props, "agc_id")
		// 	? TraverseObject.getFinalValue()
		// 	: TraverseObject.evaluateValue(props, "legacy_agc_id")
		// 	? TraverseObject.getFinalValue()
		// 	: null;

		let clusterID =
			evaluateObjProps(props, {}, "geo_cluster_id") ||
			evaluateObjProps(props, {}, "agc_id") ||
			evaluateObjProps(props, {}, "legacy_agc_id") ||
			null;

		clusterID = clusterID ? clusterID.toUpperCase() : clusterID;

		// REMOVE > DEPRC.
		// let clusterName = TraverseObject.evaluateValue(props, "geo_cluster_name")
		// 	? TraverseObject.getFinalValue()
		// 	: TraverseObject.evaluateValue(props, "agc_extended_name")
		// 	? TraverseObject.getFinalValue()
		// 	: TraverseObject.evaluateValue(props, "legacy_agc_name")
		// 	? TraverseObject.getFinalValue()
		// 	: null;

		let clusterName =
			evaluateObjProps(props, {}, "geo_cluster_name") ||
			evaluateObjProps(props, {}, "agc_extended_name") ||
			evaluateObjProps(props, {}, "legacy_agc_name") ||
			null;

		/**
		 * The code takes a `clusterName` string, performs the following operations on it:
		 * 1. Convert the string to lowercase using `toLowerCase()` method
		 * 2. Capitalize the first letter of each word in the string using `_startcase()` from Lodash library
		 * 3. Capitalize the entire word for specific words in the string using `_capitalizeWords()` from Lodash library.
		 *    The specific words are defined as 'Agc', 'Pmro', 'Fct', "Nfgcs", "Ompcs".
		 *
		 * The final result is assigned back to `clusterName` if it exists, otherwise `clusterName` remains unchanged.
		 */
		// clusterName = _startcase(clusterName.toLowerCase());
		// clusterName = _capitalizeWords(clusterName, 'Agc', 'Pmro', 'Fct');
		clusterName = clusterName
			? _capitalizeWords(_startcase(clusterName.toLowerCase()), ...CAPITALIZE_THESE_WORDS)
			: clusterName;

		const clusterFeatsNum = clusterFeatureCollection.features.length;

		const clusterCreatedDate =
			evaluateObjProps(props, {}, "cluster_created_timestamp") ||
			evaluateObjProps(props, {}, "db_insert_timestamp") ||
			null;

		const clusterArea = TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"delineated_area"
		)
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "delineated_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_area")
			? TraverseObject.getFinalValue()
			: 0;

		const clusterUsedArea = TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"total_allocations_area"
		)
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "total_allocations_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "total_allocation")
			? TraverseObject.getFinalValue()
			: 0;

		const clusterUnusedArea = TraverseObject.evaluateValue(props, "unused_land_area")
			? TraverseObject.getFinalValue()
			: 0;

		const clusterCenterFeat = TraverseObject.evaluateValue(props, "agc_center_coords")
			? TraverseObject.getFinalValue()
			: null;

		let clusterAdminLvl1 = TraverseObject.evaluateValue(props, "geo_cluster_details", "country")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "country")
			? TraverseObject.getFinalValue()
			: null;
		clusterAdminLvl1 = _startcase(clusterAdminLvl1);

		let clusterAdminLvl2 = TraverseObject.evaluateValue(props, "geo_cluster_details", "state")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "state")
			? TraverseObject.getFinalValue()
			: null;
		clusterAdminLvl2 = _startcase(clusterAdminLvl2);

		let clusterAdminLvl3 = TraverseObject.evaluateValue(props, "geo_cluster_details", "lga")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "lga")
			? TraverseObject.getFinalValue()
			: null;
		clusterAdminLvl3 = _startcase(clusterAdminLvl3);

		let clusterAdminLvl4 = TraverseObject.evaluateValue(props, "geo_cluster_details", "ward")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "ward")
			? TraverseObject.getFinalValue()
			: null;
		clusterAdminLvl4 = _startcase(clusterAdminLvl4);

		const clusterLocation = _startcase(
			`${
				evaluateObjProps(props, {}, "agc_location") ||
				`${_joinWordsArray(
					[clusterAdminLvl4, clusterAdminLvl3, clusterAdminLvl2, clusterAdminLvl1],
					{ commaSeparated: true }
				)}`
			}`
		);

		const clusterPreviewUrlHash = evaluateObjProps(props, {}, "preview_map_url_hash");

		const subdivideMetadata = evaluateObjProps(props, {}, "parcelization_metadata");

		let clusterCommodities = TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"primary_crop"
		)
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "primary_crop")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "primary_crop")
			? TraverseObject.getFinalValue()
			: ["Rice"];
		clusterCommodities = _startcase(clusterCommodities);

		let clusterGovAdmin1 = Object.freeze({
			adminName1: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"president",
				"first_name"
			),
			adminName2: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"president",
				"middle_name"
			),
			adminName3: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"president",
				"last_name"
			),
		});

		let clusterGovAdmin2 = Object.freeze({
			adminName1: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"vice_president",
				"first_name"
			),
			adminName2: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"vice_president",
				"middle_name"
			),
			adminName3: evaluateObjProps(
				props,
				{},
				"geo_cluster_governance_structure",
				"vice_president",
				"last_name"
			),
		});

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
			clusterPreviewUrlHash,
			subdivideMetadata,
			clusterCommodities,
			clusterGovAdmin1,
			clusterGovAdmin2,
			// firstVisit,
			// lastVisit,
			// firstFunded,
			// lastFunded,
			// hasIrrigation,
			// hasPowr,
			// hasProcessing,
		};
	} catch (getClusterPropsErr) {
		console.error(`getClusterPropsErr: ${getClusterPropsErr.message}`);
	}
};

exports._GetClusterFeatProps = (clusterFeature = mandatoryParam(), { featIdx } = {}) => {
	try {
		const props = clusterFeature.properties;

		if (props) {
			/**
			 * The code evaluates the value of the "chunk_id" or "plot_id" key in the "props" object.
			 * The TraverseObject.evaluateValue function is called with the "props" object and the first key to be evaluated, "chunk_id".
			 * If the value of "chunk_id" is truthy, it returns the value of the final key evaluated, obtained by calling the TraverseObject.getFinalValue function.
			 * If the value of "chunk_id" is falsy, it moves on to evaluate the value of the "plot_id" key, using the same method as above.
			 * If both values are falsy, the code returns null.
			 */

			// Mtd. 1
			// const featureID = TraverseObject.evaluateValue(props, "chunk_id")
			// 	? TraverseObject.getFinalValue()
			// 	: TraverseObject.evaluateValue(props, "plot_id")
			// 	? TraverseObject.getFinalValue()
			// 	: null;

			// Mtd. 2 -> Using the better evaluateObjProps interface
			const featureID =
				evaluateObjProps(props, {}, "chunk_id") ||
				evaluateObjProps(props, {}, "plot_id") ||
				null;

			const featureIndex = featIdx + 1;

			const featureAdmin = Object.freeze({
				admin1: {
					id:
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id") ||
						evaluateObjProps(props, {}, "owner_id") ||
						"Undef.",
					names: Object.freeze({
						name1:
							evaluateObjProps(props, {}, "owner_name") ||
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_first_name"),
						name2: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_middle_name"),
						name3: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_last_name"),
						statedNames: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_names"),
					}),
					imageUrl:
						evaluateObjProps(props, {}, "owner_photo_url") ||
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_photo_url") ||
						"/src/assets/icons/icons8-person-48.png",
					// names: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_names"),
					dob: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_dob") || null,
					gender: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_gender") || "-",
					govIdType:
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id_document_type") ||
						"-",
					govIdNo:
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id_document_no") || "-",
					originAdminLvl1: "Nigeria",
					originAdminLvl2: "Delta",
					originAdminLvl3: "Ukwuani",
					phoneNo:
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_phone_number_1") || "-",
					baseAddress: "No. 1 Inter Bau Rd.",
				},
			});

			// Construct the feature admin1's full name
			const featureAdmin1FullName =
				featureAdmin.admin1.names.statedNames ||
				_joinWordsArray([featureAdmin.admin1.names.name1, featureAdmin.admin1.names.name2, featureAdmin.admin1.names.name3], {
					commaSeparated: false,
				});

			// Assign the value of "featureAdmin1FullName" to the "fullName" property in the "admin1" object of "featureAdmin"
			featureAdmin.admin1["fullName"] = _startcase(featureAdmin1FullName);

			// COMPUTE ADMIN-1 AGE
			let admin1Age;
			let admin1Dob = featureAdmin.admin1.dob;
			if (admin1Dob && admin1Dob !== "")
				admin1Age = (Date.now() - Date.parse(admin1Dob)) / 31556926000;
			admin1Age = !isNaN(admin1Age) ? admin1Age.toFixed(0) : "-";

			// ASSIGN ADMIN-1 AGE
			featureAdmin.admin1["age"] = admin1Age;

			const featureArea =
				evaluateObjProps(props, {}, "chunk_size") ||
				evaluateObjProps(props, {}, "plot_owner_allocation_size") ||
				evaluateObjProps(props, {}, "plot_size");

			let featureCenterLat, featureCenterLng;
			if (clusterFeature.geometry) {
				[featureCenterLat, featureCenterLng] = [..._getFeatCenter(clusterFeature.geometry).latLng];
			}

			return {
				featureID,
				featureIndex,
				featureArea,
				// featCenterFeat,
				featureCenterLat,
				featureCenterLng,
				// featOwnerID,
				// featOwnerName: {
				//    firstName,
				//    middleName,
				//    lastName,
				// },
				featureAdmin,
				// featRenderHash,
			};
		} else {
			throw new Error(`propsInterfaceErr: Cannot get properties`);
		}
	} catch (getClusterFeatPropsErr) {
		console.error(`getClusterFeatPropsErr: ${getClusterFeatPropsErr.message}`);
	}
};
