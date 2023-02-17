/**
  An array listing the file names of the cached geoclusters
  These name correspond EXACTLY with the names of their respective collections in the database
  These files were created by `server/workers/cache-api-data.js`
  The JSON files listed here will be read from disk,
   combined into a single object and rendered on the frontend via the view-controller
*/

const CACHED_FILE_NAMES = [
	"parcelized-agcs.json",
	// "legacy-agcs.json",
	"processed-legacy-agcs.json",
];

const LOCAL_FILE_NAMES = {
	FILES: {
		GEOCLUSTERS: [
			"parcelized-agcs.json",
			// "legacy-agcs.json",
			"processed-legacy-agcs.json",
		],
		GEO_POL_REGIONS: `nga-geo-pol-regions.geojson`,
	},
	DIRECTORIES: {
		ADMIN_BOUNDS: {
			STATES: `/localdata/nga-state-admin-bounds`,
			LGAS: `/localdata/nga-lga-admin-bounds`,
			WARDS: `/localdata/nga-ward-admin-bounds-openAFRICA`,
		},
    MARKETS: `/localdata/nga-markets`,
	},
};

module.exports = CACHED_FILE_NAMES;
