`use strict`
export const MAPBOX_TOKEN = `pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
export const BING_MAPS_TOKEN = `ArOrASno0BM9N0a3FfAOKXbzNfZA8BdB5Y7OFqbDIcbhkTiDHwmiNGfNFXoL9CTY`;


// INIT. AVG BASEMAP
export const AVG_BASE_MAP = L.map("avg_base_map_container", { zoomSnap: 0.01, preferCanvas: true })
   // .setView([15.0043, 7.4430], 7.5);
   // .setView([36.80504251142855, 10.185470319310479], 13.5);
   // .setView([36.8364914310283, 10.070729096590059], 15);
   // .setView([36.8370066107919, 10.059871561852127], 14.5);

   // .setView([4.654776030857737, 7.03691902649687], 14.5);
   .setView([9.4699247854766355, 7.217137278865754], 6.4);


// INIT. FEAT. DETAIL MINIMAP
export const FEAT_DETAIL_MAP = L.map("feature_detail_map_container", { zoomSnap: 0.01, preferCanvas: true })
   .setView([15.0043, 7.4430], 7.5);
   // .setView([36.80504251142855, 10.185470319310479], 13.5);
   // .setView([36.8364914310283, 10.070729096590059], 15);
   // .setView([36.8370066107919, 10.059871561852127], 14.5);


// REMOVE
// // LEAFLET + MAPBOX BASE MAP TILE
// const mapboxTile =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//       attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//       maxZoom: 18,
//       id: "mapbox/streets-v11",
//       tileSize: 512,
//       zoomOffset: -1,
//       accessToken: MAPBOX_TOKEN,
//    }
// );


// LEAFLET + BING MAPS BASEMAP TILE
const bingMapsTile = L.bingLayer(BING_MAPS_TOKEN, {
   imagerySet: 'AerialWithLabels',
   maxZoom: 28,
   detectRetina: true,
   retinaDpi: 'd2',
   mapLayer: "TrafficFlow",
   attribution: '&copy; FieldDev Group'
});


// LEAFLET + BING MAPS BASEMAP TILE 2
const bingMapsTile2 = L.bingLayer(BING_MAPS_TOKEN, {
   imagerySet: 'AerialWithLabels',
   maxZoom: 28,
   detectRetina: true,
   retinaDpi: 'd2',
   mapLayer: "TrafficFlow",
   attribution: '&copy; FieldDev Group'
});


// mapboxTile.addTo(AVG_BASE_MAP);
bingMapsTile.addTo(AVG_BASE_MAP);
bingMapsTile2.addTo(FEAT_DETAIL_MAP);
// .setZIndex(-99);
   

// INIT. AVG PARCELIZATION / CLUSTER DETAILS MAP
mapboxgl.accessToken = MAPBOX_TOKEN;
export const CLUSTER_PLOTS_MAP = new mapboxgl.Map({
   attribution: 'FieldDev Group',
   container: 'parcelization_map_container',
   style: 'mapbox://styles/mapbox/outdoors-v11',
   center: [7.03691902649687, 4.654776030857737],
   pitch: 50,
   bearing: 10, // bearing in degrees
   zoom: 8,
   // style: 'mapbox://styles/mapbox-map-design/ckhqrf2tz0dt119ny6azh975y',
   // pitch: 85,
   // bearing: 50,
});