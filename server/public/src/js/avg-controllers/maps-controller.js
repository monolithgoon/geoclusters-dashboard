`use strict`
import { AVG_BASE_MAP } from "../config/maps-config.js";


// CALBACK FN. FOR TO SWITCH MAP STYLES
export function _switchMapboxMapLayer(evtObj) {
   var layerId = evtObj.target.id;
   CLUSTER_PLOTS_MAP.setStyle(`mapbox://styles/mapbox/${layerId}`);
};


// SANDBOX > 
// AFFECT A LEAFLET MARKER FROM A SIDEBAR DIV
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