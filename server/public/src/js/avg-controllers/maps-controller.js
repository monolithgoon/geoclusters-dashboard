`use strict`
import { MAPBOX_TOKEN, BING_MAPS_TOKEN } from "../maps-config.js";

// INIT. AVG BASEMAP
export const AVG_BASE_MAP = L.map("avg_base_map", { zoomSnap: 0.01 })
// .setView([15.0043, 7.4430], 7.5);
// .setView([36.80504251142855, 10.185470319310479], 13.5);
// .setView([36.8364914310283, 10.070729096590059], 15);
.setView([36.8370066107919, 10.059871561852127], 14.5);

// BASEMAP MAPBOX TILE
const mapboxTile =  L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "mapbox/streets-v11",
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_TOKEN,
   }
);

// BASEMAP BING MAPS TILE
const bingMapsTile = L.bingLayer(BING_MAPS_TOKEN, {
   imagerySet: 'AerialWithLabels',
   maxZoom: 28,
   detectRetina: true,
   retinaDpi: 'd2',
   mapLayer: "TrafficFlow",
   attribution: '&copy; Nduka Okpue'
});

bingMapsTile.addTo(AVG_BASE_MAP);
// mapboxTile.addTo(AVG_BASE_MAP);
// .setZIndex(-99);
   
// INIT. AVG PARCELIZATION / CLUSTER DETAILS MAP
mapboxgl.accessToken = MAPBOX_TOKEN;
export const CLUSTER_PLOTS_MAP = new mapboxgl.Map({
   container: 'parcelization_map',
   style: 'mapbox://styles/mapbox/streets-v11',
   style: 'mapbox://styles/mapbox/cjcunv5ae262f2sm9tfwg8i0w', // Lè Shine
   style: 'mapbox://styles/mapbox/cjku6bhmo15oz2rs8p2n9s2hm', // minimo
   style: 'mapbox://styles/mapbox/satellite-streets-v11',
   style: 'mapbox://styles/mapbox/cjerxnqt3cgvp2rmyuxbeqme7', // cali terrain
   style: 'mapbox://styles/mapbox/cj3kbeqzo00022smj7akz3o1e', // moonlight
   style: 'mapbox://styles/mapbox/navigation-preview-day-v4',
   style: 'mapbox://styles/mapbox/outdoors-v11',
   center: [7.03691902649687, 4.654776030857737],
   pitch: 50,
   bearing: 10, // bearing in degrees
   zoom: 8,
   attribution: 'Nduka Okpue'
});

CLUSTER_PLOTS_MAP.on(`load`, function() {
   CLUSTER_PLOTS_MAP.addSource(`mapbox-dem`, {
      "type": "raster-dem", 
      "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
   });
   // FIXME > NOT WORKING
   // CLUSTER_PLOTS_MAP.setTerrain({"source": "mapbox-dem"});
});


// CALBACK FN. FOR TO SWITCH MAP STYLES
export function _switchMapboxMapLayer(evtObj) {
   var layerId = evtObj.target.id;
   CLUSTER_PLOTS_MAP.setStyle(`mapbox://styles/mapbox/${layerId}`);
};



// SANDBOX
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