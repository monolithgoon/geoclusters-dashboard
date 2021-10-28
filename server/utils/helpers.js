`use strict`
/** @param {object} featureCollection @returns {object} GeoJSON FeatureCollection*/
const turf = require('@turf/turf');


mandatoryParam = () => {
	throw new Error(`Parameter is required.`);
};


// function replaceAll(baseStr, subStr, replace) {
// 	return baseStr.replace(new RegExp(subStr, `g`), replace);
// };
// function escapeRegExp(string) {
// 	return string.replace()
// }
const findSubStr = (subStr, baseStr) => {
	// console.log({subStr})
	// console.log({baseStr})
	return subStr === baseStr;
};
exports._capitalizeWords = (baseStr, ...subStrings) => {
	
	baseStr = String(baseStr);
	subStrings = subStrings.map(subStr => String(subStr));

	// subStrings.forEach(subStr=>baseStr.split(" ").indexOf(subStr));
	// subStrings.forEach(subStr=>baseStr.split(" ").find(findSubStr.bind(baseStr, subStr)));

	try {
		if (baseStr) {
			// baseStr = String(baseStr);
			// if (typeof baseStr === "string") {
				for (let subStr of subStrings) {
					if (subStr) {
						// console.log({subStr})
						// subStr = String(subStr);
						// if (typeof subStr === "string") {
							const regex = new RegExp(subStr, `g`);
							baseStr = baseStr.replace(regex, subStr.toUpperCase());
							// baseStr = baseStr.replace(/subStr/g, subStr.toUpperCase());
							console.log({baseStr})
						// };
					};
				};
			// };
		};
		return baseStr;
	} catch (capWordsErr) {
		console.error(`capWordsErr: ${capWordsErr.message}`);
	};
};


// CONCAT. STRINGS FROM ARRAY; SEPARATE BY SPACE
exports._joinWordsArray = (keywords, {inclQuotes=false, commaSeparated=false}={}) => {
	let concatArray;
   concatArray = keywords.map((keyword) => {
		if (keyword) {
			if (inclQuotes) return `"${keyword}"`
			else return keyword.trim();
		};
   });
	return commaSeparated ? concatArray.join(",") : concatArray.join(" ");
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


exports._getFeatCenter = (featGeometry) => {

	try {

		const lngLat = turf.centerOfMass(featGeometry).geometry.coordinates; // LNG-LAT FORMAT		
		const latLng = [lngLat[1], lngLat[0]] // CONVERT TO LAT. LNG FORMAT

		return {
			lngLat,
			latLng,
		};
		
	} catch (getFeatCenterErr) {
		console.error(`getFeatCenterErr: ${getFeatCenterErr.message}`)
	};
};


// LOOP THRU EACH FEAT. AND CONVERT STRING COORDS. TO INTEGERS
exports._sanitizeFeatCollCoords = (featureCollection = mandatoryParam()) => {
	// let modFeatureCollection = repairFeatsCoords(_ProcessGeoJSON.hasInvalidFeatsCoords(_ProcessGeoJSON.isValidFeatColl(featureCollection)))
   let modFeatureCollection = repairFeatsCoords(featureCollection);
	return modFeatureCollection ? modFeatureCollection : featureCollection;
};