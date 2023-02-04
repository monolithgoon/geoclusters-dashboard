const LEAFLET_MAP_TILES_SOURCES = Object.freeze({
	GOOGLE: Object.freeze({
		STREETS: "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
		HYBRID: "http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
		SATELLITE: "http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
		TERRAIN: "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}",
	}),

	OSM: {
		STANDARD: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
		BW: "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
		HUMANITARIAN: "http://b.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png", // CORS ERROR
	},

	BING: {
		ROAD: "RoadOnDemand",
		ARIAL: "AerialWithLabels",
		BIRDS_EYE: "BirdseyeWithLabels",
	},

	ERSI: {
		STANDARD:
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
		TRANSPORTATION:
			"https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
		TERRAIN:
			"https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
		TOPO_WORLD:
			"http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
	},

	STAMEN: {
		TONER: "http://a.tile.stamen.com/toner/${z}/${x}/${y}.png", // CORS ERROR
		COLOR: "http://c.tile.stamen.com/watercolor/${z}/${x}/${y}.jpg", // CORS ERROR
	},

	CARTO: {
		LIGHT: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
		DARK: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
	},
  
  MAPBOX: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
});

export default LEAFLET_MAP_TILES_SOURCES;
