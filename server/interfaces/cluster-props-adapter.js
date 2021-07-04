`use strict`;
const turf = require('@turf/turf');
const _startcase = require('lodash.startcase');


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
			: null;
      
		let clusterName = TraverseObject.evaluateValue(props, "geo_cluster_name")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_extended_name")
			? TraverseObject.getFinalValue()
			: null;
			
			clusterName = _startcase(clusterName);

		// TODO
		// capitalze the word 'agc'
		// clusterName = _removeUnderscores(clusterName);
		// clusterName = _includeHyphens(clusterNam);
		// clusterName = _camelize(clusterName);
		// clusterName = _capitalizeWords(clusterName, 'pmro', 'agc');

		const clusterFeatsNum = clusterFeatureCollection.features.length;
      
		const clusterCreated = evaluateObjProps(props, {}, 'cluster_created_timestamp') || 
									evaluateObjProps(props, {}, 'db_insert_timestamp') || 
									null;

		const clusterArea = TraverseObject.evaluateValue(props, "geo_cluster_details", "delineated_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_area")
			? TraverseObject.getFinalValue()
			: null;

		const clusterUsedArea = TraverseObject.evaluateValue(props, "geo_cluster_details", "total_allocations_area")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "total_allocation")
			? TraverseObject.getFinalValue()
			: null;

		const clusterUnusedArea = TraverseObject.evaluateValue(props, 'unused_land_area')
			? TraverseObject.getFinalValue()
			: null;
			
		const clusterCenterFeat = TraverseObject.evaluateValue(props, 'agc_center_coords')
			? TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl1 = TraverseObject.evaluateValue(props, "geo_cluster_details", "country")
			? TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl2 = TraverseObject.evaluateValue(props, "geo_cluster_details", "lga")
			? TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl3 = TraverseObject.evaluateValue(props, "geo_cluster_details", "ward")
			? TraverseObject.getFinalValue()
			: null;

		const clusterRenderHash = evaluateObjProps(props, {}, 'preview_map_url_hash');
		
		const subdivideMetadata = evaluateObjProps(props, {}, 'parcelization_metadata');
		
		let primaryCommodity = evaluateObjProps(props, {}, 'geo_cluster_details', 'primary_crop');
			primaryCommodity = _startcase(primaryCommodity);

		let clusterGovAdmin1 = Object.freeze({
			adminTitle1: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'first_name'),
			adminTitle2: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'middle_name'),
			adminTitle3: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'president', 'last_name'),
		});
		
		let clusterGovAdmin2 = Object.freeze({
			adminTitle1: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'first_name'),
			adminTitle2: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'middle_name'),
			adminTitle3: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'last_name'),
		});

		return {
			clusterID,
			clusterName,
			clusterCreated,
			clusterFeatsNum,
			clusterArea,
			clusterUsedArea,
			clusterUnusedArea,
			clusterCenterFeat,
			clusterAdminLvl1,
			clusterAdminLvl2,
			clusterAdminLvl3,
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

		const featureID = TraverseObject.evaluateValue(props, "chunk_id")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "plot_id")
			? TraverseObject.getFinalValue()
			: null;

		const featureIndex = featIdx + 1;		

		const featureAdmin = Object.freeze({
			admin1: Object.freeze({
				id: evaluateObjProps(props, {}, "plot_owner_bvn") || evaluateObjProps(props, {}, "owner_id"), // REMOVE
				titles: Object.freeze({
					title1: 
						evaluateObjProps(props, {}, 'owner_name') || 
						evaluateObjProps(props, {}, "plot_owner_first_name"),
					title2: evaluateObjProps(props, {}, "plot_owner_middle_name"),
					title3: evaluateObjProps(props, {}, "plot_owner_last_name"),
				}),
				photoBase64: "",
				photoURL: evaluateObjProps(props, {defaultReturn: "/assets/icons/icons8-person-48.png"}, "owner_photo_url")
			}),
		});

		const featureArea = 
			evaluateObjProps(props, {}, 'chunk_size') || 
			evaluateObjProps(props, {}, "plot_owner_allocation_size");
		
		return {
			featureID,
		   featureIndex,
		   featureArea,
		   // featCenterFeat,
		   // featCenterLat,
		   // featCenerLng,
		   // featOwnerID,
		   // featOwnerName: {
		   //    firstName,
		   //    middleName,
		   //    lastName,
		   // },
			featureAdmin,
		   // featRenderHash,
	};

	} catch (getClusterFeatPropsErr) {
		console.error(`getClusterFeatPropsErr: ${getClusterFeatPropsErr.message}`);
	};
};