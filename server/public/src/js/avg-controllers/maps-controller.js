`use strict`;
import { AVG_BASE_MAP, CLUSTER_PLOTS_MAP, FEAT_DETAIL_MAP } from "../config/maps-config.js";
import LEAFLET_TILE_LAYERS from "../config/leaflet-tile-layers.js";
import {
	_getClusterFeatPopupMarkup,
	_GenerateClusterFeatMarkup,
	_getClusterMetadaMarkerMarkup,
} from "../utils/markup-generators.js";
import { _ManipulateDOM, _pollAVGSettingsValues } from "./ui-controller.js";
import { _MONITOR_EXECUTION } from "../utils/fn-monitor.js";
import { _ShowActivityAlert } from "../utils/activity-alert.js";
import { LAYER_COLORS } from "../utils/mapbox-layer-colors.js";
import {
	_TurfHelpers,
	_getBufferedPolygon,
	_ProcessGeoJSON,
	_GeometryMath,
	_getUsableGeometry,
	_mandatoryParam,
	_joinWordsArray,
	_delayExecution,
} from "../utils/helpers.js";

const LLayerGroupController = ((leafletBaseMap, leafletModalMap) => {
	// Create groups to hold the leaflet layers and add it to the map
	const baseMapLayerGroup = L.layerGroup().addTo(leafletBaseMap);
	const modalMapLayerGroup = L.layerGroup().addTo(leafletModalMap);

	const LAYER_GROUP_OBJS = [];

	return {
		initLayerGroup: (layerGroupId, { visibilityRank = 3 }) => {
			const layerGroupObj = {
				layer_group_id: layerGroupId,
				visibility_rank: visibilityRank,
				layer_group: L.layerGroup(),
			};
			LAYER_GROUP_OBJS.push(layerGroupObj);
			return layerGroupObj.layer_group;
		},

		returnLayerGroupObjs: ({ layerGroupId = undefined, visibilityRank = undefined }) => {
			console.log({ LAYER_GROUP_OBJS });

			let lgObjects = [];

			if (layerGroupId && !visibilityRank) {
				lgObjects = LAYER_GROUP_OBJS.filter((lgObj) => lgObj.layer_group_id === layerGroupId);
			} else if (!layerGroupId && visibilityRank) {
				// lgObjects = LAYER_GROUP_OBJS.filter(lgObj => lgObj.visibility_rank === visibilityRank);
				lgObjects = LAYER_GROUP_OBJS.filter((lgObj) => lgObj.visibility_rank <= visibilityRank);
			} else if (layerGroupId && visibilityRank) {
				lgObjects = LAYER_GROUP_OBJS.filter((lgObj) => {
					if (lgObj.layer_group_id === layerGroupId && lgObj.visibility_rank === visibilityRank) return lgObj;
				});
			} else {
				return LAYER_GROUP_OBJS;
			}
			return lgObjects;
		},

		getLayerGroups: () => {
			return {
				baseMapLayerGroup,
				modalMapLayerGroup,
			};
		},
	};
})(AVG_BASE_MAP, FEAT_DETAIL_MAP);

const LeafletMapsSetup = ((baseMap, featDetailMap) => {
	const { googleStreets, googleHybrid, osmStd, osmBW, mapboxOutdoors, bingMapsArial } = LEAFLET_TILE_LAYERS;

	// baseMap.on('load', function() {
	baseMap.addLayer(googleHybrid);
	// });

	// baseMap.setView([9.4699247854766355, 7.217137278865754], 6.4);
	baseMap.setView([8.925135520364144, 9.268105727065828], 6.5);

	// featDetailMap.on('load', function() {
	featDetailMap.addLayer(googleHybrid);
	// .setZIndex(-99);
	// });

	function removeTileLayers(map, { keepLayer = null }) {
		map.eachLayer(function (layer) {
			if (layer instanceof L.TileLayer && layer !== keepLayer) {
				map.removeLayer(layer);
			}
		});
	}

	/** 
 This is used to switch between different tile layers (map styles) based on the zoom level of the map.
 */
	function switchTileLayers(map) {
		// Get the current zoom level of the map
		const currMapZoom = map.getZoom();

		// Switch statement to add the appropriate layer to the map based on the zoom level
		switch (true) {
			// If the zoom level is less than 9.5, add the "googleHybrid" layer and remove all other layers
			case currMapZoom < 9.5:
				map.addLayer(googleHybrid);
				removeTileLayers(map, { keepLayer: googleHybrid });
				break;

			// If the zoom level is between 9.5 and 11.5, add the "googleStreets" layer and remove all other layers
			case currMapZoom > 9.5 && currMapZoom < 11.5:
				map.addLayer(googleStreets);
				removeTileLayers(map, { keepLayer: googleStreets });
				break;

			// If the zoom level is between 11.5 and 13, add the "osmStd" layer and remove all other layers
			case currMapZoom > 11.5 && currMapZoom < 13:
				map.addLayer(osmStd);
				removeTileLayers(map, { keepLayer: osmStd });
				break;

			// If the zoom level is between 13 and 18, add the "bingMapsArial" layer and remove all other layers
			case currMapZoom > 13 && currMapZoom < 18:
				map.addLayer(bingMapsArial); // or => bingMapsArial.addTo(map);
				removeTileLayers(map, { keepLayer: bingMapsArial });
				break;

			// If the zoom level is greater than 18, add the "googleHybrid" layer and remove all other layers
			case currMapZoom > 18:
				map.addLayer(googleHybrid); // or => googleHybrid.addTo(map);
				removeTileLayers(map, { keepLayer: googleHybrid });
				break;

			// If there is no matching zoom level, remove all layers and add the googleHybrid layer
			default:
				removeTileLayers(map, {});
				googleHybrid.addTo(map);
				break;
		}
	}

	baseMap.on("zoomend", function () {
		switchTileLayers(baseMap);

		const zoomLevel = LeafletMapsController.getMapZoom();
		console.log({ zoomLevel });

		// FIXME > MOVE SOME PLACE ELSE
		const zoomVisibilityRank = (function getVisibilityRank(zoomLevel) {
			let visRank;
			switch (true) {
				case zoomLevel < 8.8:
					visRank = 1;
					break;
				case zoomLevel > 8.8 && zoomLevel < 12:
					visRank = 2;
					break;
				case zoomLevel > 12 && zoomLevel < 14:
					visRank = 3;
					break;
				case zoomLevel > 14 && zoomLevel < 18:
					visRank = 4;
					break;
				case zoomLevel > 18:
					visRank = 5;
					break;
				default:
					break;
			}
			return visRank;
		})(zoomLevel);

		// ADD VARIOUS LAYER GROUPS BASED ON ZOOM LEVEL && CORRESPONDING VIS. RANK
		(function addLayerGroups(map, currVisRank) {
			console.log({ currVisRank });

			// const layerGroupsObjs = LLayerGroupController.returnLayerGroupObjs({currVisRank});
			const layerGroupsObjs = LLayerGroupController.returnLayerGroupObjs({});

			for (let idx = 0; idx < layerGroupsObjs.length; idx++) {
				const lgObj = layerGroupsObjs[idx];

				const layerGroup = lgObj.layer_group;

				// RENDER ONLY LAYER GROUPS IN MAP VIEW BOUNDS
				// console.log(LeafletMapsController.getLayersInView());

				// FIXME > NOT COMPLETELY WORKING AS INTENDED
				if (!map.hasLayer(layerGroup)) {
					// compare the bounds of the layer group to the map bounds;
					// only add layer groups that are within bounds of the current map view
					if (map.getBounds().contains(LeafletMapsController.getLayerGroupCenterLatLng(layerGroup))) {
						layerGroup.addTo(map);

						console.log("evaluating");

						if (map.hasLayer(layerGroup) && lgObj.visibility_rank > currVisRank) map.removeLayer(layerGroup);
					}
				} else {
					if (lgObj.visibility_rank > currVisRank) map.removeLayer(layerGroup);
				}

				// REMOVE
				// if (!map.hasLayer(layerGroup)) layerGroup.addTo(map);

				// if (map.hasLayer(layerGroup) && lgObj.visibility_rank > currVisRank) map.removeLayer(layerGroup);
				// if (map.hasLayer(layerGroup) && lgObj.visibility_rank > currVisRank) {
				//    map.removeLayer(layerGroup);
				//    console.log("HERE!!!")
				// } else {
				//    // layerGroup.addTo(map);
				// };
			}
		})(baseMap, zoomVisibilityRank);
	});

	baseMap.on("moveend", function () {
		console.log(baseMap.getCenter());
	});

	// TODO > WIP
	// Create additional Control placeholders
	(function setupControlPlaceholders(map) {
		var corners = map._controlCorners;
		const l = "leaflet-";
		const container = map._controlContainer;

		function createCorner(vSide, hSide) {
			var className = l + vSide + " " + l + hSide;
			corners[vSide + hSide] = L.DomUtil.create("div", className, container);
		}

		function initCorner(className) {
			corners[className] = L.DomUtil.create("div", className, container);
			console.log(corners[className]);
			document.querySelector(`.basemap-controls-container`).appendChild(corners[className]);
		}

		createCorner("verticalcenter", "left");
		createCorner("verticalcenter", "right");

		initCorner("basemap-controls-placeholder");
	})(baseMap);

	// TODO > WIP
	(function addCustomControls(map) {
		// Change the position of the Zoom Control to a newly created placeholder.
		// map.zoomControl.setPosition('basemap-controls-placeholder');

		// You can also put other controls in the same placeholder.
		// L.control.scale({position: 'verticalcenterright'}).addTo(map);
		L.control.scale({ position: "basemap-controls-placeholder" }).addTo(map);

		// LEAFLET BETTERSCALE PLUGIN
		L.control.betterscale({ position: "basemap-controls-placeholder", metric: true, imperial: false }).addTo(map);
	})(baseMap);
})(AVG_BASE_MAP, FEAT_DETAIL_MAP);

const getLayerColor = (index) => {
	return LAYER_COLORS[index] ? LAYER_COLORS[index] : "white";
};

const getPresentationPoly = (geoJSONPoly, { useBuffer, bufferAmt, bufferUnits = "kilometers" }) => {
	const presentationPolygon = useBuffer ? _getBufferedPolygon(geoJSONPoly, bufferAmt, { bufferUnits }) : geoJSONPoly;
	return presentationPolygon;
};

// CREATE LINE & FILL LAYERS FROM GEOJSON POLY.
// function getMapboxClickLayer(geoJSON, {color, thickness, fillOpacity})
function getMapboxLayers(geoJSON, { featureIndex, layerId, color, thickness, fillOpacity } = {}) {

	console.log({ geoJSON })
	
	let layerColor = getLayerColor(featureIndex);

	// this layerId has a correspondig featCard with an identical id
	layerId = layerId ? layerId : _ProcessGeoJSON.getId(geoJSON);

	console.log({ layerId })

	if (layerId) {
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
		};

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
	} else {
		return null;
	}
}

// CREATE MAPBOX LAYER FOR LABELS
function getMapboxLabelLayer({ labelIdx, labelText, labelPosition }) {
	const polygonLabel = {
		id: `polygonLabel_${labelIdx}`,
		type: "symbol",
		source: {
			type: "geojson",
			data: labelPosition,
		},
		layout: {
			// "symbol-placement": "line",
			"text-font": ["Open Sans Regular"],
			// "text-field": `Plot #${labelIdx} (${labelText})`,
			"text-field": `Plot_${labelIdx} (${labelText})`,
			"text-size": 10,
		},
		paint: {
			"text-color": "black",
		},
	};
	return polygonLabel;
}

function getFeatCenter(featGeometry) {
	const lngLat = _TurfHelpers.centerOfMass(featGeometry).geometry.coordinates; // LNG-LAT FORMAT
	const latLng = [lngLat[1], lngLat[0]]; // CONVERT TO LAT. LNG FORMAT
	return {
		lngLat,
		latLng,
	};
}

// IIFE TO KEEP TRACK OF RENDERED MAPBOX LAYERS
const MapboxLayersController = (function () {
	try {
		const renderedLayers = [];
		const clickedLayers = [];

		return {
			saveLayers: function (mapboxLayer) {
				if (mapboxLayer) {
					renderedLayers.push(mapboxLayer);
				}
			},
			returnSavedLayers: function () {
				return renderedLayers;
			},
			saveClickedLayers: function (mapboxLayer) {
				if (mapboxLayer) {
					clickedLayers.push(mapboxLayer);
				}
			},
			returnClickedLayers: function () {
				return clickedLayers;
			},
			returnPrevClickedLayer: () => {
				// return clickedLayers[clickedLayers.length - 1];
				if (clickedLayers.length >= 2) {
					return clickedLayers[clickedLayers.length - 2];
				}
			},
		};
	} catch (layersControllerErr) {
		console.error(`layersControllerErr: ${layersControllerErr.message}`);
	}
})();

// KEEP TRACK OF RENDERED MAPBOX MARKERS
const MapboxMarkersController = (function () {
	const renderedMarkers = [];
	return {
		saveMarker: function (marker) {
			if (marker) {
				renderedMarkers.push(marker);
			}
		},
		returnSavedMarkers: function () {
			return renderedMarkers;
		},
	};
})();

// IIFE TO KEEP TRACK OF OPEN MAPBOX POPUPS
const MapboxPopupsController = (function () {
	const openPopups = [];
	return {
		savePopup: function (popup) {
			if (popup) openPopups.push(popup);
		},
		returnOpenPopups: function () {
			return openPopups;
		},
	};
})();

const LeafletMapsController = ((baseMap) => {
	const MARKER_GROUPS = [];
	const baseMapLayerGroup = LLayerGroupController.getLayerGroups().baseMapLayerGroup;

	// REMOVE
	var pixiLoader = new PIXI.loaders.Loader();
	pixiLoader.add("marker", "/assets/icons/location.svg");
	// .add('focusCircle', '/assets/icons/placeholder.png')

	const createFeatMarker = (gjFeature, { useBuffer, bufferAmt, bufferUnits } = {}) => {
		let featMarker;

		try {
			if (!useBuffer) {
				const { featProps } = LeafletMapsController.getFeatureData(gjFeature);

				const featCenterLatLng = [featProps.featureCenterLat, featProps.featureCenterLng];

				if (!featCenterLatLng) throw new Error(`Cannot create GeoJSON feat. maker`);

				// featMarker = L.marker(featCenterLatLng);
				featMarker = L.circleMarker(featCenterLatLng, {
					radius: 4,
					weight: 2,
					opacity: 1,
					color: "white",
					fillOpacity: 1,
					fillColor: "#6ab04c", // forest green
					fillColor: "#fbc531", // sun yellow
					fillColor: "#e84118", // bright red
					fillColor: "#ff6348", // orange
					fillColor: "#4cd137", // skittles green
				});
			} else {
				// TODO
			}

			return featMarker;
		} catch (createFeatMarkerErr) {
			console.error(`createFeatMarkerErr: ${createFeatMarkerErr.message}`);
		}
	};

	function createMarkerClusterGroup({ centerDist, markerDist, zoomLimit, maxClusterRadius }) {
		const clusterGroup = L.markerClusterGroup({
			spiderfyShapePositions: function (count, centerPt) {
				var distanceFromCenter = centerDist,
					markerDistance = markerDist,
					lineLength = markerDistance * (count - 1),
					lineStart = centerPt.y - lineLength / 2,
					res = [],
					i;

				res.length = count;

				for (i = count - 1; i >= 0; i--) {
					res[i] = new Point(centerPt.x + distanceFromCenter, lineStart + markerDistance * i);
				}

				return res;
			},
			showCoverageOnHover: true,
			disableClusteringAtZoom: zoomLimit,
			maxClusterRadius: function (zoom) {
				return zoom <= 14 ? maxClusterRadius : 1; // radius in pixels
			}, // A cluster will cover at most this many pixels from its center
		});
		return clusterGroup;
	}

	return {
		getMapZoom: (map = baseMap) => {
			return map.getZoom();
		},
		getLayerGroupCenterLatLng: (lg) => {
			const lgLayers = lg.getLayers();

			const featGroup = L.featureGroup(lgLayers); // convert to feat. group in order taccess getBounds() mtd.

			const lgLatLng = featGroup.getBounds().getCenter();

			return lgLatLng;
		},
		getLayersInView: (map = baseMap) => {
			const visibleLayers = [];
			map.eachLayer(function (layer) {
				if (layer instanceof L.layerGroup) {
					console.log({ layer });
					if (map.getBounds().contains(layer.getLatLng())) {
						visibleLayers.push(layer);
					}
				}
			});
			return visibleLayers;
		},
		getClusterPropsMarkup: (clusterProps) => {
			console.log({ clusterProps });

			try {
				const HTMLMarkup = `
               <div class= "plot-metadata-label--chunk-size"> 
                  <span> ${clusterProps.clusterArea.toFixed(1)} hectares </span>
                  <span> ${(clusterProps.clusterArea * 2.47105).toFixed(1)} acres </span> 
               </div>
               <div class="metadata-label--owner-info__avg"> 
                  <span> ${clusterProps.clusterName} </span>
                  <span>${clusterProps.clusterFeatsNum} Farmers •
                     <span>${clusterProps.clusterLocation}</span>
                  </span>
               </div>
               <div class="metadata-label--turn-by-turn" id="metadata_label_turn_by_turn">
                  <a href="#" role="button" title="Plot boundary turn-by-turn directions" aria-label="Plot boundary turn-by-turn directions"></a>
                     <span >
                        <i id="" class="fas fa-route"></i>
                     </span>
               </div>`;
				return HTMLMarkup;
			} catch (HTMLMarkupErr) {
				console.error(`HTMLMarkupErr: ${HTMLMarkupErr.message}`);
			}
		},
		getFeatPropsMarkup: (featProps) => {
			try {
				const HTMLMarkup = `
            <div class= "plot-metadata-label--chunk-size"> 
               <span> ${featProps.featureArea} hectares </span>
               <span> ${(featProps.featureArea * 2.47105).toFixed(1)} acres </span> 
            </div>
            <div class="metadata-label--owner-info__avg"> 
               <span> Plot-${featProps.featureIndex} </span>
               <span> ${_.startCase(_joinWordsArray(Object.values(featProps.featureAdmin.admin1.names)))} </span>
            </div>
            <div class="metadata-label--turn-by-turn" id="metadata_label_turn_by_turn">
               <a href="#" role="button" title="Plot boundary turn-by-turn directions" aria-label="Plot boundary turn-by-turn directions"></a>
                  <span >
                     <i id="" class="fas fa-route"></i>
                  </span>
            </div>`;
				return HTMLMarkup;
			} catch (HTMLMarkupErr) {
				console.error(`HTMLMarkupErr: ${HTMLMarkupErr.message}`);
			}
		},
		getClusterPlotHTMLMarker: (props, latLngPosition, styleClass, { draggable = true }) => {
			const HTMLMarker = L.marker(latLngPosition, {
				draggable: draggable,
				icon: L.divIcon({
					className: `${styleClass}`,
					html: LeafletMapsController.getFeatPropsMarkup(props),
				}),
				zIndexOffset: 100,
			});
			return HTMLMarker;
		},
		getClusterMetadataMarker: (props, latLngPosition, styleClass, { draggable = true }) => {
			const HTMLMarker = L.marker(latLngPosition, {
				draggable: draggable,
				icon: L.divIcon({
					className: `${styleClass}`,
					html: _getClusterMetadaMarkerMarkup(props),
				}),
				zIndexOffset: 100,
			});
			return HTMLMarker;
		},
		initMarker: (gjFeature, { useBuffer, bufferAmt, bufferUnits }) => {
			return createFeatMarker(gjFeature, { useBuffer, bufferAmt, bufferUnits });
		},
		saveMarkerGroup: (markers) => {
			MARKER_GROUPS.push(markers);
		},
		panToPointFeat: async (gjPointFeat, { map = baseMap, zoomLevel }) => {
			const leafletGJLayer = L.geoJson();
			leafletGJLayer.addData(gjPointFeat);
			map.flyTo(leafletGJLayer.getBounds().getCenter(), zoomLevel);
			// map.setView(leafletGJLayer.getBounds().getCenter(), zoomLevel);
		},
		panToCoords: async (gjPointCoords, { map = baseMap, zoomLevel }) => {
			map.flyTo(gjPointCoords, zoomLevel, {
				animate: true,
				duration: 8.5,
			});
			// map.flyTo(gjPointCoords, zoomLevel);
		},
		getFeatCoords: async (geoJSONFeat) => {
			const leafletGJLayer = L.geoJson();
			leafletGJLayer.addData(geoJSONFeat);
			return leafletGJLayer.getBounds().getCenter();
		},
		panFeatCenter: async (geoJSON, { map = baseMap, zoomLevel }) => {
			const turfCOMFeat = turf.centerOfMass(geoJSON); // FIXME
			// await LeafletMapsController.panToPointFeat(turfCOMFeat, {map, zoomLevel}); // REMOVE > DEPRC.
			const featPointCoords = await LeafletMapsController.getFeatCoords(turfCOMFeat);
			await LeafletMapsController.panToCoords(featPointCoords, { map, zoomLevel });
		},
		fitFeatBounds: (geoJSON, { map = baseMap }) => {
			const leafletGJLayer = L.geoJson(geoJSON);
			map.fitBounds(leafletGJLayer.getBounds(), { padding: [150, 150] });
			// map.fitBounds(leafletGJLayer.getBounds(), {padding: [130, 80]});
		},
		addPointMarker: (gjPointFeat, { map = baseMap, zoomLevel }) => {
			// TODO
		},
		getFeatPolyOutline: (
			featGeometry,
			{ lineColor = "white", lineWeight = 3, lineOpacity = 1, lineDashArray = ``, lineDashOffset = 0 } = {}
		) => {
			const polygonOutline = L.geoJSON(featGeometry, {
				color: lineColor,
				weight: lineWeight,
				opacity: lineOpacity,
				fillOpacity: 0,
				dashArray: lineDashArray,
				dashOffset: lineDashOffset,
			});
			return polygonOutline;
		},
		getFeatPolyFill: (featCoords, { fillColor = "green", fillOpacity = 0.5 } = {}) => {
			// FIXME > THE COORD. SYSTEM HERE IS OFF..
			const polygonFill = L.polygon([...featCoords], {
				style: {
					fillColor: fillColor,
					fillOpacity: fillOpacity,
					color: "white",
					weight: 3,
					dashArray: "3",
					opacity: 3,
				},
			});
			return polygonFill;
		},
		getFeatureData: (feature) => {
			let featProps, featGeometry, featCoords, featCenter;

			// const refinedFeat = _getUsableGeometry(feature).refinedGeoJSON;
			const refinedFeat = feature;

			if (refinedFeat.geometry) featGeometry = refinedFeat.geometry;
			if (featGeometry) featCoords = refinedFeat.geometry.coordinates;
			// featCenter = getFeatCenter(featGeometry).latLng;
			if (feature.properties) featProps = feature.properties;

			return {
				featProps,
				featGeometry,
				featCoords,
				featCenter,
			};
		},
		drawFeature: (
			gjFeature,
			{
				featLayerGroup = baseMapLayerGroup,
				useBuffer,
				bufferAmt,
				bufferUnits,
				lineColor,
				lineWeight,
				lineOpacity,
				lineDashArray,
			}
		) => {
			try {
				switch (_TurfHelpers.getType(gjFeature)) {
					case "Point":
						console.log("Fuck You Rita Nwaokolo");
						createFeatMarker(gjFeature);
						break;

					case "GeometryCollection":
						throw new Error(
							`Cannot create marker for this feature: ${gjFeature} of type ${_TurfHelpers.getType(gjFeature)}`
						);

					default:
						gjFeature = getPresentationPoly(gjFeature, { useBuffer, bufferAmt, bufferUnits });

						const { featGeometry, featCoords } = LeafletMapsController.getFeatureData(gjFeature);

						// RENDER OUTLINE
						if (featGeometry) {
							LeafletMapsController.getFeatPolyOutline(featGeometry, {
								lineColor,
								lineWeight,
								lineOpacity,
								lineDashArray,
							}).addTo(featLayerGroup);
						} else {
							console.warn(`Cannot render feat ${gjFeature}. Geometry is invalid.`);
						}

						// RENDER FILL
						// if (featCoords) LeafletMapsController.getFeatPolyFill(featCoords).addTo(featLayerGroup);

						// REMOVE
						// FIXME > DOES THIS BELONG HERE??
						// createFeatMarker(gjFeature);

						break;
				}
			} catch (LDrawFeatErr) {
				console.error(`LDrawFeatErr: ${LDrawFeatErr.message}`);
			}
		},

		// REMOVE
		renderFeatColl_2: (featColl, { map = baseMap }) => {
			try {
				if (turf.geojsonType(featColl, "FeatureCollection", "renderFeatColl"));

				// console.log(featColl.features[0].geometry)
				// console.log(featColl.features[1].geometry)

				const UniteFeatures = (() => {
					let featsUnion;
					return {
						saveUnion: (currUnion) => {
							featsUnion = currUnion;
						},
						returnUnion: () => {
							return featsUnion;
						},
					};
				})();

				for (let idx = 0; idx < featColl.features.length; idx++) {
					const currFeat = featColl.features[idx];

					if (idx === 0) {
						if (currFeat.geometry && turf.getType(currFeat)) {
							UniteFeatures.saveUnion(currFeat);
						} else {
							break;
						}
					}

					if (currFeat.geometry && turf.getType(currFeat)) {
						const prevUnion = UniteFeatures.returnUnion();
						try {
							UniteFeatures.saveUnion(turf.union(currFeat.geometry, prevUnion.geometry));
							console.log(UniteFeatures.returnUnion());
						} catch (turfUnionErr) {
							console.error(`turfUnionErr: ${turfUnionErr.message}`);
						}
					} else {
						break;
					}
				}

				const unitedFeatures = UniteFeatures.returnUnion();

				// const unitedFeatures = featColl.features.reduce((featsUnion, currentFeat) => {
				//    console.log({featsUnion})
				//    console.log({currentFeat})
				//    if (!featsUnion.geometry && currentFeat.geometry) featsUnion = currentFeat;
				//    return featsUnion = turf.union(featsUnion.geometry, currentFeat.geometry);
				// }, featColl.features[0]);

				// const unitedFeatures2 = turf.featureReduce(featColl, (featsUnion, currentFeat) => {
				//    if (!featsUnion.geometry && currentFeat.geometry) featsUnion = currentFeat;
				//    return featsUnion = turf.union(featsUnion.geometry, currentFeat.geometry);
				// }, featColl.features[0]);

				console.log(unitedFeatures);
			} catch (renderFeatCollErr) {
				console.error(renderFeatCollErr.message);
			}
		},
		// REMOVE
		renderFeatureMarker__2: async (feature, { map = baseMap }) => {
			const { featCenter } = LeafletMapsController.getFeatureData(feature);

			// L.marker(featCenter).addTo(baseMapLayerGroup);

			//Use canvas mode to render marker
			// var canvasIconLayer = L.canvasIconLayer({}).addTo(map);
			var canvasIconLayer = L.canvasIconLayer({}).addTo(baseMapLayerGroup);

			var icon = L.icon({
				iconUrl: "/assets/icons/location.svg",
				iconSize: [20, 18],
				iconAnchor: [10, 9],
			});

			var marker = L.marker(featCenter, { icon: icon });
			// .bindPopup("AGC")

			canvasIconLayer.addLayer(marker);

			//    L.canvasMarker(featCenter, {
			//       radius: 20,
			//       img: {
			//          url: '/assets/icons/location.svg',    //image link
			//          size: [30, 30],     //image size ( default [40, 40] )
			//          // rotate: 10,         //image base rotate ( default 0 )
			//          offset: { x: 0, y: 0 }, //image offset ( default { x: 0, y: 0 } )
			//       },
			//   }).addTo(map);
		},
		// REMOVE
		renderFeaturesMarkers__2: async (gjFeatures, { map = baseMap }) => {
			const canvasMarkers = [];

			// var canvasIconLayer = L.canvasIconLayer({}).addTo(baseMapLayerGroup);
			// var canvasIconLayer = L.canvasIconLayer({}).addTo(map);

			canvasIconLayer.addOnClickListener(function (e, data) {
				console.log(data);
			});
			canvasIconLayer.addOnHoverListener(function (e, data) {
				console.log(data[0].data._leaflet_id);
			});

			var canvasIcon = L.icon({
				iconUrl: "/assets/icons/location.svg",
				iconSize: [20, 18],
				iconAnchor: [10, 9],
			});

			for (let idx = 0; idx < gjFeatures.length; idx++) {
				const gjFeature = gjFeatures[idx];

				const { featCenter } = LeafletMapsController.getFeatureData(gjFeature);

				// var canvasMarker = L.marker(featCenter, { icon: canvasIcon })
				// // .bindPopup("AGC")

				// canvasMarkers.push(canvasMarker);
			}

			// canvasIconLayer.addLayers(canvasMarkers);
		},
		// REMOVE
		renderFeatureMarker: async (gjFeature, { map = baseMap }) => {
			// map.attributionControl.setPosition('bottomleft');
			// map.zoomControl.setPosition('bottomright');

			// const featMarkerCoords = [];

			// for (let idx = 0; idx < gjFeatures.length; idx++) {

			//    const gjFeature = gjFeatures[idx];

			const { featProps } = LeafletMapsController.getFeatureData(gjFeature);

			var featMarkerCoords = [featProps.featureCenterLat, featProps.featureCenterLng];

			//    featMarkerCoords.push(featMarkerCoord);
			// };

			pixiLoader.load(function (loader, resources) {
				// var textures = [resources.marker.texture];
				var texture = resources.marker.texture;
				// var focusTextures = [resources.focusCircle.texture];

				const pixiLayer = ((markerCoords) => {
					var zoomChangeTs = null;
					var pixiContainer = new PIXI.Container();
					var innerContainer = new PIXI.particles.ParticleContainer(markerCoords.length, {
						vertices: true,
					});

					innerContainer.texture = texture;
					innerContainer.baseTexture = texture.baseTexture;
					innerContainer.anchor = { x: 0.5, y: 1 };

					pixiContainer.addChild(innerContainer);

					var doubleBuffering = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
					var initialScale;

					return L.pixiOverlay(
						function (utils, event) {
							var zoom = utils.getMap().getZoom();
							var container = utils.getContainer();
							var renderer = utils.getRenderer();
							var project = utils.latLngToLayerPoint;
							var getScale = utils.getScale;
							var invScale = 1 / getScale();

							if (event.type === "add") {
								var origin = project([9.4699247854766355, 7.217137278865754]);
								innerContainer.x = origin.x;
								innerContainer.y = origin.y;
								initialScale = invScale / 8;
								innerContainer.localScale = initialScale;

								// for (var i = 0; i < markersLength; i++) {
								var coords = project([...markerCoords]);
								// our patched particleContainer accepts simple {x: ..., y: ...} objects as children:
								innerContainer.addChild({
									x: coords.x - origin.x,
									y: coords.y - origin.y,
								});
								// };
							}

							if (event.type === "zoomanim") {
								var targetZoom = event.zoom;
								if (targetZoom >= 16 || zoom >= 16) {
									zoomChangeTs = 0;
									var targetScale = targetZoom >= 16 ? 1 / getScale(event.zoom) : initialScale;
									innerContainer.currentScale = innerContainer.localScale;
									innerContainer.targetScale = targetScale;
								}
								return;
							}

							if (event.type === "redraw") {
								var delta = event.delta;
								if (zoomChangeTs !== null) {
									var duration = 17;
									zoomChangeTs += delta;
									var lambda = zoomChangeTs / duration;
									if (lambda > 1) {
										lambda = 1;
										zoomChangeTs = null;
									}
									lambda = easing(lambda);
									innerContainer.localScale =
										innerContainer.currentScale +
										lambda * (innerContainer.targetScale - innerContainer.currentScale);
								} else {
									return;
								}
							}

							renderer.render(container);
						},
						pixiContainer,
						{
							doubleBuffering: doubleBuffering,
							destroyInteractionManager: true,
						}
					);
				})(featMarkerCoords);

				pixiLayer.addTo(baseMapLayerGroup);
			});
		},
		// REMOVE
		renderPixiMarker: (gjFeature, { map = baseMap }) => {
			const { featProps } = LeafletMapsController.getFeatureData(gjFeature);
			const featCenterLatLng = [featProps.featureCenterLat, featProps.featureCenterLng];

			var loader = new PIXI.loaders.Loader();
			// loader.add('marker', '/assets/icons/location.svg');
			loader.add("marker", "/assets/icons/marker-icon.png");

			loader.load(function (loader, resources) {
				var markerTexture = resources.marker.texture;
				var markerLatLng = [...featCenterLatLng];
				var marker = new PIXI.Sprite(markerTexture);
				marker.anchor.set(0.5, 1);

				var pixiContainer = new PIXI.Container();
				pixiContainer.addChild(marker);

				var firstDraw = true;
				var prevZoom;

				var pixiOverlay = L.pixiOverlay(function (utils) {
					var zoom = utils.getMap().getZoom();
					var container = utils.getContainer();
					var renderer = utils.getRenderer();
					var project = utils.latLngToLayerPoint;
					var scale = utils.getScale();

					if (firstDraw) {
						var markerCoords = project(markerLatLng);
						marker.x = markerCoords.x;
						marker.y = markerCoords.y;
					}

					if (firstDraw || prevZoom !== zoom) {
						marker.scale.set(1 / scale);
					}

					firstDraw = false;
					prevZoom = zoom;

					renderer.render(container);
				}, pixiContainer);
				pixiOverlay.addTo(map);
			});
		},

		renderMarkerCluster: async (markers, { map = baseMap }) => {
			const markerCluster = createMarkerClusterGroup({
				centerDist: 35,
				markerDist: 45,
				// zoomLimit: 13,
				zoomLimit: 15,
				// maxClusterRadius: 10,
				maxClusterRadius: 40,
			});

			for (let idx = 0; idx < markers.length; idx++) {
				if (markers[idx]) markerCluster.addLayer(markers[idx]);
			}

			map.addLayer(markerCluster);
		},

		drawPolySurveyDetails: (gjPolygon, polyLayerGroup, { distThresh = 10, bearingThresh = 45 }) => {
			const polyProps = gjPolygon.properties;
			const polyId = polyProps.clusterID ? polyProps.clusterID : polyProps.featureID;
			const polyCoords = gjPolygon.geometry.coordinates[0];

			// BUILD A DATA OBJ. TO HOLD THE NAV. INFO. FOR EACH PLOT
			const POLYGON_BOUNDARY_DATA = {
				poly_id: 0,
				start_coords: 0,
				vertex_pairs: [],
				vertex_bearings: [],
				vertex_deltas: [],
			};

			try {
				// RENDER THE CLUSTER FEATURE VERTICE DETAILS
				(function renderBoundsDetails() {
					// TODO
					// renderFeatVertices()

					// SHOW THE DISTANCE & BEARING BTW. FARM PLOT CORNERS
					for (let idx = 0; idx < polyCoords.length; idx++) {
						// REFERENCE THE INDEX OF THIS PLOT
						POLYGON_BOUNDARY_DATA.poly_id = polyId;

						const plotCorner = polyCoords[idx];

						const fromPlotCorner = polyCoords[idx];
						const toPlotCorner = polyCoords[idx + 1] === undefined ? polyCoords[0] : polyCoords[idx + 1]; // RETURN BACK TO STARTING CORNER

						// SAVE THE CURRENT PLOT CORNERS > REMOVE THE REDUNDANT PAIR @ START POINT..
						POLYGON_BOUNDARY_DATA.vertex_pairs.push([fromPlotCorner, toPlotCorner]);

						const midpoint = _TurfHelpers.midpoint(fromPlotCorner, toPlotCorner);
						const midpointCoords = midpoint.geometry.coordinates; // TO PLACE THE DIST. LABELS
						const distance =
							_TurfHelpers.distance(fromPlotCorner, toPlotCorner, {
								distUnits: "kilometers",
							}) * 1000;
						const turfBearing = _TurfHelpers.distance(fromPlotCorner, toPlotCorner, {
							distUnits: "degrees",
						});
						const mathBearing = _GeometryMath.computeBearing(fromPlotCorner, toPlotCorner);
						const degMinSec = _GeometryMath.getDegMinSec(mathBearing); // CONVERT bearing to 0° 0' 4.31129" FORMAT

						// YOU ARE AT STARTING POINT WHEN BEARING === 0
						// DON'T SHOW A MIDPOINT DIST. MARKER HERE
						// ONLY SHOW LABELS IF DIST. BTW. VERTICES > 5.0 meters
						if (turfBearing !== 0 && distance > distThresh) {
							// if (turfBearing !== 0 && mathBearing > bearingThresh && distance > distThresh) {

							// SHOW THE PLOT VERTICES AS LEAFLET ICONS
							// IMPORTANT
							// NOTE: COORDS. IN LEAFLET ARE "latLng"
							// NOTE: COORDS. IN MAPBOX ARE "lngLat"
							L.marker([plotCorner[1], plotCorner[0]], {
								icon: L.divIcon({
									className: `polygon-vertex-coords-label--lg`,
									html: `<span>${idx}</span>${plotCorner[0].toFixed(6)}°N, ${plotCorner[1].toFixed(6)}°E`,
									iconSize: [100, 30],
								}),
								zIndexOffset: 98,
							}).addTo(polyLayerGroup);

							// SHOW DIST. BTW. CORNERS ONLY (FOR SMALL SCREENS)
							L.marker([midpointCoords[1], midpointCoords[0]], {
								draggable: true,
								icon: L.divIcon({
									className: `polygon-vertex-dist-label--lg`,
									html: `${distance.toFixed(0)} m`,
									iconSize: [30, 15],
								}),
								zIndexOffset: 99,
							}).addTo(polyLayerGroup);

							// SHOW DIST. & BEARING (FOR DESKTOP)
							L.marker([midpointCoords[1], midpointCoords[0]], {
								draggable: true,
								icon: L.divIcon({
									className: `polygon-vertex-dist-bearing-label--lg`,
									html: `${distance.toFixed(0)} m, ${degMinSec}`,
									iconSize: [50, 30],
								}),
								zIndexOffset: 99,
							}).addTo(polyLayerGroup);

							// SAVE THE BEARING BTW. THE VERTICES
							POLYGON_BOUNDARY_DATA.vertex_bearings.push(mathBearing);
							POLYGON_BOUNDARY_DATA.vertex_deltas.push(distance);
						} else if (turfBearing === 0) {
							// THE BEARING == 0 => THAT CORNER IS THE PLOT "STARTING" POINT

							// SAVE THE BEARING & COORDS. @ 0
							POLYGON_BOUNDARY_DATA.start_coords = plotCorner;

							// ADD AN ANIMATED MARKER
							// polyLayerGroup.addLayer(getAnimatedPersonMarker([plotCorner[1], plotCorner[0]]));
						}
					}

					// DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
					// console.log({...POLYGON_BOUNDARY_DATA});
				})();
			} catch (surveyDetailsErr) {
				console.error(`surveyDetailsErr: ${surveyDetailsErr.message}`);
			}
		},
	};
})(AVG_BASE_MAP);

const MapboxMapsController = ((subplotsMap) => {
	return {
		clearPopups: () => {
			var popUps = document.getElementsByClassName("mapboxgl-popup");
			if (popUps[0]) popUps[0].remove();
			const openPopups = MapboxPopupsController.returnOpenPopups();
			openPopups.forEach((openPopup) => {
				if (openPopup) openPopup.remove;
			});
		},

		// CLEAR PREV. RENDERED MARKERS
		removeMarkers: (markersArray) => {
			if (markersArray.length > 0) {
				for (const marker of markersArray) {
					marker.remove();
				}
			}
		},

		// ADD A LAYER TO A MAPBOX MAP
		addLayer: (map, layer) => {
			if (map.getSource(layer.id)) {
				map.removeLayer(layer.id);
				map.removeSource(layer.id);
				map.addLayer(layer);
			} else {
				// INITIAL STATE > THERE WERE NO LAYERS ON MAP
				map.addLayer(layer);
			}
			// console.log(map.getStyle().sources);
		},

		// CLEAR PREV. RENDERED LAYERS
		sanitizeLayers: ({ map, renderedLayers = null, layerIDs = null }) => {
			if (renderedLayers && renderedLayers.length > 0) {
				renderedLayers.forEach((layer) => {
					if (map.getSource(layer.id)) {
						map.removeLayer(layer.id);
						map.removeSource(layer.id);
					}
				});
			}

			if (layerIDs) {
				layerIDs.forEach((layerID) => {
					if (map.getSource(layerID)) {
						map.removeLayer(layerID);
						map.removeSource(layerID);
					}
				});
			}
		},

		switchLayer: ({ layerId = _mandatoryParam(), map = subplotsMap }) => {
			map.setStyle(`mapbox://styles/mapbox/${layerId}`);
		},

		// EXTRACT GEOJSON DATA FROM A MAPBOX LAYER EVENT
		getLayerData: (layer) => {
			const layerGeoJSON = layer.features[0];
			const layerProps = layerGeoJSON.properties;
			layerProps.featureAdmin = JSON.parse(layerGeoJSON.properties.featureAdmin);
			const lngLatCenter = layer.lngLat;
			const layerGeometry = layer.features[0].geometry;
			const layerCoords = layerGeometry.coordinates[0];

			// const turfCenter = turf.centerOfMass(layerGeometry).geometry.coordinates; // LNG. LAT. FORMAT
			// const latLngCenter = [turfCenter[1], turfCenter[0]] // CONVERT TO LAT. LNG FORMAT
			const latLngCenter = getFeatCenter(layerGeometry).latLng;

			return {
				layerGeoJSON,
				layerProps,
				lngLatCenter,
				layerGeometry,
				layerCoords,
				latLngCenter,
			};
		},

		// PAN MAP TO GEOJSON'S CENTER
		panToCoords: (map, centerCoords, bounds, { zoom = 16, pitch = 0, bearing = 0, boundsPadding = 0 }) => {
			// PAN TO LOCATION
			map.flyTo({
				center: centerCoords,
				zoom: zoom,
				pitch: pitch,
				bearing: bearing,
				// zoom: zoomSetting,
			});
			// CONTAIN THE ZOOM TO THE SHAPEFILE'S BOUNDS
			map.fitBounds(bounds, { padding: boundsPadding });
		},

		// GJ. POLY RENDER FUNCTION
		drawGJPolygon: async (mapboxMap, polygon, featureIdx) => {
			try {
				// GET THE CHUNK POLYGON LAYERS
				let polygonOutlineLayer = getMapboxLayers(polygon, {
					featureIndex: featureIdx,
					color: null,
					thickness: 2,
					fillOpacity: 0.1,
				}).outlineLayer;

				let polygonFillLayer = getMapboxLayers(polygon, {
					featureIndex: featureIdx,
					color: null,
					thickness: 2,
					fillOpacity: 0.1,
				}).fillLayer;

				if (polygonOutlineLayer && polygonFillLayer) {

					// WIP
					// // CLEAR PREVIOUSLY RENDERED LAYERS
					// MapboxMapsController.sanitizeLayers({map: mapboxMap, renderedLayers: MapboxLayersController.returnSavedLayers()});
					// MapboxMapsController.removeMarkers(MapboxMarkersController.returnSavedMarkers());

					// ADD THE LAYERS TO THE MAPBOX MAP
					MapboxMapsController.addLayer(mapboxMap, polygonOutlineLayer);
					MapboxMapsController.addLayer(mapboxMap, polygonFillLayer);

					// ADD INTERACTION TO THE FILL LAYER
					MapboxFillLayerHandler.addInteraction(mapboxMap, polygonFillLayer);

					// SAVE THE LAYERS
					MapboxLayersController.saveLayers(polygonOutlineLayer);
					MapboxLayersController.saveLayers(polygonFillLayer);
				} else {
					throw new Error(`Could not get Mapbox fill &/or outline layers for ${polygon}`);
				}
			} catch (mapboxDrawFeatErr) {
				console.error(`mapboxDrawFeatErr: ${mapboxDrawFeatErr.message}`);
			}
		},

		// RENDER LABELS @ CENTER OF POLYGONS
		drawGJPolygonLabel: async (mapboxMap, polygon, featureIdx, { areaUnits = `hectares` }) => {
			try {
				const labelIdx = featureIdx + 1;
				const plotArea = _TurfHelpers.calcPolyArea(polygon, { units: areaUnits });
				const labelText = `${plotArea.toFixed(0)} ${areaUnits}`;
				const labelPosition = turf.centerOfMass(polygon);

				const labelLayer = getMapboxLabelLayer({
					labelIdx: labelIdx,
					labelText,
					labelPosition,
				});

				MapboxMapsController.addLayer(mapboxMap, labelLayer);

				MapboxLayersController.saveLayers(labelLayer);
			} catch (mapboxDrawLabelsErr) {
				console.error(`mapboxDrawLabelsErr: ${mapboxDrawLabelsErr.message}`);
			}
		},

		openFeatPopup: (map, props, centerLngLat) => {
			console.log({ props });

			MapboxMapsController.clearPopups();

			// const popup = new mapboxgl.Popup({ className: "mapbox-metadata-popup" })
			const popup = new mapboxgl.Popup({ closeOnClick: true })
				.setLngLat(centerLngLat)
				.setHTML(_getClusterFeatPopupMarkup(props))
				.addTo(map);

			MapboxPopupsController.savePopup(popup);

			// CREATE A CUSTOM EVENT LISTENER >> TRIGGERED BY: map.fire('closeAllPopups')
			map.on("closeAllPopups", () => {
				popup.remove();
			});
		},

		// SIMPLE MAPBOX GJ. RENDER FN.
		drawFeatFeatColl: (featOrFeatColl, { map = subplotsMap }) => {
			try {
				// RENDER ONLY FEATS. OR FEAT. COLLS.
				if (map) {
					// CALC. SOME METADATA
					const gjUniqueID = featOrFeatColl._id;
					const gjCenterCoords = turf.coordAll(turf.centerOfMass(featOrFeatColl))[0];

					// INIT. MAPBOX LAYERS
					const gjOutlineLayer = getMapboxLayers(featOrFeatColl, {
						featureIndex: gjUniqueID,
						color: "#009432",
						thickness: 1,
						fillOpacity: null,
					}).outlineLayer;
					const gjFillLayer = getMapboxLayers(featOrFeatColl, {
						featureIndex: gjUniqueID,
						color: "white",
						thickness: null,
						fillOpacity: 0.25,
					}).fillLayer;

					// INIT. MAPBOX MARKER
					const mapboxMarker = new mapboxgl.Marker().setLngLat(gjCenterCoords);

					// CLEAR PREVIOUSLY RENDERED LAYERS
					MapboxMapsController.sanitizeLayers({
						map: map,
						renderedLayers: MapboxLayersController.returnSavedLayers(),
					});
					MapboxMapsController.removeMarkers(MapboxMarkersController.returnSavedMarkers());

					// console.log(gjOutlineLayer)
					// console.log(gjFillLayer)

					// ADD LAYERS TO MAPBOX MAP
					MapboxMapsController.addLayer(map, gjOutlineLayer);
					MapboxMapsController.addLayer(map, gjFillLayer);
					mapboxMarker.addTo(map);

					// SAVE THE LAYERS & MARKERS
					MapboxLayersController.saveLayers(gjOutlineLayer);
					MapboxLayersController.saveLayers(gjFillLayer);
					MapboxMarkersController.saveMarker(mapboxMarker);

					console.log(MapboxLayersController.returnSavedLayers());
				} else {
					throw new Error(`This function requires a GeoJSON Feature or FeatureCollection`);
				}
			} catch (mapboxGJRenderErr) {
				console.error(`mapboxGJRenderErr: ${mapboxGJRenderErr.message}`);
			}
		},
	};
})(CLUSTER_PLOTS_MAP);

// OPEN A LEAFLET MAP IN A MODAL WHEN PLOTS MAP FILL LAYER IS CLICKED
const MapboxFillLayerHandler = ((leafletModalMap) => {
	const baseMapLayerGroup = LLayerGroupController.getLayerGroups().baseMapLayerGroup; // REMOVE > UN-USED
	const modalMapLayerGroup = LLayerGroupController.getLayerGroups().modalMapLayerGroup;

	// BUILD A DATA OBJ. TO HOLD THE NAV. INFO. FOR EACH PLOT
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
				const layerData = MapboxMapsController.getLayerData(e);

				// // SANDBOX
				// $('#exampleModal').modal('show');
				// setInterval(() => {
				//    leafletMiniMap.invalidateSize();
				// }, 1000);

				_ManipulateDOM.affectDOMElement(fillLayer.id, `selected`);

				MapboxMapsController.openFeatPopup(map, layerData.layerProps, layerData.lngLatCenter);

				// get a new mapbox layer
				const clickedLayerId = `clickedLayer_${fillLayer.id}`;
				const clickedLayer = getMapboxLayers(layerData.layerGeoJSON, {
					layerId: clickedLayerId,
					color: "black",
					thickness: 4,
					fillOpacity: 0.2,
				}).fillLayer;

				// TODO > clear prev. popups

				// clear prev. clicked layers
				MapboxMapsController.sanitizeLayers({
					map,
					renderedLayers: MapboxLayersController.returnClickedLayers(),
				});

				// add clicked layer to map
				MapboxMapsController.addLayer(map, clickedLayer);

				// KEEP TRACK OF THE CLICKED LAYER
				MapboxLayersController.saveLayers(clickedLayer);
				MapboxLayersController.saveClickedLayers(clickedLayer);

				// SHOW FEAT. DETAIL MAP CONTAINER
				(function showFeatDetailMapContainer(clickedLayerId) {
					// SANDBOX
					$("#exampleModal").modal("show");
					setInterval(() => {
						leafletModalMap.invalidateSize();
					}, 500);

					const prevClickedLayer = MapboxLayersController.returnPrevClickedLayer();

					if (prevClickedLayer) {
						console.log(prevClickedLayer.id);
						console.log(MapboxLayersController.returnClickedLayers());

						if (clickedLayerId === prevClickedLayer.id) {
							MapboxMapsController.sanitizeLayers({
								map,
								renderedLayers: MapboxLayersController.returnClickedLayers(),
							});
						}
					}
				})(clickedLayer.id);

				// RENDER THE CLUSTER FEATURE VERTICE DETAILS
				(function renderBoundsDetails(featureData, leafletMap, leafletLayerGroup) {
					// REMOVE
					// leafletMap.invalidateSize();

					// FIXME > NOT WORKING PROPERLY
					if (!_pollAVGSettingsValues().renderMultiFeatsChk) {
						console.log({ leafletLayerGroup });
						leafletLayerGroup.clearLayers();
						console.log({ leafletLayerGroup });
					}

					const featIdx = featureData.featureIndex;
					const featProps = featureData.layerProps;
					const featCoords = featureData.layerCoords;
					const featCenter = featureData.latLngCenter;
					const featGeometry = featureData.layerGeometry;
					const featBounds = L.geoJson(featGeometry).getBounds();

					// DELAY map.fitBounds TILL WHEN MODAL MAP IS OPEN
					setInterval(() => {
						// leafletMap.fitBounds(leafletLayerGroup.getBounds(), {padding: [150, 50]}); // PADDING: [L-R, T-D]
						leafletMap.fitBounds(featBounds, { padding: [50, 80] }); // PADDING: [L-R, T-D]
					}, 1500);

					// ADD A MARKER TO PLOT CENTER
					L.marker(featureData.latLngCenter).addTo(leafletLayerGroup);

					// RENDER A LEAFLET POLYGON
					LeafletMapsController.getFeatPolyOutline(featGeometry, { lineWeight: 4 }).addTo(leafletLayerGroup);

					// FILL THE POLYGON
					LeafletMapsController.getFeatPolyFill(featCoords).addTo(leafletLayerGroup);

					// DISPLAY PLOT METADATA AT CENTER OF THE CLUSTER PLOT FEATURE
					LeafletMapsController.getClusterPlotHTMLMarker(featProps, featCenter, "plot-metadata-label", {
						draggable: true,
					}).addTo(leafletLayerGroup);

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

						const midpoint = _TurfHelpers.midpoint(fromPlotCorner, toPlotCorner);
						const midpointCoords = midpoint.geometry.coordinates; // TO PLACE THE DIST. LABELS
						const distance =
							_TurfHelpers.distance(fromPlotCorner, toPlotCorner, {
								distUnits: "kilometers",
							}) * 1000;
						const turfBearing = _TurfHelpers.distance(fromPlotCorner, toPlotCorner, {
							distUnits: "degrees",
						});
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
									iconSize: [70, 15],
								}),
								zIndexOffset: 98,
							}).addTo(leafletLayerGroup);

							// SHOW DIST. BTW. CORNERS ONLY (FOR SMALL SCREENS)
							L.marker([midpointCoords[1], midpointCoords[0]], {
								draggable: true,
								icon: L.divIcon({
									className: "plot-polygon-vertex-dist-label",
									html: `${distance.toFixed(0)} m`,
									iconSize: [30, 15],
								}),
								zIndexOffset: 99,
							}).addTo(leafletLayerGroup);

							// SHOW DIST. & BEARING (FOR DESKTOP)
							L.marker([midpointCoords[1], midpointCoords[0]], {
								draggable: true,
								icon: L.divIcon({
									className: "plot-polygon-vertex-dist-bearing-label",
									html: `${distance.toFixed(0)} m, ${degMinSec}`,
									iconSize: [30, 15],
								}),
								zIndexOffset: 99,
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
						}
					}

					// DATA OBJ. WITH THE NAV. INFO. FOR EACH PLOT
					// console.log({...FEAT_BOUNDARY_DATA});
				})(layerData, leafletModalMap, modalMapLayerGroup);
			});
		};

		const layerMouseIn = (map, fillLayer) => {
			map.on("mouseenter", `${fillLayer.id}`, function (e) {
				// Change the cursor to a pointer when the mouse is over the grid fill layer.
				map.getCanvas().style.cursor = "pointer";

				_ManipulateDOM.affectDOMElement(fillLayer.id, `selected`);
				_ManipulateDOM.scrollDOMElement(fillLayer.id);
			});
		};

		const layerMouseOut = (map, fillLayer) => {
			map.on("mouseleave", `${fillLayer.id}`, function () {
				map.getCanvas().style.cursor = "";

				_ManipulateDOM.affectDOMElement(fillLayer.id, `selected`);
			});
		};

		return {
			addInteraction: (map, fillLayer) => {
				layerClick(map, fillLayer);
				layerMouseIn(map, fillLayer);
				layerMouseOut(map, fillLayer);
			},
		};
	} catch (fillLayerHandlerErr) {
		console.error(`fillLayerHandlerErr: ${fillLayerHandlerErr.message}`);
	}
})(FEAT_DETAIL_MAP);

// RENDER GEOJSON ON DISPLAYED MAPS
export const _RenderEngine = (function (avgBaseMap, clusterFeatsMap) {
	try {
		// PAN BASE MAP TO FEAT. COLL.
		const basemapPanToCluster = async (featColl, { zoomLevel }) => {
			console.time("panBasemap");
			await LeafletMapsController.panFeatCenter(featColl, { map: avgBaseMap, zoomLevel });
			console.timeEnd("panBasemap");
		};

		const basemapFitCluster = async (featColl, { zoomlevel }) => {
			console.time("fitClusterBounds");
			LeafletMapsController.fitFeatBounds(featColl, { map: avgBaseMap });
			console.timeEnd("fitClusterBounds");
		};

		// PAN CLUSTER FEATS. MAP TO FEAT. COLL.
		const sidemapPanToCluster = async (featColl) => {
			console.time("panSidemap");
			const gjCenterCoords = turf.coordAll(turf.centerOfMass(featColl))[0];
			const gjBounds = turf.bbox(featColl);
			MapboxMapsController.panToCoords(clusterFeatsMap, gjCenterCoords, gjBounds, {
				zoom: 16,
				pitch: 0,
				bearing: 0,
				boundsPadding: 0,
			});
			console.timeEnd("panSidemap");
		};

		// pan to a single cluster feat.
		const panToClusterFeat = (geoJSONFeat, { zoomLevel }) => {
			try {
				console.info({ geoJSONFeat });

				const gjCenterCoords = turf.coordAll(turf.centerOfMass(geoJSONFeat))[0];
				const gjBounds = turf.bbox(geoJSONFeat);
				// FIXME > ZOOM VALUE OVER-RIDDEN BY BOUNDS
				MapboxMapsController.panToCoords(clusterFeatsMap, gjCenterCoords, gjBounds, {
					zoom: zoomLevel,
					pitch: 0,
					bearing: 0,
					boundsPadding: 0,
				});
			} catch (panClusterMapErr) {
				console.error(`panClusterMapErr: ${panClusterMapErr.message}`);
			}
		};

		return {
			// TODO
			// WIP > NOT IMPLEMENTED YET
			refreshClusterPlotsMap: (eventObj) => {
				var layerId = eventObj.target.id;
				if (layerId) {
					MapboxMapsController.switchLayer({ layerId, map: clusterFeatsMap });
				} else {
					// TODO
				}
			},

			renderFeatPopup: (props, centerLngLat) => {
				MapboxMapsController.openFeatPopup(clusterFeatsMap, props, centerLngLat);
			},

			panToClusterPlot: (geoJSONFeat, { zoomLevel }) => {
				panToClusterFeat(geoJSONFeat, { zoomLevel });
			},

			renderFeatColl: (
				gjFeatColl,
				{ useBuffer, bufferAmt, bufferUnits, lineColor, lineWeight, lineOpacity, lineDashArray } = {}
			) => {
				// render feats. on base map
				for (let idx = 0; idx < gjFeatColl.features.length; idx++) {
					const gjFeature = gjFeatColl.features[idx];
					LeafletMapsController.drawFeature(gjFeature, {
						useBuffer,
						bufferAmt,
						bufferUnits,
						lineColor,
						lineWeight,
						lineOpacity,
						lineDashArray,
					});
				}
			},

			getClusterPoly: async (featColl, { useBuffer, bufferAmt, bufferUnits } = {}) => {
				// TODO > WHAT IF THE FEAT. COLL. HAS FEATS. IN A MULTI. POLY ARRANGEMENT?
				(function analyzeFeatColl() {
					// TODO > DERIVE IDs FOR EACH MULTI. POLY.
				})();
				const featCollProps = featColl.properties;
				if (featCollProps) {
					// GET THE POLY
					const featCollPoly = _ProcessGeoJSON.getFeatCollPoly(featColl, {
						useBuffer,
						bufferAmt,
						bufferUnits,
					});
					// TRANSFER THE ORIGINAL PROPS.
					if (featCollPoly) {
						featCollPoly.properties = featCollProps;
					}
					return featCollPoly;
				}
			},

			renderClusterPoly: (featCollPoly, { bufferUnits } = {}) => {
				try {
					const polyProps = featCollPoly.properties;
					const polyGeometry = featCollPoly.geometry;
					const polyCenter = getFeatCenter(polyGeometry).latLng;

					if (featCollPoly && _TurfHelpers.getType(featCollPoly) === "Polygon") {
						let bufferedBboxPoly, finalBboxPoly;

						// INIT LG. FOR CLUSTER HTML MARKERS
						const clusterMetaLabelsLG = LLayerGroupController.initLayerGroup("cluster-metadata-labels", {
							visibilityRank: 2,
						});

						// DISPLAY CLUSTER DETAILS IN HTML MARKER
						LeafletMapsController.getClusterMetadataMarker(polyProps, polyCenter, "plot-metadata-label", {
							draggable: true,
						}).addTo(clusterMetaLabelsLG);

						// INIT. LAYER GROUP FOR CLUSTER POLY.
						const clusterPolyOutlineLG = LLayerGroupController.initLayerGroup(polyProps.clusterID, {
							visibilityRank: 5,
						});

						// RENDER CLUSTER SURVEY DETAILS
						LeafletMapsController.drawPolySurveyDetails(featCollPoly, clusterPolyOutlineLG, {
							bearingThresh: 45,
							distThresh: 30,
						});

						// RENDER THE POLY
						LeafletMapsController.drawFeature(featCollPoly, { lineColor: "#6ab04c", lineWeight: 5 });
						LeafletMapsController.drawFeature(featCollPoly, { lineColor: "#badc58", lineWeight: 1 });

						// GET BBOX
						let featCollBboxPoly = _ProcessGeoJSON.getBboxPoly(featCollPoly);
						if (featCollBboxPoly)
							bufferedBboxPoly = _ProcessGeoJSON.getPresentationPoly(featCollBboxPoly, {
								useBuffer: true,
								bufferAmt: 0.03,
								bufferUnits,
							});
						if (bufferedBboxPoly) finalBboxPoly = _ProcessGeoJSON.getBboxPoly(bufferedBboxPoly);

						// RENDER CLUSTER BBOX SURVEY DETAILS
						if (finalBboxPoly) {
							// INIT. LAYER GROUP FOR BBOX
							const bboxLayerGroup = LLayerGroupController.initLayerGroup(polyProps.clusterID, {
								visibilityRank: 4,
							});

							// ADD A MARKER TO PLOT CENTER
							L.marker(polyCenter).addTo(bboxLayerGroup);

							finalBboxPoly.properties = polyProps;

							// LeafletMapsController.drawFeature(finalBboxPoly, {featLayerGroup: bboxLayerGroup, lineColor: "cyan", lineWeight: 1, lineDashArray: "80, 20"});
							LeafletMapsController.drawFeature(finalBboxPoly, {
								featLayerGroup: bboxLayerGroup,
								lineColor: "cyan",
								lineWeight: 0.55,
							});

							LeafletMapsController.drawPolySurveyDetails(finalBboxPoly, bboxLayerGroup, {
								bearingThresh: 0,
								distThresh: 5,
							});
						}
					}
				} catch (renderClusterPolyErr) {
					console.error(`renderClusterPolyErr: ${renderClusterPolyErr.message}`);
				}
			},

			populateClustersOnBasemap: async (featureCollections, { useBuffer, bufferAmt, bufferUnits } = {}) => {
				const zoomLevel = LeafletMapsController.getMapZoom();

				// TODO
				switch (true) {
					case zoomLevel < 8.5:
						useBuffer = false;
						break;

					case zoomLevel < 12:
						break;

					default:
						break;
				}

				// const allFeatures = [];
				if (featureCollections.length > 0) {
					for (let idx = 0; idx < featureCollections.length; idx++) {
						const featColl = featureCollections[idx];
						const featCollMarkers = [];

						if (featColl.features.length > 0) {
							
							// IMPORTANT
							// 1. Generate a polygon for the cluster featColl.
							// TODO > ADJUST BUFFER BY CLUSTER SIZE
							let clusterPolygon;
							// clusterPolygon = await _RenderEngine.getClusterPoly(featColl, {
							// 	useBuffer: true,
							// 	bufferAmt: 0.01,
							// 	bufferUnits,
							// });

							// WIP
							clusterPolygon = featColl.properties.clusterPolygonFeature;

							// WIP
							if (clusterPolygon) {
								clusterPolygon["properties"] = featColl.properties;
								// console.log({ clusterPolygon })
							}

							// 2. Render the featColl. polygon for the cluster
							if (clusterPolygon) _RenderEngine.renderClusterPoly(clusterPolygon, { bufferUnits });

							// 3. Render cluster feats. & feats. markers
							for (let idy = 0; idy < featColl.features.length; idy++) {
								const feature = featColl.features[idy];
								// allFeatures.push(feature);
								// LeafletMapsController.renderFeaturesMarkers(allFeatures, {map: avgBaseMap});
								const featMarker = LeafletMapsController.initMarker(feature, {
									useBuffer,
									bufferAmt,
									bufferUnits,
								});
								featCollMarkers.push(featMarker);
							}
						}

						// 4. Render the marker clusters
						if (featCollMarkers.length > 0) {
							LeafletMapsController.saveMarkerGroup(featCollMarkers);
							await LeafletMapsController.renderMarkerCluster(featCollMarkers, { map: avgBaseMap });
						} else {
							console.warn(`...no cluster plots' markers to render`);
						}
					}
				}
			},

			renderClusterPlotsOnBasemap: async (
				gjFeatColl,
				{ useBuffer, bufferAmt, bufferUnits, lineColor, lineWeight, lineOpacity, lineDashArray } = {}
			) => {
				console.time("renderClusterPlots");

				// REMOVE
				// render cluster plots outlines on the cluster plots mini-map
				// MapboxMapsController.drawFeatFeatColl(gjFeatColl, {map: clusterFeatsMap});

				// render feats. on base map
				for (let idx = 0; idx < gjFeatColl.features.length; idx++) {
					const gjFeature = gjFeatColl.features[idx];
					LeafletMapsController.drawFeature(gjFeature, {
						useBuffer,
						bufferAmt,
						bufferUnits,
						lineColor,
						lineWeight,
						lineOpacity,
						lineDashArray,
					});
				}

				console.timeEnd("renderClusterPlots");
			},

			renderClusterPlotsOnSidemap: async (featColl, { useBuffer, bufferAmt, bufferUnits }) => {
				if (featColl.features) {
					for (let idx = 0; idx < featColl.features.length; idx++) {
						const clusterPlotFeat = featColl.features[idx];
						// await MapboxMapsController.drawGJPolygon(clusterFeatsMap, clusterPlotFeat, idx);
						const clusterPlotFeatPoly = getPresentationPoly(clusterPlotFeat, {
							useBuffer,
							bufferAmt,
							bufferUnits,
						});
						await MapboxMapsController.drawGJPolygon(clusterFeatsMap, clusterPlotFeatPoly, idx);
					}
				} else {
					console.log(`There are no features to render.`);
				}
			},

			renderSidemapClusterPlotsLabels: async (
				featColl,
				{ useBuffer = false, bufferUnits, bufferAmt, areaUnits }
			) => {
				if (featColl.features) {
					for (let idx = 0; idx < featColl.features.length; idx++) {
						let clusterPlotFeat = featColl.features[idx];
						// clusterPlotFeat = getPresentationPoly(clusterPlotFeat, {useBuffer, bufferAmt, bufferUnits});
						// await MapboxMapsController.drawGJPolygonLabel(clusterFeatsMap, clusterPlotFeat, polyIdx, {areaUnits});
						await MapboxMapsController.drawGJPolygonLabel(clusterFeatsMap, clusterPlotFeat, idx, {
							areaUnits,
						});
					}
				} else {
					console.log(`There are no features for which to render labels.`);
				}
			},

			renderClusterOnMaps: (
				featColl,
				{ baseMapZoomLvl = 0, useBuffer = false, bufferUnits, bufferAmt, areaUnits }
			) => {
				console.log({ featColl });

				// fire custom MAPBOX fn.
				clusterFeatsMap.fire("closeAllPopups");

				(async () => {
					await sidemapPanToCluster(featColl);

					// await _delayExecution(9000);

					const panningBasemap = () => {
						basemapPanToCluster(featColl, { zoomLevel: baseMapZoomLvl });
					};

					const fittingBasemap = () => {
						basemapFitCluster(featColl, { zoomLevel: baseMapZoomLvl });
					};

					// await _MONITOR_EXECUTION({ logger: console.log }).execute(() =>
					// 	basemapPanToCluster(featColl, { zoomLevel: baseMapZoomLvl })
					// );
					await _MONITOR_EXECUTION({ logger: console.log }).execute(panningBasemap);

					// await _delayExecution(10000);

					// await _MONITOR_EXECUTION({ logger: console.log }).execute(() =>
					// 	basemapFitCluster(featColl, { zoomLevel: baseMapZoomLvl })
					// );
					await _MONITOR_EXECUTION({ logger: console.log }).execute(fittingBasemap);

					// await _delayExecution(12000);

					await _RenderEngine.renderClusterPlotsOnBasemap(featColl, {
						useBuffer,
						bufferAmt,
						bufferUnits,
						lineColor: "#feca57",
						lineWeight: 1.5,
						lineDashArray: "3",
					});
				})();

				(async () => {
					await _RenderEngine.renderClusterPlotsOnSidemap(featColl, {
						useBuffer,
						bufferAmt,
						bufferUnits,
					});
					await _RenderEngine.renderSidemapClusterPlotsLabels(featColl, {
						useBuffer,
						bufferUnits,
						bufferAmt,
						areaUnits,
					});
				})();

				// REMOVE > DEPRC > ADDED VIA "zoomend"
				// GET LAYER GROUP(S)
				// const clusterLayerGroupObjs = [];
				// const layerGroupObjs = LLayerGroupController.returnLayerGroupObjs({layerGroupId: featColl.properties.clusterID, visibilityRank: 4});
				const layerGroupObjs = LLayerGroupController.returnLayerGroupObjs({
					layerGroupId: featColl.properties.clusterID,
				});
				console.log({ layerGroupObjs });
				// for (let visRank = 0; visRank < 6; visRank++) {
				//    clusterLayerGroupObjs.push(LLayerGroupController.returnLayerGroupObjs({layerGroupId: featColl.properties.clusterID, visibilityRank: visRank}));
				// };

				// ADD TO MAP
				layerGroupObjs.forEach((lg) => {
					if (lg && lg.layer_group) lg.layer_group.addTo(avgBaseMap);
				});
				// clusterLayerGroupObjs.forEach(lg => {if (lg) lg.layer_group.addTo(avgBaseMap)});
			},
		};
	} catch (renderMapsErr) {
		console.error(`renderMapsErr: ${renderMapsErr.message}`);
	}
})(AVG_BASE_MAP, CLUSTER_PLOTS_MAP);

// TODO
function renderFeatVertices(props) {}

// SANDBOX >
// AFFECT A LEAFLET MARKER FROM A SIDEBAR DIV
const AffectLeafletMarker = (() => {
	const clusterFeatsListCont = document.getElementById("cluster_feats_listing_body");
	var link = L.DomUtil.create("a", "link", clusterFeatsListCont);

	link.textContent = "Cluster Plot Owner";
	link.href = "#";

	var marker = new L.Marker([36.8370066107919, 10.059871561852127]).bindPopup("Popup").addTo(AVG_BASE_MAP);

	link.marker = marker;
	marker.link = link;

	L.DomEvent.addListener(link, "mouseover", function (e) {
		e.target.marker.openPopup();
	});

	L.DomEvent.addListener(link, "mouseout", function (e) {
		e.target.marker.closePopup();
	});

	marker.on("mouseover", function (e) {
		e.target.link.style.backgroundColor = "pink";
	});

	marker.on("mouseout", function (e) {
		e.target.link.style.backgroundColor = "white";
	});
})();
