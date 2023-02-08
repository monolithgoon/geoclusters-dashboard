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
		console.log(`geojson fail`);
		return false;
	}

	if (!geojson.type || typeof geojson.type !== "string") {
		console.log(`geojson fail`);
		return false;
	}

	const type = geojson.type.toLowerCase();

	if (type !== "feature" && type !== "featurecollection") {
		console.log(`geojson fail`);
		return false;
	}

	if (type === "feature" && (!geojson.geometry || typeof geojson.geometry !== "object")) {
		console.log(`geojson fail`);
		return false;
	}

	if (type === "featurecollection" && (!geojson.features || !Array.isArray(geojson.features))) {
		console.log(`geojson fail`);
		return false;
	}

	if (geojson.geometry) {
		const geometry = geojson.geometry;
		if (!geometry.type || typeof geometry.type !== "string") {
			console.log(`geojson fail`);
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
			console.log(`geojson fail`);
			return false;
		}

		// flatten the coordinates array
		/**
		 * const coordinates = [[array1], [array2], [array3]];
		 * const flattenedCoordinates = [].concat(...coordinates);
		 */
		const flatCoords = [].concat(...[].concat(...geometry.coordinates));

		if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
			console.log(`geojson fail`);
			return false;
		}

		if ((geomType === "point" || geomType === "multipoint") && geometry.coordinates.length < 2) {
			console.log(`geojson fail`);
			return false;
		}

		if (
			(geomType === "linestring" || geomType === "multilinestring") &&
			geometry.coordinates.length < 2
		) {
			console.log(`geojson fail`);
			return false;
		}

		if ((geomType === "polygon" || geomType === "multipolygon") && flatCoords.length < 3) {
			console.log(`geojson fail`);
			return false;
		}

		if (geomType === "geometrycollection" && geometry.geometries.length === 0) {
			console.log(`geojson fail`);
			return false;
		}
	}

	if (geojson.features) {
		for (let i = 0; i < geojson.features.length; i++) {
			if (!_isValidGeoJSON(geojson.features[i])) {
				console.log(`geojson fail`);
				return false;
			}
		}
	}

	return true;
};

const isValidGeoJSON = (geoJSON) => {
	if (!geoJSON) return false;
	if (typeof geoJSON !== "object") return false;
	if (!geoJSON.hasOwnProperty("type")) return false;
	if (typeof geoJSON.type !== "string") return false;
	if (
		![
			"Point",
			"MultiPoint",
			"LineString",
			"MultiLineString",
			"Polygon",
			"MultiPolygon",
			"GeometryCollection",
			"Feature",
			"FeatureCollection",
		].includes(geoJSON.type)
	) {
		console.log("The value of 'type' is not one of the 9 GeoJSON types");
		return false;
	}

	// Check the structure of the GeoJSON based on its type
	switch (geoJSON.type) {
		case "Point":
			return (
				Array.isArray(geoJSON.coordinates) &&
				geoJSON.coordinates.length === 2 &&
				typeof geoJSON.coordinates[0] === "number" &&
				typeof geoJSON.coordinates[1] === "number"
			);

		case "MultiPoint":
			if (!Array.isArray(geoJSON.coordinates)) return false;
			return geoJSON.coordinates.every(
				(point) =>
					Array.isArray(point) &&
					point.length === 2 &&
					typeof point[0] === "number" &&
					typeof point[1] === "number"
			);

		case "LineString":
			if (!Array.isArray(geoJSON.coordinates)) return false;
			return (
				geoJSON.coordinates.length >= 2 &&
				geoJSON.coordinates.every(
					(point) =>
						Array.isArray(point) &&
						point.length === 2 &&
						typeof point[0] === "number" &&
						typeof point[1] === "number"
				)
			);

		case "MultiLineString":
			if (!Array.isArray(geoJSON.coordinates)) return false;
			return geoJSON.coordinates.every(
				(lineString) =>
					Array.isArray(lineString) &&
					lineString.length >= 2 &&
					lineString.every(
						(point) =>
							Array.isArray(point) &&
							point.length === 2 &&
							typeof point[0] === "number" &&
							typeof point[1] === "number"
					)
			);

		case "Polygon":
			console.log("polygon");
			if (!Array.isArray(geoJSON.coordinates)) return false;
			return geoJSON.coordinates.every(
				(linearRing) =>
					Array.isArray(linearRing) &&
					linearRing.length >= 4 &&
					JSON.stringify(linearRing[0]) ===
						JSON.stringify(linearRing[linearRing.length - 1]) &&
					linearRing.every(
						(point) =>
							Array.isArray(point) &&
							point.length === 2 &&
							typeof point[0] === "number" &&
							typeof point[1] === "number"
					)
			);

		case "MultiPolygon":
			console.log("multipolygon");
			if (!Array.isArray(geoJSON.coordinates)) return false;
			return geoJSON.coordinates.every(
				(polygon) =>
					Array.isArray(polygon) &&
					polygon.every(
						(linearRing) =>
							Array.isArray(linearRing) &&
							linearRing.length >= 4 &&
							linearRing[0].toString() === linearRing[linearRing.length - 1].toString() &&
							linearRing.every(
								(point) =>
									Array.isArray(point) &&
									point.length === 2 &&
									typeof point[0] === "number" &&
									typeof point[1] === "number"
							)
					)
			);
	}
};

export default _isValidGeoJSON;
