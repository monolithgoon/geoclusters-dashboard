/**
  An array listing the file names of the cached geoclusters
  These name correspond EXACTLY with the names of their respective collections in the database
  These files were created by `server/workers/cache-geoclusters-api-data`
  The JSON files listed here will be read from disk,
   combined into a single object and rendered on the frontend via the view-controller
*/

const CACHED_FILE_NAMES = [
	"parcelized-agcs.json",
	// "legacy-agcs.json",
	"processed-legacy-agcs.json",
];

module.exports = CACHED_FILE_NAMES;
