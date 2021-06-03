`use strict`
export const APP_STATE = (function() {

   // GLOBAL VARS.
   const CONFIG_DEFAULTS = Object.freeze({
      RENDERED_PLOT_BUFFER: -0.001,
      PLOTS_MAP_PITCH: 50,
      PLOTS_MAP_BEARING: 10,
      PLOTS_MAP_ZOOM: 16,
      LEAFLET_ADMIN_LEVEL_1_ZOOM: 9,
      LEAFLET_ADMIN_LEVEL_2_ZOOM: 12,
      LEAFLET_ADMIN_LEVEL_3_ZOOM: 16,
      LEAFLET_MAX_ZOOM: 18,
      API_HOST_LOCAL: `http://127.0.0.1:9090`,
      API_HOST_HEROKU: `https://geoclusters.herokuapp.com`,
      API_COLLECTION_PATHS: ["v2/legacy-agcs", "v1/parcelized-agcs", "v1/agcs"],
      LEGACY_CLUSTER_QUERY_STR: `?fields=
                                    properties.geo_cluster_details,
                                    properties.geo_cluster_governance_structure,
                                    properties.geo_cluster_name,
                                    features.geometry,
                                    features.properties.plot_id,
                                    features.properties.plot_owner_allocation_size,
                                    features.properties.plot_owner_first_name,
                                    features.properties.plot_owner_last_name,
                                    features.properties.plot_owner_gender`,
   });

   // instantiate an object that holds a db. collection 
   const DB_COLLECTION = {
      name: ``,
      data: {},
   }
   
   // hold all the collections & their data
   const DB_COLLECTIONS = [];

   let defaultSettings = {};
   let currentSettings = {};
   const renderedGeojson = [];
   
   // REMOVE >
   const defaultStates = {
      "areaUnitsRadio": null,
   };

   return {

      CONFIG_DEFAULTS,

      saveDBCollection: function(collectionName, json) {
         const newCollection = Object.create(DB_COLLECTION);
         newCollection.name = collectionName;
         newCollection.data = json;
         DB_COLLECTIONS.push(newCollection);
      },

      returnDBCollections: function() {
         return DB_COLLECTIONS;
      },

      returnDBCollection: function(collectionName) {
         return DB_COLLECTIONS(collectionName);
      },

      // REMOVE
      // saveGeoClustersCollection: function(json) {
      //    geoClustersCollection = json;
      // },

      // REMOVE
      // returnGeoClustersCollection: function() {
      //    return geoClustersCollection;
      // },

      saveDefaultSettings: function(settingsObject) {
         defaultSettings = settingsObject;
      },
      retreiveDefaultSettings: function() {
         return defaultSettings;
      },
      saveCurrentSettings: function(settingsObject) {
         currentSettings = settingsObject;
      },
      retreiveCurrentSettings: function() {
         return currentSettings;
      },

      saveRenderedGeojson: function(geojson) {
         // FIXME > TOO WEAK FOR CHECKING VALID GJ.
         if (geojson) { renderedGeojson.push(geojson) }
      },
      retreiveRenderedGJ: function() {
         return renderedGeojson;
      },
      retreiveLastRenderedGJ: function() {
         const lastGeojson = renderedGeojson[renderedGeojson.length-1];
         return lastGeojson ? lastGeojson : null;
      },

      // REMOVE >
      saveDefaultAreaUnitRadio: (radioElement) => {
         defaultStates.areaUnitsRadio = radioElement;
      },
      retreiveDefaultAreaUnitRadio: () => {
         return defaultStates.areaUnitsRadio;
      },
   };
})();