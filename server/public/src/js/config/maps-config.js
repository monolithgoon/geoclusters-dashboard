`use strict`
import MAPS_API_TOKENS from "../constants/maps-api-tokens.js";
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
   accessToken: MAPS_API_TOKENS.DASHBOARD.MAPBOX,
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