`use strict`
/** @param {object} featureCollection @returns {object} GeoJSON FeatureCollection*/
const turf = require('@turf/turf');


mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};


// fix the coords in each feat. and return the featColl.
repairFeatsCoords = (featureCollection) => {

	if (featureCollection) {

		const featuresArray = featureCollection.features;
							
		for (let idx = 0; idx < featuresArray.length; idx++) {
			// get a feat.
			const feature = featuresArray[idx];
			// get its coords.
			const featCoords = feature.geometry.coordinates[0];
			// loop thru its coords.
			if (turf.getType(feature) === `Polygon`) {
				for (let idxy = 0; idxy < featCoords.length; idxy++) {
					// get a coord. [lat, lng] array
					const polyCoord = featCoords[idxy];
					// convert both coords. to integers
					feature.geometry.coordinates[0][idxy] = [+polyCoord[0], +polyCoord[1]]
				};         
			} else {
				// TODO
			}
		};
	
		featureCollection.features = featuresArray;
	
		return featureCollection;

	} else {
		return null;
	};
};


// LOOP THRU EACH FEAT. AND CONVERT STRING COORDS. TO INTEGERS
exports._sanitizeFeatCollCoords = (featureCollection = mandatoryParam()) => {
	// let modFeatureCollection = repairFeatsCoords(_CheckGeoJSON.hasInvalidFeatsCoords(_CheckGeoJSON.isValidFeatColl(featureCollection)))
   let modFeatureCollection = repairFeatsCoords(featureCollection);
	return modFeatureCollection ? modFeatureCollection : featureCollection;
};