const API_URLS = {
	GEOCLUSTERS: {
		HOST: {
			LOCAL: `http://127.0.0.1:9443`,
			HEROKU: `https://geoclusters.herokuapp.com`,
			AWS: `http://18.213.158.252:8443`,
		},
		RESOURCE_PATHS: [
			`api/v1/parcelized-agcs/`,
			// `api/v2/legacy-agcs/`,
			`api/v2/legacy-agcs/processed/`,
			`api/v3/clustered-farm-programs/`
		],
	},
};

module.exports = API_URLS;
