`use strict`
import { AVG_BASE_MAP, CLUSTER_PLOTS_MAP } from "../config/maps-config.js";
import { _mapboxPanToGeoJSON, _mapboxDrawFeatFeatColl, _mapboxDrawFeature, _leafletRenderGeojson, _mapboxDrawLabels, _openMapboxFeatPopup } from "../geojson-render.js";


// CALBACK FN. FOR TO SWITCH MAP STYLES
export function _switchMapboxMapLayer(evtObj) {
   var layerId = evtObj.target.id;
   CLUSTER_PLOTS_MAP.setStyle(`mapbox://styles/mapbox/${layerId}`);
};


// RENDER GEOJSON ON DISPLAYED MAPS
export const _RenderMaps = (function(avgBaseMap, clusterFeatsMap) {

   try {

      const getPresentationPoly = (geoJSONPoly, {useBuffer, bufferAmt, bufferUnits='kilometers'}) => {
         const presentationPolygon = useBuffer ? _getBufferedPolygon(geoJSONPoly, bufferAmt, {bufferUnits}) : geoJSONPoly;
         return presentationPolygon;
      };

      // pan map to entire cluster
      const panToClusterGeoJSON = (geoJSON) => {
         const gjCenterCoords = turf.coordAll(turf.centerOfMass(geoJSON))[0];
         const gjBounds = turf.bbox(geoJSON);
         _mapboxPanToGeoJSON(clusterFeatsMap, gjCenterCoords, gjBounds, {zoom:16, pitch:0, bearing:0, boundsPadding:0});
      };
      
      // pan to a single cluster feat.
      const panToClusterFeat = (geoJSONFeat, {zoomLevel}) => {

         try {
            
            console.log(geoJSONFeat);
                        
            const gjCenterCoords = turf.coordAll(turf.centerOfMass(geoJSONFeat))[0];
            const gjBounds = turf.bbox(geoJSONFeat);
            // FIXME > ZOOM VALUE OVER-RIDDEN BY BOUNDS
            _mapboxPanToGeoJSON(clusterFeatsMap, gjCenterCoords, gjBounds, {zoom: zoomLevel, pitch:0, bearing:0, boundsPadding:0});
            
         } catch (panClusterMapErr) {
            console.error(`panClusterMapErr: ${panClusterMapErr.message}`);
         };
      };

      const drawFeatureColl = (geojson) => {
         _mapboxDrawFeatFeatColl({mapboxMap: clusterFeatsMap, featOrFeatColl: geojson});
      };

      const drawFeatures = (geojson, {useBuffer, bufferAmt, bufferUnits}) => {
         geojson.features.forEach((clusterPlot, idx) => {
            clusterPlot = getPresentationPoly(clusterPlot, {useBuffer, bufferAmt, bufferUnits});
            _mapboxDrawFeature(clusterFeatsMap, clusterPlot, idx);
         });
      };

      const drawFeatureLabels = (geojson, {useBuffer, bufferUnits, bufferAmt, areaUnits}) => {
         geojson.features.forEach((clusterPlot, idx) => {
            clusterPlot = getPresentationPoly(clusterPlot, {useBuffer, bufferAmt, bufferUnits});
            _mapboxDrawLabels(clusterFeatsMap, clusterPlot, idx, {areaUnits});
         });
      };
      
      const panBaseMap__ = (geojson, {baseMapZoomLvl}) => {
         _leafletRenderGeojson(avgBaseMap, geojson, {baseMapZoomLvl});
      };

      const createMapboxPopup = (props, centerLngLat) => {
         _openMapboxFeatPopup(clusterFeatsMap, props, centerLngLat);
      };
   
      return {
         // TODO > CHANGE "geojson" TO "featureCollection"
         renderFeatPopup: (props, centerLngLat) => {
            createMapboxPopup(props, centerLngLat);
         },         
         panClusterPlotsMap: (geojson) => {
            panToClusterGeoJSON(geojson);
         },
         panClusterPlotsFeatMap: (geoJSONFeat, {zoomLevel}) => {
            panToClusterFeat(geoJSONFeat, {zoomLevel});
         },
         renderCluster: (geojson) => {
            drawFeatureColl(geojson);
         },
         renderClusterPlots: (geoJSON, {useBuffer, bufferUnits}) => {
            drawFeatures(geoJSON, {useBuffer, bufferAmt, bufferUnits});
         },
         renderClusterPlotLabel: (geoJSON, {useBuffer=false, bufferUnits, bufferAmt, areaUnits}) => {
            drawFeatureLabels(geoJSON, {useBuffer, bufferUnits, bufferAmt, areaUnits});
         },
         renderBaseMap: (geojson) => {
            panBaseMap__(geojson);
         },
         renderEverythingNow: (geoJSON, {baseMapZoomLvl=0, useBuffer=false, bufferUnits, bufferAmt, areaUnits}) => {
            
            // fire custom fn.
            clusterFeatsMap.fire('closeAllPopups');
            
            panToClusterGeoJSON(geoJSON);
            drawFeatureColl(geoJSON);
            drawFeatures(geoJSON, {useBuffer, bufferAmt, bufferUnits});
            drawFeatureLabels(geoJSON, {useBuffer, bufferUnits, bufferAmt, areaUnits});
            panBaseMap__(geoJSON, {baseMapZoomLvl});
         },
      };

   } catch (renderMapsErr) {
      console.error(`renderMapsErr: ${renderMapsErr.message}`)
   };   
})(AVG_BASE_MAP, CLUSTER_PLOTS_MAP);


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