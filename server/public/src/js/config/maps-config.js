`use strict`
import MAPS_TOKENS from "../constants/maps-tokens.js";
import ATTRIBUTION from "../constants/attribution.js";

// REMOVE > DEPRC.
// export const MAPBOX_TOKEN = `pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
// export const BING_MAPS_TOKEN = `ArOrASno0BM9N0a3FfAOKXbzNfZA8BdB5Y7OFqbDIcbhkTiDHwmiNGfNFXoL9CTY`;


// INIT. AVG BASEMAP
export const AVG_BASE_MAP = L.map("avg_base_map_container", { zoomSnap: 0.01, preferCanvas: true })
   // .setView([36.8370066107919, 10.059871561852127], 14.5);
   // .setView([8.463332470991755, 8.492565010708738], 6.99);


// Init. feat. detail map that opens in a modal when a feature in the cluster details map (below) is clicked
export const FEAT_DETAIL_MAP = L.map("feature_detail_map_container", { zoomSnap: 0.01, preferCanvas: true })
   // .setView([15.0043, 7.4430], 7.5);


// INIT. CLUSTER DETAILS MAP
export const CLUSTER_PLOTS_MAP = new mapboxgl.Map({
   attribution: ATTRIBUTION.APP_DEVELOPER_NAME,
   container: 'parcelization_map_container',
   style: 'mapbox://styles/mapbox/outdoors-v11',
   accessToken: MAPS_TOKENS.DASHBOARD.MAPBOX,
   // style: {
   //    'version': 8,
   //    'sources': {
   //          'raster-tiles': {
   //             'type': 'raster',
   //             'tiles': [
   //                'https://stamen-tiles.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg'
   //             ],
   //             'tileSize': 256,
   //             'attribution':
   //                'Map tiles by <a target="_top" rel="noopener" href="http://stamen.com">Stamen Design</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>'
   //          }
   //    },
   //    'layers': [
   //          {
   //             'id': 'simple-tiles',
   //             'type': 'raster',
   //             'source': 'raster-tiles',
   //             'minzoom': 0,
   //             'maxzoom': 22
   //          }
   //    ]
   // },
   center: [7.03691902649687, 4.654776030857737],
   pitch: 50,
   bearing: 10, // bearing in degrees
   zoom: 8,
});


const MAP_TILE_SOURCES = Object.freeze({

   google: Object.freeze({
      streets: 'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      hybrid: 'http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
      satellite: 'http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', 
      terrain: 'http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
   }),

   osm: {
      standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      bw: "http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png",
      // humanitarian: "http://b.tile.openstreetmap.fr/hot/${z}/${x}/${y}.png" // CORS ERROR
   },

   bing: {
      road:"RoadOnDemand",
      arial: "AerialWithLabels",
      birdsEye: "BirdseyeWithLabels"
   },

   ersi : {
      ErsiStandard : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      ErsiTransportation : "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
      // ErsiTerrain : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
      // ErsiTopoWorld : "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
   },

   stamenToner: "http://a.tile.stamen.com/toner/${z}/${x}/${y}.png", // CORS ERROR
   stamenWatercolor: "http://c.tile.stamen.com/watercolor/${z}/${x}/${y}.jpg", // CORS ERROR

   cartoLight: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
   cartoDark: "https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png",
   mapbox: "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
});

   
export const _getTileLayers = () => {

   const googleStreets = L.tileLayer(MAP_TILE_SOURCES.google.streets, {
      maxZoom: 28,
      subdomains:['mt0','mt1','mt2','mt3'],
   });

   const googleHybrid = L.tileLayer(MAP_TILE_SOURCES.google.hybrid, {
      maxZoom: 28,
      subdomains:['mt0','mt1','mt2','mt3'],
   });

   const mapboxOutdoors =  L.tileLayer(MAP_TILE_SOURCES.mapbox, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/outdoors-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPS_TOKENS.MAPBOX,
   });

   const osmStd = L.tileLayer(MAP_TILE_SOURCES.osm.standard, {
      maxZoom: 18,
      optimize: true,
      attribution: 'Nduka Okpue &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   });

   const osmBW = L.tileLayer(MAP_TILE_SOURCES.osm.bw, {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      opacity: parseFloat($("#mapopacity-select").val()),
   });

   const bingMapsArial = L.bingLayer(MAPS_TOKENS.BING, {
      imagerySet: MAP_TILE_SOURCES.bing.arial,
      maxZoom: 28,
      detectRetina: true,
      retinaDpi: 'd2',
      mapLayer: "TrafficFlow",
      attribution: '&copy; FieldDev Group'
   });

   return {
      googleStreets,
      googleHybrid,
      mapboxOutdoors,
      osmStd,
      osmBW,
      bingMapsArial,
   };
};