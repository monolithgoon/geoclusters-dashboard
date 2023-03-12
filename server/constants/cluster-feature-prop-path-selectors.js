exports.CLUSTER_FEATS_PROP_PATHS = {
	FEATURE_ID: ["chunk_id", "plot_id"],
	FEATURE_CLUSTER_ID: ["farm_program_farmer_id"],
	FEATURE_ADMIN_ID: ["farmer_bio_data.farmer_id", "owner_id", "farm_program_farmer_id"],
	FEATURE_ADDITIONAL_PROPS_API_URL: ["farmer_global_url"],
	FEATURE_ADMIN_PERSON_NAME1: [
		"farmer_bio_data.farmer_first_name",
		"farmer_first_name",
	],
	FEATURE_ADMIN_PERSON_NAME2: [
		"farmer_bio_data.farmer_middle_name",
		"farmer_middle_name",
	],
	FEATURE_ADMIN_PERSON_NAME3: [
		"farmer_bio_data.farmer_last_name",
		"farmer_last_name",
	],
	FEATURE_ADMIN_PERSON_NAMES: ["owner_name", "farmer_bio_data.farmer_names"],
	FEATURE_ADMIN_PERSON_DOB: ["farmer_bio_data.farmer_dob", "farmer_dob"],
	FEATURE_ADMIN_PERSON_GENDER: ["farmer_bio_data.farmer_gender", "farmer_gender"],
	FEATURE_ADMIN_PERSON_IMAGE_URL: [
		"owner_photo_url",
		"farmer_bio_data.farmer_photo_url",
		"famrer_cloud_image_url",
	],
	FEATURE_ADMIN_PERSON_PHONE_NO: ["farmer_bio_data.farmer_phone_number_1", "farmer_phone_number"],
	FEATURE_ADMIN_PERSON_EMAIL_ADDRESS: ["farmer_email_address"],
	FEATURE_ADMIN_PERSON_GOV_ID_TYPE: ["farmer_bio_data.farmer_id_document_type"],
	FEATURE_ADMIN_PERSON_GOV_ID_NO: ["farmer_bio_data.farmer_id_document_no"],
	FEATURE_GENERAL_DESCRIPTION: ["farmer_farm_details.general_description"],
	FEATURE_AREA: ["chunk_size", "plot_owner_allocation_size", "plot_size", "farmer_farm_details.land_size"],
	FEATURE_AREA_UNITS: ["farmer_farm_details.land_size_units"],
	FEATURE_EXTERNAL_MONITOR_URL: ["farmer_farm_details.field_officer_url"],
};
