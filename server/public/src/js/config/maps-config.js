`use strict`
import MAPS_TOKENS from "../constants/maps-tokens.js";
import MAPS_TILES_SOURCES from "../constants/maps-tile-sources.js"
import ATTRIBUTION from "../constants/attribution.js";


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
   // REMOVE > DEPRECATED
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

   
export const _getTileLayers = () => {

   const googleStreets = L.tileLayer(MAPS_TILES_SOURCES.GOOGLE.STREETS, {
      maxZoom: 28,
      subdomains:['mt0','mt1','mt2','mt3'],
   });

   const googleHybrid = L.tileLayer(MAPS_TILES_SOURCES.GOOGLE.HYBRID, {
      maxZoom: 28,
      subdomains:['mt0','mt1','mt2','mt3'],
   });

   const mapboxOutdoors =  L.tileLayer(MAPS_TILES_SOURCES.MAPBOX, {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/outdoors-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPS_TOKENS.MAPBOX,
   });

   const osmStd = L.tileLayer(MAPS_TILES_SOURCES.OSM.STANDARD, {
      maxZoom: 18,
      optimize: true,
      attribution: 'Nduka Okpue &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   });

   const osmBW = L.tileLayer(MAPS_TILES_SOURCES.OSM.BW, {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      opacity: parseFloat($("#mapopacity-select").val()),
   });

   const bingMapsArial = L.bingLayer(MAPS_TOKENS.BING, {
      imagerySet: MAPS_TILES_SOURCES.BING.ARIAL,
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