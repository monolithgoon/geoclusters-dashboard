/**
 * 
 * This implementation checks for the presence of a "type" property, the type of the "type" property,
 * the presence of a "geometry" property for feature types, and the validity of the "coordinates" array.
 * It also checks the "geometry" type and the length of the "coordinates" array based on the specific "geometry" type.
 * Finally, it iterates over an array of "features" to ensure that each feature is a valid geoJSON.
 *
 */
const _isValidGeoJSON = (geojson) => {
	if (!geojson || typeof geojson !== "object") {
    console.log(`geojson fail`)
		return false;
	}

	if (!geojson.type || typeof geojson.type !== "string") {
    console.log(`geojson fail`)
		return false;
	}

	const type = geojson.type.toLowerCase();

	if (type !== "feature" && type !== "featurecollection") {
    console.log(`geojson fail`)
		return false;
	}

	if (type === "feature" && (!geojson.geometry || typeof geojson.geometry !== "object")) {
    console.log(`geojson fail`)
		return false;
	}

	if (type === "featurecollection" && (!geojson.features || !Array.isArray(geojson.features))) {
    console.log(`geojson fail`)
		return false;
	}

	if (geojson.geometry) {
		const geometry = geojson.geometry;
		if (!geometry.type || typeof geometry.type !== "string") {
      console.log(`geojson fail`)
			return false;
		}

		const geomType = geometry.type.toLowerCase();
		if (
			geomType !== "point" &&
			geomType !== "multipoint" &&
			geomType !== "linestring" &&
			geomType !== "multilinestring" &&
			geomType !== "polygon" &&
			geomType !== "multipolygon" &&
			geomType !== "geometrycollection"
		) {
      console.log(`geojson fail`)
			return false;
		}

		if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
      console.log(`geojson fail`)
			return false;
		}

		if ((geomType === "point" || geomType === "multipoint") && geometry.coordinates.length < 2) {
      console.log(`geojson fail`)
			return false;
		}

		if (
			(geomType === "linestring" || geomType === "multilinestring") &&
			geometry.coordinates.length < 2
		) {
      console.log(`geojson fail`)
			return false;
		}

		if (
			(geomType === "polygon" || geomType === "multipolygon") &&
			geometry.coordinates.length < 3
		) {
      console.log(geojson)
      console.log({geomType})
      console.log(geometry.coordinates)
      console.log(geometry.coordinates.length)
      console.log(`geojson fail`)
			return false;
		}

		if (geomType === "geometrycollection" && geometry.geometries.length === 0) {
      console.log(`geojson fail`)
			return false;
		}
	}

	if (geojson.features) {
		for (let i = 0; i < geojson.features.length; i++) {
			if (!_isValidGeoJSON(geojson.features[i])) {
        console.log(`geojson fail`)
				return false;
			}
		}
	}

  console.log(`geojson fail`)
	return true;
};

export default _isValidGeoJSON;
