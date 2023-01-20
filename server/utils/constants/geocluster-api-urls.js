const GEOCLUSTER_API_URLS = {
	HEROKU: [
		`https://geoclusters.herokuapp.com/api/v1/parcelized-agcs/`,
		`https://geoclusters.herokuapp.com/api/v2/legacy-agcs/`,
		`https://geoclusters.herokuapp.com/api/v2/legacy-agcs/processed/`,
	],
	AWS: [
		`http://18.213.158.252:8443/api/v1/parcelized-agcs/`,
		`http://18.213.158.252:8443/api/v2/legacy-agcs/`,
		`http://18.213.158.252:8443/api/v2/legacy-agcs/processed/`,
	],
};
module.exports = GEOCLUSTER_API_URLS;
