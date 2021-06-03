`use strict`
import { LAYER_COLORS } from "./mapbox-layer-colors.js";
import { _calcPolyArea, _getBufferedPolygon, _isValidFeatOrColl } from "./_utils.js";


const getLayerColor = (index) => {
   return LAYER_COLORS[index] ? LAYER_COLORS[index] : 'white';
}


// CREATE LINE & FILL LAYERS FROM GEOJSON POLY.
function getMapboxLayers(geojson, {featureIndex, color, thickness, fillOpacity} = {}) {
    
   let layerColor = getLayerColor(featureIndex);
   
   const fillLayer = {
      id: `gjFillLayer_${featureIndex}`,
      type: "fill",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
         "fill-color": `${color || layerColor}`,
         "fill-opacity": fillOpacity || 0.2,
      },
   }
   
   const outlineLayer = {
   
      id: `gjOutlineLayer_${featureIndex}`,
      type: "line",
      source: {
         type: "geojson",
         data: geojson,
      },
      paint: {
			"line-color": `${color || layerColor}`,
			"line-opacity": 1,
			"line-width": thickness || 1,
      },
   };
   
   return {
      fillLayer,
      outlineLayer,
   };
};


// CREATE MAPBOX LAYER FOR LABELS
function getMapboxLabelLayer({labelIdx, labelText, labelPosition}) {

   const polygonLabel = {
      'id': `polygonLabel_${labelIdx}`,
      "type": "symbol",
      'source': {
         'type': 'geojson',    
         data: labelPosition
      },
      "layout": {
         // "symbol-placement": "line",
         "text-font": ["Open Sans Regular"],
         // "text-field": `Plot #${labelIdx} (${labelText})`,
         "text-field": `Plot_${labelIdx} (${labelText})`,
         "text-size": 10
      },
      "paint": {
         "text-color": "black"
      }
   }
   return polygonLabel;
};


// ADD A LAYER TO A MAPBOX MAP
function addMapboxLayer (map, layer) {
   
   if (map.getSource(layer.id)) {
      map.removeLayer(layer.id);
      map.removeSource(layer.id)
      map.addLayer(layer)

   } else {
      
      // INITIAL STATE > THERE WERE NO LAYERS ON MAP
      map.addLayer(layer)
   }

   // console.log(map.getStyle().sources);
};


// CLEAR PREV. RENDERED LAYERS
function sanitizeMapboxLayers ({map, renderedLayers=null, layerIDs=null}) {

   if (renderedLayers && renderedLayers.length > 0) {
      renderedLayers.forEach(layer => {
         if(map.getSource(layer.id)) {
            map.removeLayer(layer.id);
            map.removeSource(layer.id)
         }
      });
   }

   if (layerIDs) {
      layerIDs.forEach(layerID => {
         if(map.getSource(layerID)) {
            map.removeLayer(layerID)
            map.removeSource(layerID)
         }
      });
   }
};


// CLEAR PREV. RENDERED MARKERS
function removeMapboxMarkers (markersArray) {
   if (markersArray.length > 0) {
      for (const marker of markersArray) {
         marker.remove();
      };
   };
};


// IIFE TO KEEP TRACK OF RENDERED MAPBOX LAYERS
const layersController = (function() {
   const renderedLayers = [];
   return {
      saveLayers: function(outlineLayer) {
         if (outlineLayer) { renderedLayers.push(outlineLayer) };
      },
      returnSavedLayers: function() {
         return renderedLayers;
      }
   }
})();


// KEEP TRACK OF RENDERED MAPBOX MARKERS
const markersController = (function() {
   const renderedMarkers = [];
   return {
      saveMarker: function(marker) {
         if (marker) { renderedMarkers.push(marker) };
      },
      returnSavedMarkers: function() {
         return renderedMarkers;
      }
   }
})();


function mapboxPanToGeoJSON(map, centerCoords, bounds, {zoom=16, pitch=0, bearing=0, boundsPadding=0}) {
   // PAN TO LOCATION
   map.flyTo({
		center: centerCoords,
		zoom: zoom,
      pitch: pitch,
      bearing: bearing,
		// zoom: zoomSetting,
	});
	// CONTAIN THE ZOOM TO THE SHAPEFILE'S BOUNDS
	map.fitBounds(bounds, {padding: boundsPadding});
};


// RENDER LABELS @ CENTER OF POLYGONS
export function _mapboxDrawLabels(mapboxMap, polygon, {featureIdx, bufferAmt=0, bufferUnits="kilometers", areaUnits=`hectares`}) {

   const plotIndex = featureIdx + 1;   
   const plotArea = _calcPolyArea(polygon, {units: areaUnits});
   const labelText = `${plotArea.toFixed(0)} ${areaUnits}`;
   // const labelPosition = turf.centerOfMass(polygon);
   const labelPosition = turf.centerOfMass(_getBufferedPolygon(polygon, bufferAmt, {bufferUnits: bufferUnits}));
   
   const labelLayer = getMapboxLabelLayer({labelIdx: plotIndex, labelText, labelPosition});

   addMapboxLayer(mapboxMap, labelLayer);

   layersController.saveLayers(labelLayer);
};


// PLOT/CHUNK RENDER FUNCTION
export function _mapboxDrawFeature(mapboxMap, polygon, {featureIdx, bufferAmt=0, bufferUnits=`kilometers`}) {

   const presentationPolygon = _getBufferedPolygon(polygon, bufferAmt, {bufferUnits});
      
   // GET THE CHUNK POLYGON LAYERS
   let polygonOutlineLayer = getMapboxLayers(presentationPolygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).outlineLayer;
   let polygonFillLayer = getMapboxLayers(presentationPolygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).fillLayer;
   
   // ADD THE LAYERS TO THE MAPBOX MAP
   addMapboxLayer(mapboxMap, polygonOutlineLayer);
   addMapboxLayer(mapboxMap, polygonFillLayer);
   
   // SAVE THE LAYERS
   layersController.saveLayers(polygonOutlineLayer);
   layersController.saveLayers(polygonFillLayer);
   
   // ADD CLICKABILITY TO THE FILL LAYER
   // TODO
   // POLYGON_FILL_BEHAVIOR(map, leaflet_map, polygonFillLayer)
}


// SIMPLE MAPBOX GJ. RENDER FN.
export const _mapboxRenderGeojson = function ({mapboxMap, featOrFeatColl}) {

   try {

      // RENDER ONLY FEATS. OR FEAT. COLLS.
      if (mapboxMap && _isValidFeatOrColl(featOrFeatColl)) {
   
         // CALC. SOME METADATA
         const gjUniqueID = featOrFeatColl._id;
         const gjCenterCoords = turf.coordAll(turf.centerOfMass(featOrFeatColl))[0];
         const gjBounds = turf.bbox(featOrFeatColl);
         
   
         // INIT. MAPBOX LAYERS
         const gjOutlineLayer = getMapboxLayers(featOrFeatColl, {featureIndex: gjUniqueID, color: "#009432", thickness: 1, fillOpacity: null}).outlineLayer
         const gjFillLayer = getMapboxLayers(featOrFeatColl, {featureIndex: gjUniqueID, color: 'white', thickness: null, fillOpacity: 0.25}).fillLayer
         
   
         // INIT. MAPBOX MARKER
         const mapboxMarker = new mapboxgl.Marker().setLngLat(gjCenterCoords);
   
         
         // CLEAR PREVIOUSLY RENDERED LAYERS
         sanitizeMapboxLayers({map: mapboxMap, renderedLayers: layersController.returnSavedLayers()});
         sanitizeMapboxLayers({map: mapboxMap, renderedLayers: layersController.returnSavedLayers()});
         removeMapboxMarkers(markersController.returnSavedMarkers());
      
            
         // PAN MAP TO GEOJSON'S CENTER
         mapboxPanToGeoJSON(mapboxMap, gjCenterCoords, gjBounds, {zoom: 16, pitch: 0, bearing: 0, boundsPadding: 20});
      
         
         // ADD LAYERS TO MAPBOX MAP
         addMapboxLayer(mapboxMap, gjOutlineLayer);
         addMapboxLayer(mapboxMap, gjFillLayer);
         mapboxMarker.addTo(mapboxMap);
         
         
         // SAVE THE LAYERS & MARKERS
         layersController.saveLayers(gjOutlineLayer);
         layersController.saveLayers(gjFillLayer);
         markersController.saveMarker(mapboxMarker);

         // console.log(layersController.returnSavedLayers());
      };   
      
   } catch (mapboxGJRenderErr) {
      console.error(`mapboxGJRenderErr: ${mapboxGJRenderErr.message}`)
   }
};


function leafletPanToPoint(map, pointFeature, {zoomLevel=8}) {
   const leafletGJLayer = L.geoJson();
   leafletGJLayer.addData(pointFeature);
   map.flyTo(leafletGJLayer.getBounds().getCenter(), zoomLevel);
};


export const _leafletRenderGeojson = function (leafletMap, geojson, {zoomLevel=8}) {
   const gjCenterFeature = turf.centerOfMass(geojson);
   // RE-POSITION THE LEAFLET MAP
   leafletPanToPoint(leafletMap, gjCenterFeature, {zoomLevel});
};