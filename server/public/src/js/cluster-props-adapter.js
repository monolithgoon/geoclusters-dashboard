`use strict`;
const mandatory = () => {
	throw new Error(`Parameter is required.`);
};

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

// TRAVERSE AN OBJECT WITH AN ARRAY OF OBJ. PROPS.
const TraverseObject = (() => {

	let finalValue;

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
            
			} catch (evaluateValueErr) {
            console.log(`%c evaluateValueErr: ${evaluateValueErr.message}`,"background-color: orange; color: black;");
            return null;
			};
		},

		getFinalValue: function() {
                  
			return finalValue;
		},
	};
})();

// TODO > IMPLETEMENT "CLUSTER" CLASS HERE

export function _getClusterFeatureProps(clusterFeature = mandatory()) {
	const props = clusterFeature.properties;
	const featureID = TraverseObject.evaluateValue(props, "chunk_id")
		? TraverseObject.getFinalValue()
		: TraverseObject.evaluateValue(props, "plot_id")
		? TraverseObject.getFinalValue()
		: null;
	const plotOwnerID = TraverseObject.evaluateValue(props, "plot_owner_bvn") // REMOVE
		? TraverseObject.getFinalValue()
		: TraverseObject.evaluateValue(props, "owner_id")
		? TraverseObject.getFinalValue()
		: null;
	return {
		featureID,
		plotOwnerID,
	}
}

export function _getClusterProps(clusterFeatureCollection = mandatory()) {

	try {
      
		const props = clusterFeatureCollection.properties;

		const clusterID = TraverseObject.evaluateValue(props, "geo_cluster_id")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_id")
			? TraverseObject.getFinalValue()
			: null;
      
		const clusterName = TraverseObject.evaluateValue(props, "geo_cluster_name")
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_extended_name")
			? TraverseObject.getFinalValue()
			: null;
      
		const clusterCreated = props.db_insert_timestamp || null;
		const clusterFeatsNum = clusterFeatureCollection.features.length;

		const clusterArea = TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"delineated_area"
		)
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "agc_area")
			? TraverseObject.getFinalValue()
			: null;

		const clusterUsedArea = TraverseObject.evaluateValue(
			props,
			"geo_cluster_details",
			"total_allocations_area"
		)
			? TraverseObject.getFinalValue()
			: TraverseObject.evaluateValue(props, "total_allocation")
			? TraverseObject.getFinalValue()
			: null;

		const clusterUnusedArea = props.unused_land_area;
		const clusterCenterFeat = props.agc_center_coords;

		const clusterAdminLvl1 = TraverseObject.evaluateValue(props, "geo_cluster_details", "country")
      ? TraverseObject.getFinalValue()
      : null;

		const clusterAdminLvl2 = TraverseObject.evaluateValue(props, "geo_cluster_details", "lga")
      ? TraverseObject.getFinalValue()
      : null;

		const clusterAdminLvl3 = TraverseObject.evaluateValue(props, "geo_cluster_details", "ward")
      ? TraverseObject.getFinalValue()
      : null;

		const clusterRenderHash = TraverseObject.evaluateValue(props, "preview_map_url_hash")
			? TraverseObject.getFinalValue()
			: null;

		const subdivideMetadata = TraverseObject.evaluateValue(props, "parcelization_metadata")
			? TraverseObject.getFinalValue()
			: null;

		const primaryCommodity = TraverseObject.evaluateValue(props, "geo_cluster_details", "primary_crop")
			? TraverseObject.getFinalValue()
			: null;

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

			// clusterGov: {
			//    president: {
			//       fistName,
			//       middleName,
			//       lastName,
			//    }
			// },
			
			// clusterFeatures: {
			//    featIndex,
			//    featArea,
			//    featCenterFeat,
			//    featCenterLat,
			//    featCenerLng,
			//    featOwnerID,
			//    featOwnerName: {
			//       firstName,
			//       middleName,
			//       lastName,
			//    },
			//    featOwnerPhotoBase64,
			//    featOwnerPhotoURL,
			//    featRenderHash,
			// },
		};
	} catch (gjInterfaceErr) {
		console.error(`gjInterfaceErr: ${gjInterfaceErr.message}`);
	}
}
