`use strict`;
import { _CheckGeoJSON, _mandatoryParam, _capitalizePropValues, _TraverseObject} from "./_utils.js";


// REMOVE > DEPRC.
const traverseObject = (...args) => {
	const props = [...args];

	try {
		let evalProp;
		let tempProp = props[0];

		for (let idx = 0; idx < props.length - 1; idx++) {
			tempProp = tempProp[props[idx + 1]];
		}

		evalProp = tempProp;

		// let evalProp = props[0]; // tempProp = props[0]
		// console.log(evalProp);
		// const prop2 = evalProp[props[1]]; // tempProp = tempProp[props[idx+1]]
		// console.log(prop2);
		// const prop3 = prop2[props[2]]; // tempProp = tempProp[props[idx+2]]
		// evalProp = prop3;
		// console.log(prop3); // evalProp = tempProp

		return evalProp;
	} catch (evalPropErr) {
      console.log(`%c evalPropErr: ${evalPropErr.message}`,"background-color: orange; color: black;");
		return null;
	}
};


// PIPELINE FN.
function evaluateObjProps (baseProp, {defaultReturn}, ...otherProps) {
	_TraverseObject.evaluateValue(baseProp, ...otherProps);
	if (
		_TraverseObject.getFinalValue() && 
		_TraverseObject.getFinalValue() !== "undefined" && 
		_TraverseObject.getFinalValue() !== "null") return _TraverseObject.getFinalValue();
	else if (defaultReturn) return defaultReturn;
	else return null;
};


export const _GetClusterProps = (clusterFeatureCollection = _mandatoryParam()) => {
	
	try {
		
		// FIXME > REMOVE TO OUTSIDE CONTEXT
		if (!_CheckGeoJSON.isValidFeatColl(clusterFeatureCollection)) {
			throw new Error(`The supplied GeoJSON is not a valid FeatureCollection`);
		};
      
		// FIXME > REMOVE TO OUTSIDE CONTEXT
		if (!_CheckGeoJSON.hasItirableFeats(clusterFeatureCollection.features)) {
			throw new Error(`The supplied FeatureCollection does not have itirable Features`);
		};
      
		const props = clusterFeatureCollection.properties;

		const clusterID = _TraverseObject.evaluateValue(props, "geo_cluster_id")
			? _TraverseObject.getFinalValue()
			: _TraverseObject.evaluateValue(props, "agc_id")
			? _TraverseObject.getFinalValue()
			: null;
      
		let clusterName = _TraverseObject.evaluateValue(props, "geo_cluster_name")
			? _TraverseObject.getFinalValue()
			: _TraverseObject.evaluateValue(props, "agc_extended_name")
			? _TraverseObject.getFinalValue()
			: null;
		// TODO
		clusterName = _.startCase(clusterName);
		// capitalze the word 'agc'
		// clusterName = _removeUnderscores(clusterName);
		// clusterName = _includeHyphens(clusterNam);
		// clusterName = _camelize(clusterName);
		// clusterName = _capitalizeWords(clusterName, 'pmro', 'agc');

		const clusterFeatsNum = clusterFeatureCollection.features.length;
      
		const clusterCreated = evaluateObjProps(props, {}, 'cluster_created_timestamp') || 
									evaluateObjProps(props, {}, 'db_insert_timestamp') || 
									null;

		const clusterArea = _TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"delineated_area"
		)
			? _TraverseObject.getFinalValue()
			: _TraverseObject.evaluateValue(props, "agc_area")
			? _TraverseObject.getFinalValue()
			: null;

		const clusterUsedArea = _TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"total_allocations_area"
		)
			? _TraverseObject.getFinalValue()
			: _TraverseObject.evaluateValue(props, "total_allocation")
			? _TraverseObject.getFinalValue()
			: null;

		const clusterUnusedArea = _TraverseObject.evaluateValue(props, 'unused_land_area')
			? _TraverseObject.getFinalValue()
			: null;
			
		const clusterCenterFeat = _TraverseObject.evaluateValue(props, 'agc_center_coords')
			? _TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl1 = _TraverseObject.evaluateValue(props, "geo_cluster_details", "country")
			? _TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl2 = _TraverseObject.evaluateValue(props, "geo_cluster_details", "lga")
			? _TraverseObject.getFinalValue()
			: null;

		const clusterAdminLvl3 = _TraverseObject.evaluateValue(props, "geo_cluster_details", "ward")
			? _TraverseObject.getFinalValue()
			: null;

		const clusterRenderHash = _TraverseObject.evaluateValue(props, "preview_map_url_hash")
			? _TraverseObject.getFinalValue()
			: null;

		const subdivideMetadata = _TraverseObject.evaluateValue(props, "parcelization_metadata")
			? _TraverseObject.getFinalValue()
			: null;

		const primaryCommodity = evaluateObjProps(props, {}, 'geo_cluster_details', 'primary_crop');

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

	} catch (getClusterProps) {
		console.error(`getClusterProps: ${getClusterProps.message}`);
	};
};


export function _getClusterFeatProps(clusterFeature = _mandatoryParam(), {featIdx}={}) {
	
	try {
		      
		const props = clusterFeature.properties;

		const featureID = _TraverseObject.evaluateValue(props, "chunk_id")
			? _TraverseObject.getFinalValue()
			: _TraverseObject.evaluateValue(props, "plot_id")
			? _TraverseObject.getFinalValue()
			: null;

		const featureIndex = featIdx + 1;		

		const featureAdmin = Object.freeze({
			admin1: {
				id: evaluateObjProps(props, {}, "plot_owner_bvn") || evaluateObjProps(props, {}, "owner_id"), // REMOVE
				titles: {
					title1: evaluateObjProps(props, {}, 'owner_name'),
					title2: "",
					title3: "",
				},
				photoBase64: "",
				photoURL: evaluateObjProps(props, {defaultReturn: "/assets/icons/icons8-person-48.png"}, "owner_photo_url")
			},
		})
		const featureAdmin1 = Object.freeze({
			adminTitle1: evaluateObjProps(props, {}, 'owner_name'),
			// TODO > PROPERLY DEFINE FEATURE ADMIN. MODEL
			// adminTitle1: evaluateObjProps(props, {}, 'owner_name') || evaluateObjProps(props, {}, 'feature_owner_name'),
			// adminTitle2: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'middle_name'),
			// adminTitle3: evaluateObjProps(props, {}, 'geo_cluster_governance_structure', 'vice_president', 'last_name'),
		});
		console.log(featureAdmin1);

		const featureArea = evaluateObjProps(props, {}, 'chunk_size');
		
		return {
			featureID,
		   featureIndex,
			featureAdmin1,
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