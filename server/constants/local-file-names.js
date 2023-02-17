`use strict`;

const LOCAL_FILE_NAMES = {
	BASE_DIRECTORY: `localdata`,
	FILES: {
		/**
			An array listing the file names of the cached geoclusters
			These name correspond EXACTLY with the names of their respective collections in the database
			These files were created by `server/workers/cache-api-data.js`
			The JSON files listed here will be read from disk,
			combined into a single object and rendered on the frontend via the view-controller
			*/
		GEOCLUSTERS: [
			"parcelized-agcs.json",
			// "legacy-agcs.json",
			"processed-legacy-agcs.json",
		],
		NGA: {
			GEO_POL_REGIONS: `nga-geo-pol-regions.geojson`,
		},
		WORLD: {
			COUNTRIES: `world-countries.geojson`,
		},
	},
	DIRECTORIES: {
		NGA: {
			ADMIN_BOUNDS: {
				STATES: `/localdata/nga-state-admin-bounds`,
				LGAS: `/localdata/nga-lga-admin-bounds`,
				WARDS: `/localdata/nga-ward-admin-bounds-openAFRICA`,
			},
			MARKETS: `/localdata/nga-markets`,
			WATERWAYS: `/localdata/nga-waterways`,
		},
	},
};

module.exports = LOCAL_FILE_NAMES;
