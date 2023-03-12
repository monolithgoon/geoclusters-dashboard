/**
 * This file defines an object containing various possible paths for retreiving various properties for a standerdized, renderable geocluster, depending on if the original geocluster is a parcelized-agc, processed-legacy-agc, or clustered-farm-program.
 * The standardized geocluster properties are defined as keys in the object, with each key having an array of possible property names/paths for that option from the original geocluster.
 *
 * Options for cluster properties.
 * @typedef {Object} ClusterPropPathOptions
 * @property {string[]} CLUSTER_ID - Possible property names for cluster ID.
 * @property {string[]} CLUSTER_TITLE - Possible property names for cluster title.
 * @property {string[]} CLUSTER_CREATED_DATE - Possible property names for cluster creation date.
 * @property {string[]} CLUSTER_AREA - Possible property names for cluster area.
 * @property {string[]} CLUSTER_USED_AREA - Possible property names for cluster used area.
 * @property {string[]} CLUSTER_UNUSED_AREA - Possible property names for cluster unused area.
 * @property {string[]} CLUSTER_CENTER_POINT_FEAT - Possible property names for cluster center point feature.
 * @property {string[]} CLUSTER_LOCATION_GENERAL - Possible property names for general cluster location.
 * @property {string[]} CLUSTER_LOCATION_ADMIN_LVL1 - Possible property names for cluster location at admin level 1.
 * @property {string[]} CLUSTER_LOCATION_ADMIN_LVL2 - Possible property names for cluster location at admin level 2.
 * @property {string[]} CLUSTER_LOCATION_ADMIN_LVL3 - Possible property names for cluster location at admin level 3.
 * @property {string[]} CLUSTER_LOCATION_ADMIN_LVL4 - Possible property names for cluster location at admin level 4.
 * @property {string[]} CLUSTER_PREVIEW_URL_HASH - Possible property names for cluster preview hash.
 * @property {string[]} AUTO_SUBDIVISION_METADATA - Possible property names for auto-subdivision metadata.
 * @property {string[]} CLUSTER_COMMODITIES - Possible property names for cluster commodities.
 * @property {string[]} CLUSTER_GOV_ADMIN1_NAME1 - Possible property names for the first name of the first administrative officer of the cluster.
 * @property {string[]} CLUSTER_GOV_ADMIN1_NAME2 - Possible property names for the middle name of the first administrative officer of the cluster.
 * @property {string[]} CLUSTER_GOV_ADMIN1_NAME3 - Possible property names for the last name of the first administrative officer of the cluster.
 * @property {string[]} CLUSTER_GOV_ADMIN2_NAME1 - Possible property names for the first name of the second administrative officer of the cluster.
 * @property {string[]} CLUSTER_GOV_ADMIN2_NAME2 - Possible property names for the middle name of the second administrative officer of the cluster.
 * @property {string[]} CLUSTER_GOV_ADMIN2_NAME3 - Possible property names for the last name of the second administrative officer of the cluster.
 */

exports.CLUSTER_PROP_PATHS = {
	CLUSTER_ID: ["agc_id", "geo_cluster_id", "legacy_agc_id", "farm_program_id"],
	CLUSTER_TITLE: [
		`agc_extended_name`,
		`geo_cluster_name`,
		`legacy_agc_name`,
		"farm_program_title",
	],
	CLUSTER_INSERTED_DATE: [`cluster_created_timestamp`, `db_insert_timestamp`],
	CLUSTER_INCEPTION_DATE: [`farm_program_start_date`],
	CLUSTER_AREA: [
		"agc_area",
		`geo_cluster_details.delineated_area`,
		`legacy_agc_details.delineated_area`,
	],
	CLUSTER_USED_AREA: [
		`total_allocation`,
		`geo_cluster_details.total_allocations_area`,
		`legacy_agc_details.total_allocations_area`,
	],
	CLUSTER_UNUSED_AREA: [`unused_land_area`],
	CLUSTER_CENTER_POINT_FEAT: [`agc_center_coords`],
	CLUSTER_LOCATION_GENERAL: [`agc_location`],
	CLUSTER_LOCATION_ADMIN_LVL1: [`geo_cluster_details.country`, "legacy_agc_details.country"],
	CLUSTER_LOCATION_ADMIN_LVL2: [`geo_cluster_details.state`, "legacy_agc_details.state"],
	CLUSTER_LOCATION_ADMIN_LVL3: [`geo_cluster_details.lga`, "legacy_agc_details.lga"],
	CLUSTER_LOCATION_ADMIN_LVL4: [`geo_cluster_details.ward`, "legacy_agc_details.ward"],
	CLUSTER_PREVIEW_URL_HASH: [`preview_map_url_hash`],
	AUTO_SUBDIVISION_METADATA: [`parcelization_metadata`],
	CLUSTER_COMMODITIES: [
		`geo_cluster_details.primary_crop`,
		"primary_crop",
		"legacy_agc_details.primary_crop",
	],
	CLUSTER_GOV_ADMIN1_NAME1: [`geo_cluster_governance_structure.president.first_name`],
	CLUSTER_GOV_ADMIN1_NAME2: [`geo_cluster_governance_structure.president.middle_name`],
	CLUSTER_GOV_ADMIN1_NAME3: [`geo_cluster_governance_structure.president.last_name`],
	CLUSTER_GOV_ADMIN2_NAME1: [`geo_cluster_governance_structure.vice_president.first_name`],
	CLUSTER_GOV_ADMIN2_NAME1: [`geo_cluster_governance_structure.vice_president.first_name`],
	CLUSTER_GOV_ADMIN2_NAME2: [`geo_cluster_governance_structure.vice_president.middle_name`],
	CLUSTER_GOV_ADMIN2_NAME3: [`geo_cluster_governance_structure.vice_president.last_name`],
};
