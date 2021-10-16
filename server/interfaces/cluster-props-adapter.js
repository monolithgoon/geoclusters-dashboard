`use strict`;
const turf = require('@turf/turf');
const _startcase = require('lodash.startcase');
const { _capitalizeWords, _getFeatCenter } = require('../utils/helpers.js');


const _mandatoryParam = () => {
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
				};

				finalValue = tempValue;
            // console.log({finalValue});
            
            // IMPORTANT > RETURN THIS TO INDICATE THAT THIS EVALUATED TO VALUE OR UNDEF.
				return finalValue;
            // return finalValue;
            
			} catch (evaluateValueErr) {
            // console.log(`%c evaluateValueErr: ${evaluateValueErr.message}`,"background-color: orange; color: black;");
            return null;
			};
		},

		getFinalValue: function() {                  
			return finalValue;
		},

		resetFinalValue: function() {
			finalValue = undefined;
		},
	};
})();


// WEAK GEOJSON VALIDATION FUNCTIONS
const CheckGeoJSON = (()=>{

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
		hasInvalidFeatsCoords: function(featureCollection = mandatoryParam()) {
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
	};
})();


// PIPELINE FN.
function evaluateObjProps (baseProp, {defaultReturn}, ...otherProps) {
	TraverseObject.resetFinalValue();
	TraverseObject.evaluateValue(baseProp, ...otherProps);
	if (
		TraverseObject.getFinalValue() && 
		TraverseObject.getFinalValue() !== "undefined" && 
		TraverseObject.getFinalValue() !== "null") return TraverseObject.getFinalValue();
	else if (defaultReturn) return defaultReturn;
	else return null;
};


exports._GetClusterProps = (clusterFeatureCollection = _mandatoryParam()) => {
	
	try {
		
		// FIXME > REMOVE TO OUTSIDE CONTEXT
		if (!CheckGeoJSON.isValidFeatColl(clusterFeatureCollection)) {
			throw new Error(`The supplied GeoJSON is not a valid FeatureCollection`);
		};
      
		// FIXME > REMOVE TO OUTSIDE CONTEXT
		if (!CheckGeoJSON.hasItirableFeats(clusterFeatureCollection.features)) {
			throw new Error(`The supplied FeatureCollection does not have itirable Features`);
		};
      
		const props = clusterFeatureCollection.properties;

		const clusterID = TraverseObject.evaluateValue(props, "geo_cluster_id")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_id")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_id")
			? TraverseObject.getFinalValue()
			: null;
      
		let clusterName = TraverseObject.evaluateValue(props, "geo_cluster_name")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_extended_name")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_name")
			? TraverseObject.getFinalValue()
			: null;

			// clusterName = _startcase(clusterName.toLowerCase());
			// clusterName = _capitalizeWords(clusterName, 'Agc', 'Pmro', 'Fct');
			clusterName = _capitalizeWords(_startcase(clusterName.toLowerCase()), 'Agc', 'Pmro', 'Fct', "Nfgcs", "Ompcs");

		const clusterFeatsNum = clusterFeatureCollection.features.length;
      
		const clusterCreatedDate = evaluateObjProps(props, {}, 'cluster_created_timestamp') || 
									evaluateObjProps(props, {}, 'db_insert_timestamp') || 
									null;

		const clusterArea = TraverseObject.evaluateValue(props, "geo_cluster_details", "delineated_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "delineated_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_area")
			? TraverseObject.getFinalValue()
			: 0;

		const clusterUsedArea = TraverseObject.evaluateValue(props, "geo_cluster_details", "total_allocations_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "legacy_agc_details", "total_allocations_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "total_allocation")
			? TraverseObject.getFinalValue()
			: 0;

		const clusterUnusedArea = TraverseObject.evaluateValue(props, 'unused_land_area')
			? TraverseObject.getFinalValue()
			: 0;
			
		const clusterCenterFeat = TraverseObject.evaluateValue(props, 'agc_center_coords')
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

		const clusterLocation = _startcase(`${evaluateObjProps(props, {}, 'agc_location') || `${clusterAdminLvl4} ${clusterAdminLvl3} ${clusterAdminLvl2} ${clusterAdminLvl1}`}`);

		const clusterRenderHash = evaluateObjProps(props, {}, 'preview_map_url_hash');
		
		const subdivideMetadata = evaluateObjProps(props, {}, 'parcelization_metadata');
		
		// REMOVE
		// let primaryCommodity = evaluateObjProps(props, {}, 'geo_cluster_details', 'primary_crop');
		// 	primaryCommodity = _startcase(primaryCommodity);

		let primaryCommodity = TraverseObject.evaluateValue(props, 'geo_cluster_details', 'primary_crop') 
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, 'primary_crop')
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, 'legacy_agc_details', "primary_crop")
			? TraverseObject.getFinalValue()
			: "Rice";
			primaryCommodity = _startcase(primaryCommodity);

		let clusterGovAdmin1 = Object.freeze({
			adminName1: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'first_name'),
			adminName2: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'middle_name'),
			adminName3: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'last_name'),
		});
		
		let clusterGovAdmin2 = Object.freeze({
			adminName1: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'first_name'),
			adminName2: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'middle_name'),
			adminName3: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'last_name'),
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
			clusterRenderHash,
         subdivideMetadata,
         primaryCommodity,
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
	};
};


exports._getClusterFeatProps = (clusterFeature = _mandatoryParam(), {featIdx}={}) => {
	
	try {
		      
		const props = clusterFeature.properties;

		if (props) {

			const featureID = TraverseObject.evaluateValue(props, "chunk_id")
				? TraverseObject.getFinalValue()
				: TraverseObject.evaluateValue(props, "plot_id")
				? TraverseObject.getFinalValue()
				: null;
	
			const featureIndex = featIdx + 1;		
	
			const featureAdmin = Object.freeze({
				admin1: Object.freeze({
					id: 
						evaluateObjProps(props, {}, "plot_owner_bvn") || // REMOVE BVN REF. <<
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id") ||
						evaluateObjProps(props, {}, "owner_id") || 
						"Undef.",
					names: Object.freeze({
						name1: 
							evaluateObjProps(props, {}, 'owner_name') || 
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_first_name"),
						name2: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_middle_name"),
						name3: evaluateObjProps(props, {}, "farmer_bio_data", "farmer_last_name"),
					}),
					photoURL: 
						evaluateObjProps(props, {}, "owner_photo_url") ||
						evaluateObjProps(props, {}, "farmer_bio_data", "farmer_photo_url") ||
						"/assets/icons/icons8-person-48.png",
					biometrics: {
						names:
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_names"),
						dob: 
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_dob") ||
							"Udef.",
						gender: 
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_gender") ||
							"Udef.",
						idType: 
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id_document_type") || 
							"Undef.",
						idNo: 
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_id_document_no") ||
							"Undef.",
						originAdminLvl1: "Nigeria",
						originAdminLvl2: "Delta",
						originAdminLvl3: "Ukwuani",
					},
					contact: {
						phone:
							evaluateObjProps(props, {}, "farmer_bio_data", "farmer_phone_number_1") ||
							"Undef.",
						baseAddress: "No. 1 Inter Bau Rd."
					},
				}),
			});
	
			const featureArea = 
				evaluateObjProps(props, {}, 'chunk_size') || 
				evaluateObjProps(props, {}, "plot_owner_allocation_size") ||
				evaluateObjProps(props, {}, "plot_size");
	
			let featCenterLat, featCenterLng;
			if (clusterFeature.geometry) {
				[featCenterLat, featCenterLng] = [..._getFeatCenter(clusterFeature.geometry).latLng];
			};
			
			return {
				featureID,
				featureIndex,
				featureArea,
				// featCenterFeat,
				featCenterLat,
				featCenterLng,
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
		};

	} catch (getClusterFeatPropsErr) {
		console.error(`getClusterFeatPropsErr: ${getClusterFeatPropsErr.message}`);
	};
};