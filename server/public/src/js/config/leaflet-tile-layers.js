import LEAFLET_MAP_TILES_SOURCES from "../constants/leaflet-map-tile-sources.js";
import MAPS_API_TOKENS from "../constants/maps-api-tokens.js";
import ATTRIBUTION from "../constants/attribution.js";

const googleStreets = L.tileLayer(LEAFLET_MAP_TILES_SOURCES.GOOGLE.STREETS, {
	maxZoom: 28,
	subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

const googleHybrid = L.tileLayer(LEAFLET_MAP_TILES_SOURCES.GOOGLE.HYBRID, {
	maxZoom: 28,
	subdomains: ["mt0", "mt1", "mt2", "mt3"],
});

const mapboxOutdoors = L.tileLayer(LEAFLET_MAP_TILES_SOURCES.MAPBOX, {
	attribution:
		'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: "mapbox/outdoors-v11",
	tileSize: 512,
	zoomOffset: -1,
	accessToken: MAPS_API_TOKENS.DASHBOARD.MAPBOX,
});

const osmStd = L.tileLayer(LEAFLET_MAP_TILES_SOURCES.OSM.STANDARD, {
	maxZoom: 18,
	optimize: true,
	attribution: `${ATTRIBUTION.APP_DEVELOPER_NAME} &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`,
});

const osmBW = L.tileLayer(LEAFLET_MAP_TILES_SOURCES.OSM.BW, {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	opacity: parseFloat($("#mapopacity-select").val()),
});

const bingMapsArial = L.bingLayer(MAPS_API_TOKENS.DASHBOARD.BING, {
	imagerySet: LEAFLET_MAP_TILES_SOURCES.BING.ARIAL,
	maxZoom: 28,
	detectRetina: true,
	retinaDpi: "d2",
	mapLayer: "TrafficFlow",
	attribution: `&copy; ${ATTRIBUTION.APP_DEVELOPER_NAME}`,
});

const LEAFLET_TILE_LAYERS = {
	googleStreets,
	googleHybrid,
	mapboxOutdoors,
	osmStd,
	osmBW,
	bingMapsArial,
};

export default LEAFLET_TILE_LAYERS;
