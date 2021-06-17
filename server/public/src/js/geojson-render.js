`use strict`
import { _clusterFeatPopupMarkup, _GenerateClusterFeatMarkup } from "./avg-controllers/markup-generator.js";
import { _GetClusterFeatProps } from "./cluster-props-adapter.js";
import { LAYER_COLORS } from "./mapbox-layer-colors.js";
import { _TurfHelpers, _getBufferedPolygon, _CheckGeoJSON, _ManipulateDOM } from "./_utils.js";


const getLayerColor = (index) => {
   return LAYER_COLORS[index] ? LAYER_COLORS[index] : 'white';
};


// CREATE LINE & FILL LAYERS FROM GEOJSON POLY.
// function getMapboxClickLayer(geoJSON, {color, thickness, fillOpacity})
function getMapboxLayers(geoJSON, {featureIndex, layerId, color, thickness, fillOpacity} = {}) {
    
   let layerColor = getLayerColor(featureIndex);

   // this layerId has a correspondig featCard with an identical id
   layerId = layerId ? layerId : _CheckGeoJSON.getId(geoJSON);
   
   const fillLayer = {
      // id: `gjFillLayer_${featureIndex}`,
      id: layerId,
      type: "fill",
      source: {
         type: "geojson",
         data: geoJSON,
      },
      paint: {
         "fill-color": `${color || layerColor}`,
         "fill-opacity": fillOpacity || 0.2,
      },
   }
   
   const outlineLayer = {
   
      id: `gjOutlineLayer_${layerId}`,
      type: "line",
      source: {
         type: "geojson",
         data: geoJSON,
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
const LayersController = (function() {

   try {
      
      const renderedLayers = [];
      const tempLayers = [];

      return {
         saveLayers: function(mapboxLayer) {
            if (mapboxLayer) { renderedLayers.push(mapboxLayer) };
         },
         returnSavedLayers: function() {
            return renderedLayers;
         },
         saveTempLayers: function(mapboxLayer) {
            if (mapboxLayer) { tempLayers.push(mapboxLayer) };
         },
         returnTempLayers: function() {
            return tempLayers;
         },
      };

   } catch (layersControllerErr) {
      console.error(`layersControllerErr: ${layersControllerErr.message}`)
   };

})();


// KEEP TRACK OF RENDERED MAPBOX MARKERS
const MarkersController = (function() {
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


// IIFE TO KEEP TRACK OF OPEN MAPBOX POPUPS
const PopupsController = (function() {
   const openPopups = [];
   return {
      savePopup: function(popup) {
         if (popup) openPopups.push(popup);
      },
      returnOpenPopups: function() {
         return openPopups;
      },
   };
})();


function clearPopups() {
   var popUps = document.getElementsByClassName("mapboxgl-popup");
   if (popUps[0]) popUps[0].remove();
   const openPopups = PopupsController.returnOpenPopups();
   openPopups.forEach(openPopup => {
      if (openPopup) openPopup.remove;
   });
};


export function _openMapboxPopup(map, lnglat, HTMLMarkup) {
   
   clearPopups();
   
   var popup = new mapboxgl.Popup({ closeOnClick: false })
      .setLngLat(lnglat)
      .setHTML(
         "<h3>Sweetgreen</h3>" +
            "<h4>" +
            // currentFeature.properties.address +
            "</h4>"
      )
      .addTo(map);
   
   PopupsController.savePopup(popup);
};


// PAN MAP TO GEOJSON'S CENTER
export function _mapboxPanToGeoJSON(map, centerCoords, bounds, {zoom=16, pitch=0, bearing=0, boundsPadding=0}) {
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


// TODO > 
const getPresentationPolygon = (polygon, {useBuffer=false}) => {
   return useBuffer ? _getBufferedPolygon(polygon) : polygon;
};

function toggleLayerPopup(map, layerProps, layerCenter) {

   // const popup = new mapboxgl.Popup({ className: "mapbox-metadata-popup" })
   const popup = new mapboxgl.Popup( {closeOnClick: true} )
      .setLngLat(layerCenter)
      .setHTML(_clusterFeatPopupMarkup(layerProps))
      .addTo(map);

   // CREATE A CUSTOM EVENT LISTENER >> TRIGGERED BY: map.fire('closeAllPopups')
   map.on('closeAllPopups', () => {
      popup.remove();
   });
};


const FillLayerHandler = (()=>{

   function affectDOMElement(elementId, activeClass) {
      const relatedElement = document.getElementById(elementId)
      _ManipulateDOM.addRemoveClass(relatedElement, activeClass);
   };

   try {
      
      const layerClick = (map, fillLayer) => {

         map.on(`click`, `${fillLayer.id}`, (e) => {
            
            console.log(document.getElementById(fillLayer.id));
            
            // GEOJSON PROPS.
            const layerGeoJSON = e.features[0]
            const layerProps = _GetClusterFeatProps(layerGeoJSON);
            const layerCenter = e.lngLat;

            affectDOMElement(fillLayer.id, `selected`);
            
            toggleLayerPopup(map, layerProps, layerCenter);

            // get a new mapbox layer
            const clickedLayerId = `clickedLayer_${fillLayer.id}`;
            const clickedLayer = getMapboxLayers(layerGeoJSON, {layerId: clickedLayerId, color: "black", thickness: 4, fillOpacity: .2}).fillLayer;

            // clear prev. clicked layers
            sanitizeMapboxLayers({map, renderedLayers: LayersController.returnTempLayers()});
            
            // add clicked layer to map
            addMapboxLayer(map, clickedLayer);
            
            // KEEP TRACK OF THE CLICKED LAYER
            LayersController.saveLayers(clickedLayer);
            LayersController.saveTempLayers(clickedLayer);

            // openFeatureDetailMap();
            document.getElementById('cluster_features_listing').classList.toggle('hide')
            document.getElementById('cluster_feature_detail_map').classList.toggle('hide')
            
            // renderFeatureDetailMap();
         });      
      };

      const layerMouseIn = (map, fillLayer) => {

         map.on('mouseenter', `${fillLayer.id}`, function(e) {
            
            // Change the cursor to a pointer when the mouse is over the grid fill layer.
            map.getCanvas().style.cursor = 'pointer';

            affectDOMElement(fillLayer.id, `selected`)
            _ManipulateDOM.scrollDOMElement(fillLayer.id);         
            
         });
      };

      const layerMouseOut = (map, fillLayer) => {

         map.on('mouseleave', `${fillLayer.id}`, function() {
            
            map.getCanvas().style.cursor = '';

            affectDOMElement(fillLayer.id, `selected`);

         });
      };

      return {
         interaction: (map, fillLayer) => {
            layerClick(map, fillLayer);
            layerMouseIn(map, fillLayer);
            layerMouseOut(map, fillLayer);
         },
      };

   } catch (fillLayerHandlerErr) {
      console.error(`fillLayerHandlerErr: ${fillLayerHandlerErr.message}`)
   }
})();


// SIMPLE MAPBOX GJ. RENDER FN.
export const _mapboxDrawFeatFeatColl = function ({mapboxMap, featOrFeatColl}) {

   try {

      // RENDER ONLY FEATS. OR FEAT. COLLS.
      if (mapboxMap && _CheckGeoJSON.isValidFeatOrColl(featOrFeatColl)) {
   
         // CALC. SOME METADATA
         const gjUniqueID = featOrFeatColl._id;
         const gjCenterCoords = turf.coordAll(turf.centerOfMass(featOrFeatColl))[0];
         
   
         // INIT. MAPBOX LAYERS
         const gjOutlineLayer = getMapboxLayers(featOrFeatColl, {featureIndex: gjUniqueID, color: "#009432", thickness: 1, fillOpacity: null}).outlineLayer
         const gjFillLayer = getMapboxLayers(featOrFeatColl, {featureIndex: gjUniqueID, color: 'white', thickness: null, fillOpacity: 0.25}).fillLayer
         
   
         // INIT. MAPBOX MARKER
         const mapboxMarker = new mapboxgl.Marker().setLngLat(gjCenterCoords);
   
         
         // CLEAR PREVIOUSLY RENDERED LAYERS
         sanitizeMapboxLayers({map: mapboxMap, renderedLayers: LayersController.returnSavedLayers()});
         removeMapboxMarkers(MarkersController.returnSavedMarkers());
      
            
         // // PAN MAP TO GEOJSON'S CENTER
      
         
         // ADD LAYERS TO MAPBOX MAP
         addMapboxLayer(mapboxMap, gjOutlineLayer);
         addMapboxLayer(mapboxMap, gjFillLayer);
         mapboxMarker.addTo(mapboxMap);
         
         
         // SAVE THE LAYERS & MARKERS
         LayersController.saveLayers(gjOutlineLayer);
         LayersController.saveLayers(gjFillLayer);
         MarkersController.saveMarker(mapboxMarker);

         // console.log(LayersController.returnSavedLayers());

      } else {
         throw new Error(`This function requires a GeoJSON Feature or FeatureCollection`)
      }
      
   } catch (mapboxGJRenderErr) {
      console.error(`mapboxGJRenderErr: ${mapboxGJRenderErr.message}`)
   }
};


// PLOT/CHUNK RENDER FUNCTION
export function _mapboxDrawFeature(mapboxMap, polygon, featureIdx, useBuffer, {bufferAmt=0, bufferUnits=`kilometers`}) {

   try {
      
      // const presentationPolygon = _getBufferedPolygon(polygon, bufferAmt, {bufferUnits});
      // const presentationPolygon = getPresentationPolygon(polygon, {useBuffer});
      // const presentationPolygon = useBuffer ? _getBufferedPolygon(polygon, bufferAmt, {bufferUnits}) : polygon;
      const presentationPolygon = polygon;
         
      // GET THE CHUNK POLYGON LAYERS
      let polygonOutlineLayer = getMapboxLayers(presentationPolygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).outlineLayer;
      let polygonFillLayer = getMapboxLayers(presentationPolygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).fillLayer;
      
      // ADD THE LAYERS TO THE MAPBOX MAP
      addMapboxLayer(mapboxMap, polygonOutlineLayer);
      addMapboxLayer(mapboxMap, polygonFillLayer);
      
      // ADD INTERACTION TO THE FILL LAYER
      FillLayerHandler.interaction(mapboxMap, polygonFillLayer);
      
      // SAVE THE LAYERS
      LayersController.saveLayers(polygonOutlineLayer);
      LayersController.saveLayers(polygonFillLayer);
      
   } catch (mapboxDrawFeatErr) {
      console.error(`mapboxDrawFeatErr: ${mapboxDrawFeatErr.message}`)
   };
};


// RENDER LABELS @ CENTER OF POLYGONS
export function _mapboxDrawLabels(mapboxMap, polygon, useBuffer, {featureIdx, bufferAmt=0, bufferUnits="kilometers", areaUnits=`hectares`}) {

   try {

      // const presentationPolygon = _getBufferedPolygon(polygon, bufferAmt, {bufferUnits});
      // const presentationPolygon = getPresentationPolygon(polygon, {useBuffer});
      // const presentationPolygon = useBuffer ? _getBufferedPolygon(polygon) : polygon;
      const presentationPolygon = polygon;
      
      const plotIndex = featureIdx + 1;   
      const plotArea = _TurfHelpers.calcPolyArea(polygon, {units: areaUnits});
      const labelText = `${plotArea.toFixed(0)} ${areaUnits}`;
      const labelPosition = turf.centerOfMass(presentationPolygon);
      
      const labelLayer = getMapboxLabelLayer({labelIdx: plotIndex, labelText, labelPosition});
   
      addMapboxLayer(mapboxMap, labelLayer);
   
      LayersController.saveLayers(labelLayer);

   } catch (mapboxDrawLabelsErr) {
      console.error(`mapboxDrawLabelsErr: ${mapboxDrawLabelsErr.message}`)
   };
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