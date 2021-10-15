`use strict`


export const APP_STATE = (function() {

   // GLOBAL VARS.
   const CONFIG_DEFAULTS = Object.freeze({
      
      // RENDERED_PLOT_BUFFER: -0.005,
      RENDERED_PLOT_BUFFER: -0.0065,
      
      // TODO > MOVE THESE TO SETTINGS INPUTS
      PLOTS_MAP: {
         // ZOOM: 15,
         ZOOM: 12,
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

      GEO_CLUSTER_API_HOST_LOCAL: `http://127.0.0.1:9090`,
      GEO_CLUSTER_API_HOST_HEROKU: `https://geoclusters.herokuapp.com`,
      GEO_CLUSTER_API_RESOURCE_PATHS: ["v2/legacy-agcs", "v1/parcelized-agcs", "v1/agcs"],
      // REMOVE > DEPRC.
      // LEGACY_CLUSTER_QUERY_STR: `?fields=
      //                               properties.geo_cluster_details,
      //                               properties.geo_cluster_governance_structure,
      //                               properties.legacy_agc_name,
      //                               features.geometry,
      //                               features.properties.plot_id,
      //                               features.properties.plot_owner_allocation_size,
      //                               features.properties.plot_owner_first_name,
      //                               features.properties.plot_owner_last_name,
      //                               features.properties.plot_owner_gender`,
                                    
      CLUSTER_RESULT_DATA_ATTR_NAME: `geoclusterdatastream`,

      ADMIN_BOUNDS_GEOJSON_API_HOST: `http://127.0.0.1:1010`,
      // ADMIN_BOUNDS_GEOJSON_API_HOST: `https://avgmap.herokuapp.com`,
      // ADMIN_BOUNDS_GEOJSON_API_HOST: `https://avg-dashboard.herokuapp.com`,

      // ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS: [`v1/admin-bounds/nga-admin-bounds`],
      // ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS: [`v1/admin-bounds/nga-geo-pol-regions`, `v1/admin-bounds/nga-admin-bounds-lvl1`, `v1/admin-bounds/nga-admin-bounds-lvl2`, `v1/admin-bounds/nga-admin-bounds-lvl3`],
      ADMIN_BOUNDS_GEOJSON_API_RESOURCE_PATHS: [`v1/admin-bounds/nga-geo-pol-regions`, `v1/admin-bounds/nga-admin-bounds-lvl1`, `v1/admin-bounds/nga-admin-bounds-lvl2`],
   });

   // keep track of sidebar settings
   let defaultSettings = {};
   let currentSettings = {};

   // instantiate an object that holds a db. collection 
   const DATA_STORE = {
      name: ``,
      data: {},
   };
   
   // hold all the collections & their data
   const DB_COLLECTIONS = [];
   
   // 
   
   // keep track of the GJ. that was just rendered
   const renderedGeoJSONArray = [];
   let currRenderedGeoJSON;
   
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
         const newCollection = Object.create(DATA_STORE);
         newCollection.name = collectionName;
         newCollection.data = json;
         DB_COLLECTIONS.push(newCollection);
      },

      returnDBCollections: function() {
         return DB_COLLECTIONS;
      },

      returnDBCollection: function(collectionName) {
         const dbCollection = DB_COLLECTIONS.find(collection => collection.name === collectionName);
         console.log({dbCollection})
         return dbCollection;
      },

      saveRenderedGeojson: function(geoJSON) {
         // FIXME > TOO WEAK FOR CHECKING VALID GJ.
         // TODO > REPORT BACK SAVED SUCCEED OR NO
         if (geoJSON) { 
            renderedGeoJSONArray.push(geoJSON);
            currRenderedGeoJSON = geoJSON;
            console.log({currRenderedGeoJSON});
         }
      },
      retreiveRenderedGJArray: function() {
         return renderedGeoJSONArray;
      },
      retreiveLastRenderedGJ: function() {
         let lastRenderedGeoJSON;
         if (renderedGeoJSONArray.length === 1) {
            console.log({lastRenderedGeoJSON});
            return lastRenderedGeoJSON = renderedGeoJSONArray.length[0];
         };
         lastGeoJSON = renderedGeoJSONArray[renderedGeoJSONArray.length-1];
         return lastGeoJSON ? lastGeoJSON : null;
      },
      getRenderedGeoJSON: () => {
         return currRenderedGeoJSON;
      }
   };
})();