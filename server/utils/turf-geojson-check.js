`use strict`;

const turf = require("@turf/turf");

// WEAK GEOJSON VALIDATION FUNCTIONS
const _TurfGeoJSONCheck = (() => {
	return {
		isValidPolygon: function (geoJSON) {
			try {
				if (turf.area(geoJSON)) return true;
				return false;
			} catch (GeoJSONCheckErr) {
				console.error(`GeoJSONCheckErr: ${GeoJSONCheckErr.message}`);
			}
		},

		isValidFeatColl: function (geoJSON = _mandatoryParam()) {
			if (geoJSON) {
				if (turf.getType(geoJSON) === `FeatureCollection`) return geoJSON;
				return false;
			}
		},

		isValidFeature: function (geoJSON = _mandatoryParam()) {
			try {
				if (turf.getType(geoJSON) === `Feature`) return geoJSON;
				else throw new Error(`The supplied GeoJSON is not a valid Feature`);
			} catch (invalidFeatErr) {
				console.error(`invalidFeatErr: ${invalidFeatErr.message}`);
				return false;
			}
		},

		hasItirableFeats: function (featsArray) {
			if (Array.isArray(featsArray)) {
				return featsArray;
			}
			return false;
		},

		// CHECK IF featColl. has feats. with coords. that can be rendered
		hasInvalidFeatsCoords: function (featureCollection = mandatoryParam()) {
			try {
				turf.centerOfMass(featureCollection);
				return null;
			} catch (validFeatCoordsErr) {
				console.error(
					`%c validFeatCoordsErr: The feat. coll. has feats. with invalid coords. [turf-error: ${validFeatCoordsErr.message} ]`,
					`color: red; background: lightgrey;`
				);
				return featureCollection;
			}
		},

		getId: (geoJSON) => {
			try {
				if (turf.getType(geoJSON) === `FeatureCollection`)
					return `feature_collection_${geoJSON._id}`;
				else if (geoJSON.geometry._id) return `feature_${geoJSON.geometry._id}`;
			} catch (getGeoJSONIdErr) {
				console.error(`getGeoJSONIdErr: ${getGeoJSONIdErr.message}`);
			}
		},
	};
})();

/**
 * Weak GeoJSON validation functions
 * These perform simple GeoJSON checks using built-in turf functions
 */
const TurfGeoJSONCheck = (() => {
	return {
		// Check if the given GeoJSON is a valid polygon
		isValidPolygon: function (geoJSON) {
			try {
				// If the area of the GeoJSON can be calculated using the `turf.area` function, it's considered a valid polygon
				if (turf.area(geoJSON)) return true;
				return false;
			} catch (GeoJSONCheckErr) {
				// If an error occurs, log it to the console
				console.error(`GeoJSONCheckErr: ${GeoJSONCheckErr.message}`);
			}
		},

		// Check if the given GeoJSON is a valid FeatureCollection
		isValidFeatColl: function (geoJSON = _mandatoryParam()) {
			// If the geoJSON parameter is truthy, check its type
			if (geoJSON) {
				// If the type is "FeatureCollection", return the GeoJSON
				if (turf.getType(geoJSON) === `FeatureCollection`) return geoJSON;
				return false;
			}
		},

		// Check if the given GeoJSON is a valid Feature
		isValidFeature: function (geoJSON = _mandatoryParam()) {
			try {
				// If the type is "Feature", return the GeoJSON
				if (turf.getType(geoJSON) === `Feature`) return geoJSON;
				// Otherwise, throw an error
				else throw new Error(`The supplied GeoJSON is not a valid Feature`);
			} catch (invalidFeatErr) {
				// If an error occurs, log it to the console
				console.error(`invalidFeatErr: ${invalidFeatErr.message}`);
				return false;
			}
		},

		// Check if the given array contains iterable features
		hasItirableFeats: function (featsArray) {
			// If the given input is an array, return it
			if (Array.isArray(featsArray)) {
				return featsArray;
			}
			return false;
		},

		// Check if the given feature collection has features with invalid coordinates
		hasInvalidFeatsCoords: function (featureCollection = mandatoryParam()) {
			try {
				// Try to calculate the center of mass for the feature collection using the `turf.centerOfMass` function
				turf.centerOfMass(featureCollection);
				// If no error occurs, return null
				return null;
			} catch (validFeatCoordsErr) {
				// If an error occurs, log it to the console with a specific error message and formatting
				console.error(
					`%c validFeatCoordsErr: The feat. coll. has feats. with invalid coords. [turf-error: ${validFeatCoordsErr.message} ]`,
					`color: red; background: lightgrey;`
				);
				return featureCollection;
			}
		},
	};
})();

module.exports = _TurfGeoJSONCheck;
