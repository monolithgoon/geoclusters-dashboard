const API_URLS = Object.freeze({
	GEOCLUSTERS: {
		HOST: {
			LOCAL: `http://127.0.0.1:9443`,
			HEROKU: `https://geoclusters.herokuapp.com`,
			AWS: `http://18.213.158.252:8443`,
		},
		RESOURCE_PATHS: {
			PARCELIZED_CLUSTERS: [`api/v1/parcelized-agcs/`, `api/v1/parcelized-agcs/metadata`],
			PARCELIZED_CLUSTERS_ONLY: `api/v1/parcelized-agcs`,
			PARCELIZED_CLUSTERS_METADATA: `api/v1/parcelized-agcs/metadata`,
			PARCELIZED_CLUSTER: `api/v1/parcelized-agcs/parcelized-agc`,
		},
	},
	ADMIN_BOUNDS: {
		HOST: {
			// the admin bounds API is served from this app's own backend
			SELF: window.location.origin,
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
});

export default API_URLS;