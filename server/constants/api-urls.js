const API_URLS = {
	GEOCLUSTERS: {
		HOST: {
			LOCAL: `http://127.0.0.1:9443`,
			HEROKU: `https://geoclusters.herokuapp.com`,
			AWS: `http://18.213.158.252:8443`,
		},
		RESOURCE_PATHS: [
			`api/v1/parcelized-agcs/`,
			`api/v2/legacy-agcs/`,
			`api/v2/legacy-agcs/processed/`,
		],
	},
	ADMIN_BOUNDS: {
		HOST: {
			LOCAL: `http://127.0.0.1:9090`,
			HEROKU: `https://geoclusters.herokuapp.com`,
			AWS: `http://54.225.80.233:9090`,
		},
		RESOURCE_PATHS: [
			`api/v1/admin-bounds/nga-geo-pol-regions`,
			`api/v1/admin-bounds/nga-admin-bounds-lvl1`,
			`api/v1/admin-bounds/nga-admin-bounds-lvl2`,
			`api/v1/admin-bounds/nga-admin-bounds-lvl3`,
		],
	},
};

module.exports = API_URLS;
