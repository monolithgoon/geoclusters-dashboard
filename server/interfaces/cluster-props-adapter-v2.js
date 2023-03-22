`use strict`;
const _startcase = require("lodash.startcase");
const CAPITALIZE_THESE_WORDS = require("../constants/words-to-capitalize.js");
const { _capitalizeWords, _joinWordsArray } = require("../utils/helpers.js");
const { CLUSTER_PROP_PATHS } = require("../constants/cluster-prop-path-selectors.js");
const chalk = require("../utils/chalk-messages.js");
const { returnFirstValidPropValue, mandatoryParam } = require("./helpers.js");

/**
 * @function formatClusterLocation
 * @description Formats a location string with comma-separated values, capitalizing the first letter of each word.
 * @param {string} locationStr - The input location string.
 * @returns {string} The formatted location string.
 */
function formatClusterLocation(locationStr) {

  // Remove leading and trailing spaces and split the string into an array, and remove empty strings
  const arr = locationStr.trim().split(', ').filter(str=>str.length>0);

  // Capitalize the first letter of each word and join them with a comma
  return arr.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(", ");
}

/**
 * @function _getFlattenedClusterProps
 * @description Returns an object containing various properties of a geocluster feature collection.
 * @param {object} clusterFeatureCollection - The cluster feature collection to extract properties from.
 * @returns {object} An object containing various properties of the cluster feature collection.
 */
exports._getFlattenedClusterProps = (clusterFeatureCollection = mandatoryParam()) => {

  try {
		
    // Extract properties from clusterFeatureCollection object
    const props = clusterFeatureCollection.properties;

    // Extract cluster ID and cluster name from properties
    const clusterID = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_ID);
    let clusterName = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_TITLE);
				clusterName = clusterName
					? _capitalizeWords(_startcase(clusterName.toLowerCase()), ...CAPITALIZE_THESE_WORDS)
					: clusterName;

    // Extract other properties from properties object
    const clusterInsertedTimestamp = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_INSERTED_DATE);
    const clusterInceptionDate = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_INCEPTION_DATE);
    const clusterFeatsNum = clusterFeatureCollection.features.length;
    const clusterArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_AREA) || 0;
    const clusterUsedArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_USED_AREA) || 0;
    const clusterUnusedArea = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_UNUSED_AREA) || 0;
    const clusterCenterFeat = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_CENTER_POINT_FEAT);
    const clusterAdminLvl1 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL1);
    const clusterAdminLvl2 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL2);
    const clusterAdminLvl3 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL3);
    const clusterAdminLvl4 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_ADMIN_LVL4);
		// Merge Ward, LGA, State, Country into one string representing the cluster locaiton
    const clusterLocationSpecific = _joinWordsArray(
			[clusterAdminLvl4, clusterAdminLvl3, clusterAdminLvl2, clusterAdminLvl1],
      { commaSeparated: true }
			);
		const clusterLocationGeneral = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_LOCATION_GENERAL) || `Nigeria`
		const clusterLocation = formatClusterLocation(`${clusterLocationSpecific}, ${clusterLocationGeneral}`);
    const clusterPreviewUrlHash = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_PREVIEW_URL_HASH);
    const subdivideMetadata = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.AUTO_SUBDIVISION_METADATA);
    let clusterCommodities = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_COMMODITIES);
				clusterCommodities = _startcase(clusterCommodities);
    const clusterGovAdmin1 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_GOV_ADMIN1_NAME1);
    const clusterGovAdmin2 = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_GOV_ADMIN1_NAME2);
    const clusterPolygonFeature = returnFirstValidPropValue(props, CLUSTER_PROP_PATHS.CLUSTER_POLYGON_FEATURE)

    // Return object with extracted properties
    return {
      clusterID,
      clusterName,
      clusterInsertedTimestamp,
      clusterInceptionDate,
      clusterFeatsNum,
      clusterArea,
      clusterUsedArea,
      clusterUnusedArea,
      clusterCenterFeat,
      clusterAdminLvl1,
      clusterAdminLvl2,
      clusterAdminLvl3,
      clusterAdminLvl4,
      clusterLocation,
      clusterPreviewUrlHash,
      subdivideMetadata,
      clusterCommodities,
      clusterGovAdmin1,
      clusterGovAdmin2,
      clusterPolygonFeature,
    };
  } catch (error) {
    // Handle errors
    console.error(chalk.fail(`_getFlattenedClusterProps: ${error.message}`));
  }
};
