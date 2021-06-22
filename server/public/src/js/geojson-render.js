`use strict`
import { AVG_BASE_MAP, CLUSTER_PLOTS_MAP, FEAT_DETAIL_MAP } from "./avg-controllers/maps-controller.js";
import { _clusterFeatPopupMarkup, _GenerateClusterFeatMarkup, _leafletMarkerMarkup } from "./avg-controllers/markup-generator.js";
import { pollAVGSettingsValues, _getDOMElements, _PollAVGSettings } from "./avg-controllers/ui-controller.js";
import { _getClusterFeatProps } from "./cluster-props-adapter.js";
import { LAYER_COLORS } from "./mapbox-layer-colors.js";
import { _TurfHelpers, _getBufferedPolygon, _CheckGeoJSON, _ManipulateDOM, _GeometryMath } from "./_utils.js";


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
      const clickedLayers = [];

      return {
         saveLayers: function(mapboxLayer) {
            if (mapboxLayer) { renderedLayers.push(mapboxLayer) };
         },
         returnSavedLayers: function() {
            return renderedLayers;
         },
         saveClickedLayers: function(mapboxLayer) {
            if (mapboxLayer) { clickedLayers.push(mapboxLayer) };
         },
         returnClickedLayers: function() {
            return clickedLayers;
         },
         returnPrevClickedLayer: () => {
            // return clickedLayers[clickedLayers.length - 1];
            if (clickedLayers.length >= 2) {
               return clickedLayers[clickedLayers.length - 2];
            }
         }
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


const LLayerGroupController = ((leafletBasemap, leafletMinimap)=>{
   // Create a group to hold the leaflet layers and add it to the map
   const basemapLayerGroup = L.layerGroup().addTo(leafletBasemap)
   const minimapLayerGroup = L.layerGroup().addTo(leafletMinimap);
   return {
      getMinimapLayerGroup: () => {
         return minimapLayerGroup;
      },
      getLayerGroups: () => {
         return {
            basemapLayerGroup,
            minimapLayerGroup,
         }
      }
   }
})(AVG_BASE_MAP, FEAT_DETAIL_MAP);


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


export function _openMapboxFeatPopup(map, props, centerLngLat) {

   clearPopups();

   // const popup = new mapboxgl.Popup({ className: "mapbox-metadata-popup" })
   const popup = new mapboxgl.Popup( {closeOnClick: true} )
      .setLngLat(centerLngLat)
      .setHTML(_clusterFeatPopupMarkup(props))
      .addTo(map);

   // CREATE A CUSTOM EVENT LISTENER >> TRIGGERED BY: map.fire('closeAllPopups')
   map.on('closeAllPopups', () => {
      popup.remove();
   });
};


function getLeafletPolyOutline(geometry, {lineColor="white", lineWeight=4, lineOpacity=1}={}) {
   const polygonOutline = L.geoJSON(geometry, {
      "color": lineColor, 
      "weight": lineWeight,
      "opacity": lineOpacity,
   });
   return polygonOutline;
};


function getLeafletPolyFill(coords, {fillColor="green", fillOpacity=0.5}={}) {
   // FIXME > THE COORD. SYSTEM HERE IS OFF..
   const polygonFill = L.polygon([...coords], {
      style: {
         fillColor: fillColor,
         fillOpacity: fillOpacity,
         color: "white",
         weight: 3,
         dashArray: '3',
         opacity: 3,
      }
   });
   return polygonFill;
};


function createHTMLMarker(props, latLngPosition, styleClass, {draggable=true}) {
   const HTMLMarker = L.marker(latLngPosition, {
      draggable: draggable,
      icon: L.divIcon({
         className: `${styleClass}`,
         html: _leafletMarkerMarkup(props),
      }),
      zIndexOffset: 100
   })
   return HTMLMarker;
};


// TODO
function renderFeatVertices(props) {

}


const FillLayerHandler = ((dom, leafletBasemap, mapboxMap, leafletMinimap)=>{

   const minimapLayerGroup = LLayerGroupController.getMinimapLayerGroup();
   const basemapLayerGroup = LLayerGroupController.getLayerGroups().basemapLayerGroup;

   function affectDOMElement(elementId, activeClass) {
      const relatedElement = document.getElementById(elementId)
      _ManipulateDOM.addRemoveClass(relatedElement, activeClass);
   };

   // EXTRACT GEOJSON DATA FROM A MAPBOX LAYER EVENT
   function getLayerData(layer) {
      const layerGeoJSON = layer.features[0]
      const layerProps = _getClusterFeatProps(layerGeoJSON);
      const lngLatCenter = layer.lngLat;
      const layerGeometry = layer.features[0].geometry;
      const layerCoords = layerGeometry.coordinates[0];

      const turfCenter = turf.centerOfMass(layerGeometry).geometry.coordinates; // LNG. LAT. FORMAT
      const latLngCenter = [turfCenter[1], turfCenter[0]] // CONVERT TO LAT. LNG FORMAT

      return {
         layerGeoJSON, 
         layerProps,
         lngLatCenter,
         layerGeometry,
         layerCoords,
         latLngCenter,
      };
   };

   // BUILD A GLOBAL DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
   const FEAT_BOUNDARY_DATA = {
      feature_index: 0,
      start_coords: 0,
      vertex_pairs: [],
      vertex_bearings: [],
      vertex_deltas: [],
   };   

   try {
      
      const layerClick = (map, fillLayer) => {

         map.on(`click`, `${fillLayer.id}`, (e) => {

            const layerData = getLayerData(e);

            // SANDBOX
            $('#exampleModal').modal('show');
            
            affectDOMElement(fillLayer.id, `selected`);
            
            _openMapboxFeatPopup(map, layerData.layerProps, layerData.lngLatCenter);

            // get a new mapbox layer
            const clickedLayerId = `clickedLayer_${fillLayer.id}`;
            const clickedLayer = getMapboxLayers(layerData.layerGeoJSON, {layerId: clickedLayerId, color: "black", thickness: 4, fillOpacity: .2}).fillLayer;

            // TODO > clear prev. popups
            
            // clear prev. clicked layers
            sanitizeMapboxLayers({map, renderedLayers: LayersController.returnClickedLayers()});
            
            // add clicked layer to map
            addMapboxLayer(map, clickedLayer);
            
            // KEEP TRACK OF THE CLICKED LAYER
            LayersController.saveLayers(clickedLayer);
            LayersController.saveClickedLayers(clickedLayer);

            // OPEN / CLOSE FEAT. DETAIL MAP
            (function openFeatureDetailMap(clickedLayerId) {
               
               dom.featsListingWrapper.classList.add('hide');
               dom.featureDetailMap.classList.remove('hide')
               
               const prevClickedLayer = LayersController.returnPrevClickedLayer();
               
               if (prevClickedLayer) {

                  console.log(prevClickedLayer.id)
                  console.log(LayersController.returnClickedLayers())
   
                  if (clickedLayerId === prevClickedLayer.id) {
                     dom.featsListingWrapper.classList.toggle('hide');
                     dom.featureDetailMap.classList.toggle('hide')
                     sanitizeMapboxLayers({map, renderedLayers: LayersController.returnClickedLayers()});
                  };
               };     
            })(clickedLayer.id);
            
            // RENDER THE CLUSTER FEATURE     
            (function renderFeatureDetailMap(featureData, leafletLayerGroup, leafletMap) {

               // if (!_PollAVGSettings.renderMultiFeatsChk) {
               if (!pollAVGSettingsValues().renderMultiFeatsChk) {
                  leafletLayerGroup.clearLayers();
               };

               const featIdx = featureData.featureIndex;
               const featProps = featureData.layerProps;
               const featCoords = featureData.layerCoords;
               const featCenter = featureData.latLngCenter;
               const featGeometry = featureData.layerGeometry;
               const featBounds = L.geoJson(featGeometry).getBounds();

               leafletMap.fitBounds(featBounds, {padding: [150, 50]}); // PADDING: [L-R, T-D]

               // ADD A MARKER TO PLOT CENTER
               L.marker(featureData.latLngCenter).addTo(leafletLayerGroup);

               // RENDER A LEAFLET POLYGON
               getLeafletPolyOutline(featGeometry).addTo(leafletLayerGroup);

               // FILL THE POLYGON
               getLeafletPolyFill(featCoords).addTo(leafletLayerGroup);

               // DISPLAY PLOT METADATA AT CENTER OF FEATURE
               createHTMLMarker(featProps, featCenter, 'plot-metadata-label', {draggable:true}).addTo(leafletLayerGroup);
      
               // TODO
               // renderFeatVertices()
               
               // SHOW THE DISTANCE & BEARING BTW. FARM PLOT CORNERS
               for (let idx = 0; idx < featCoords.length; idx++) {
      
                  // REFERENCE THE INDEX OF THIS PLOT
                  FEAT_BOUNDARY_DATA.feature_index = featIdx;
      
                  const plotCorner = featCoords[idx];
      
                  const fromPlotCorner = featCoords[idx];
                  const toPlotCorner = featCoords[idx + 1] === undefined ? featCoords[0] : featCoords[idx + 1]; // RETURN BACK TO STARTING CORNER
      
                  // SAVE THE CURRENT PLOT CORNERS > REMOVE THE REDUNDANT PAIR @ START POINT..
                  FEAT_BOUNDARY_DATA.vertex_pairs.push([fromPlotCorner, toPlotCorner]);
      
                  const midpoint = _TurfHelpers.midpoint(fromPlotCorner, toPlotCorner)
                  const midpointCoords = midpoint.geometry.coordinates; // TO PLACE THE DIST. LABELS
                  const distance = _TurfHelpers.distance(fromPlotCorner, toPlotCorner, {distUnits: 'kilometers'}) * 1000;
                  const turfBearing = _TurfHelpers.distance(fromPlotCorner, toPlotCorner, {distUnits: 'degrees'});
                  const mathBearing = _GeometryMath.computeBearing(fromPlotCorner, toPlotCorner);
                  const degMinSec = _GeometryMath.getDegMinSec(mathBearing); // CONVERT bearing to 0° 0' 4.31129" FORMAT    

                  // YOU ARE AT STARTING POINT WHEN BEARING === 0
                  // DON'T SHOW A MIDPOINT DIST. MARKER HERE
                  // ONLY SHOW LABELS IF DIST. BTW. VERTICES > 5.0 meters
                  if (turfBearing !== 0 && distance > 5) {
      
                     // SHOW THE PLOT VERTICES AS LEAFLET ICONS
                     // IMPORTANT 
                     // NOTE: COORDS. IN LEAFLET ARE "latLng" 
                     // NOTE: COORDS. IN MAPBOX ARE "lngLat"
                     L.marker([plotCorner[1], plotCorner[0]], {
                        icon: L.divIcon({
                           className: `plot-polygon-vertex-coords-label`,
                           html: `<span>${idx}</span> ${plotCorner[0].toFixed(6)}°N, ${plotCorner[1].toFixed(6)}°E`,
                           iconSize: [70, 15]
                        }),
                        zIndexOffset: 98
                        
                     }).addTo(leafletLayerGroup);   
      
                     // SHOW DIST. BTW. CORNERS ONLY (FOR SMALL SCREENS)
                     L.marker([midpointCoords[1], midpointCoords[0]], {
                        draggable: true,
                        icon: L.divIcon({
                           className: 'plot-polygon-vertex-dist-label',
                           html: `${distance.toFixed(0)} m`,
                           iconSize: [30, 15]
                        }),
                        zIndexOffset: 99
         
                     }).addTo(leafletLayerGroup);
                     
                     // SHOW DIST. & BEARING (FOR DESKTOP)
                     L.marker([midpointCoords[1], midpointCoords[0]], {
                        draggable: true,
                        icon: L.divIcon({
                           className: 'plot-polygon-vertex-dist-bearing-label',
                           html: `${distance.toFixed(0)} m, ${degMinSec}`,
                           iconSize: [30, 15]
                        }),
                        zIndexOffset: 99
         
                     }).addTo(leafletLayerGroup);
                     
                     // SAVE THE BEARING BTW. THE VERTICES
                     FEAT_BOUNDARY_DATA.vertex_bearings.push(mathBearing);
                     FEAT_BOUNDARY_DATA.vertex_deltas.push(distance);
      
                  } else if (turfBearing === 0) {
                     // THE BEARING == 0 => THAT CORNER IS THE PLOT "STARTING" POINT
      
                     // SAVE THE BEARING & COORDS. @ 0
                     FEAT_BOUNDARY_DATA.start_coords = plotCorner;
                     
                     // ADD AN ANIMATED MARKER
                     // leafletLayerGroup.addLayer(getAnimatedPersonMarker([plotCorner[1], plotCorner[0]]));
                  };
               };
      
               // DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
               // console.log({...FEAT_BOUNDARY_DATA});
               
            })(layerData, minimapLayerGroup, leafletMinimap);
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
   };

})(_getDOMElements(), AVG_BASE_MAP, CLUSTER_PLOTS_MAP, FEAT_DETAIL_MAP);


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
export function _mapboxDrawFeature(mapboxMap, polygon, featureIdx) {

   try {
               
      // GET THE CHUNK POLYGON LAYERS
      let polygonOutlineLayer = getMapboxLayers(polygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).outlineLayer;
      let polygonFillLayer = getMapboxLayers(polygon, {featureIndex: featureIdx, color: null, thickness: 2, fillOpacity: 0.1}).fillLayer;
      
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
export function _mapboxDrawLabels(mapboxMap, polygon, featureIdx, {areaUnits=`hectares`}) {

   try {
      
      const plotIndex = featureIdx + 1;   
      const plotArea = _TurfHelpers.calcPolyArea(polygon, {units: areaUnits});
      const labelText = `${plotArea.toFixed(0)} ${areaUnits}`;
      const labelPosition = turf.centerOfMass(polygon);
      
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


export const _leafletRenderGeojson = function (leafletBasemap, geojson, {zoomLevel=8}) {
   const gjCenterFeature = turf.centerOfMass(geojson);
   // RE-POSITION THE LEAFLET MAP
   leafletPanToPoint(leafletBasemap, gjCenterFeature, {zoomLevel});
};