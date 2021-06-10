`use strict`
export const APP_STATE = (function() {

   // GLOBAL VARS.
   const CONFIG_DEFAULTS = Object.freeze({
      RENDERED_PLOT_BUFFER: -0.005,
      
      // FIXME > MOVE THESE TO SETTINGS INPUTS
      PLOTS_MAP: {
         ZOOM: 15,
         PITCH: 50,
         BEARING: 10,
         STROKE_THICKNESS: 2,
         FILL_OPACITY: 0.1,
         USE_BUFFER: false,
         PLOT_BUFFER_AMT: -0.005,
      },

      LEAFLET_ADMIN_LEVEL_1_ZOOM: 9,
      LEAFLET_ADMIN_LEVEL_2_ZOOM: 12,
      LEAFLET_ADMIN_LEVEL_3_ZOOM: 16,
      LEAFLET_MAX_ZOOM: 18,
      API_HOST_LOCAL: `http://127.0.0.1:9090`,
      API_HOST_HEROKU: `https://geoclusters.herokuapp.com`,
      API_RESOURCE_PATHS: ["v2/legacy-agcs", "v1/parcelized-agcs", "v1/agcs"],
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
      CLUSTER_CARD_DATA_ATTR_NAME: `geoclusterdatastream`,
      CLUSTER_FEAT_CARD_DATA_ATTR_NAME: `clusterfeatdatastream`,

   });

   // keep track of sidebar settings
   let defaultSettings = {};
   let currentSettings = {};

   // instantiate an object that holds a db. collection 
   const DB_COLLECTION = {
      name: ``,
      data: {},
   };
   
   // hold all the collections & their data
   const DB_COLLECTIONS = [];
   
   // keep track of the GJ. that was just rendered
   const renderedGeojson = [];
   
   return {

      CONFIG_DEFAULTS,

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
         const dbCollection = DB_COLLECTIONS.find(collection => collection.name === collectionName);
         console.log(dbCollection)
         return dbCollection;
      },

      saveRenderedGeojson: function(geojson) {
         // FIXME > TOO WEAK FOR CHECKING VALID GJ.
         // TODO> REPORT BACK SAVED SUCCEED OR NO
         if (geojson) { renderedGeojson.push(geojson) }
      },
      retreiveRenderedGJ: function() {
         return renderedGeojson;
      },
      retreiveLastRenderedGJ: function() {
         const lastGeojson = renderedGeojson[renderedGeojson.length-1];
         return lastGeojson ? lastGeojson : null;
      },
   };
})();