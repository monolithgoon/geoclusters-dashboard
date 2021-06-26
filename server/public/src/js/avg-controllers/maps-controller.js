`use strict`
import { MAPBOX_TOKEN, BING_MAPS_TOKEN } from "../maps-config.js";


// INIT. FEAT. DETAIL MINIMAP
// INIT. AVG BASEMAP
export const AVG_BASE_MAP = L.map("avg_base_map_container", { zoomSnap: 0.01 })
   // .setView([15.0043, 7.4430], 7.5);
   // .setView([36.80504251142855, 10.185470319310479], 13.5);
   // .setView([36.8364914310283, 10.070729096590059], 15);
   // .setView([36.8370066107919, 10.059871561852127], 14.5);
   .setView([4.654776030857737, 7.03691902649687], 14.5);


// INIT. FEAT. DETAIL MINIMAP
export const FEAT_DETAIL_MAP = L.map("feature_detail_map_container", { zoomSnap: 0.01 })
   .setView([15.0043, 7.4430], 7.5);
   // .setView([36.80504251142855, 10.185470319310479], 13.5);
   // .setView([36.8364914310283, 10.070729096590059], 15);
   // .setView([36.8370066107919, 10.059871561852127], 14.5);


// INIT. FEAT. DETAIL MINIMAP
export const MODAL_FEAT_DETAIL_MAP = L.map("feature_detail_map_wrapper", { zoomSnap: 0.01 })
   .setView([15.0043, 7.4430], 7.5);
   // .setView([36.80504251142855, 10.185470319310479], 13.5);
   // .setView([36.8364914310283, 10.070729096590059], 15);
   // .setView([36.8370066107919, 10.059871561852127], 14.5);


// LEAFLET + MAPBOX BASE MAP TILE
const mapboxTile =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_TOKEN,
   }
);


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
mapboxTile.addTo(FEAT_DETAIL_MAP);
bingMapsTile2.addTo(MODAL_FEAT_DETAIL_MAP);
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
   

// ADD ZOOM & NAV. CONTROLS
// CLUSTER_PLOTS_MAP.addControl(new mapboxgl.NavigationControl());


// CLUSTER_PLOTS_MAP.on(`load`, function() {

//    CLUSTER_PLOTS_MAP.addSource(`mapbox-dem`, {
//       'type': 'raster-dem',
//       'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
//       'tileSize': 512,
//       'maxzoom': 14,
//    });

//    // FIXME > NOT WORKING
//    // ADD THE DEM SOURCE AS A TERRAIN LAYER WITH EXAGGERATED HEIGHT
//    CLUSTER_PLOTS_MAP.setTerrain({"source": "mapbox-dem", "exaggeration": 1.5});

//    // ADD A SKY LAYER THAT WILL SHOW WHEN THE MAP IS HIGHLY PITCHED
//    CLUSTER_PLOTS_MAP.addLayer({
//       'id': 'sky', 
//       'type': 'sky',
//       'paint': {
//          'sky-type': 'atmosphere',
//          'sky-atmosphere-sun': [ 0.0, 0.0],
//          'sky-atmosphere-sun-intensity': 15,
//       } 
//    });
// });


// CALBACK FN. FOR TO SWITCH MAP STYLES
export function _switchMapboxMapLayer(evtObj) {
   var layerId = evtObj.target.id;
   CLUSTER_PLOTS_MAP.setStyle(`mapbox://styles/mapbox/${layerId}`);
};


// SANDBOX > 
// AFFECT A LEAFLET MARKER FROM A DIV
const clusterFeatsListCont = document.getElementById('cluster_feats_list_body')
var link = L.DomUtil.create('a', 'link', clusterFeatsListCont);
        
link.textContent = 'Cluster Plot Owner';
link.href = '#';

var marker = new L.Marker([36.8370066107919, 10.059871561852127]).bindPopup('Popup').addTo(AVG_BASE_MAP);

link.marker = marker;
marker.link = link;

L.DomEvent.addListener(link, 'mouseover', function (e) {
    e.target.marker.openPopup(); 
});

L.DomEvent.addListener(link, 'mouseout', function (e) {
    e.target.marker.closePopup(); 
});

marker.on('mouseover', function (e) {
    e.target.link.style.backgroundColor = 'pink';
});

marker.on('mouseout', function (e) {
    e.target.link.style.backgroundColor = 'white';
});