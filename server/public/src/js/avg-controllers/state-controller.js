`use strict`

export const APP_STATE = (function() {

   // keep track of sidebar settings
   let defaultSettings = {};
   let currentSettings = {};

   
   /**
      This code instantiates an object literal named `DATA_STORE` with two properties: 
      a string property `name` to represent the name of the database collection, initialized as an empty string, 
      and an object property `data` to hold the data for the collection, initialized as an empty object. 
      The purpose of `DATA_STORE` is to act as a placeholder for a "geoclusters" collection from the backend.
   */
   const DATA_STORE = {
      name: ``,
      data: {},
   };
   
   // hold all the database collections & their data
   let CACHED_DB_COLLECTIONS = [];
      
   // keep track of the GJ. that was just rendered
   const renderedGeoJSONArray = [];
   let currRenderedGeoJSON;
   
   return {

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


      /**
         This code defines a function named `cacheDBCollection` that takes two arguments: 
         `collectionName` and `data`. The function creates a new object, `newCollection`, 
         using `DATA_STORE` as its prototype. The `name` property of `newCollection` is 
         set to `collectionName` and the `data` property is set to `data`. This function 
         is likely used to cache a database collection by creating a new object with the 
         given collection name and data, and setting it as the prototype of `DATA_STORE`.
      */
      cacheDBCollection: function(collectionName, data) {
         const newCollection = Object.create(DATA_STORE);
         newCollection.name = collectionName;
         newCollection.data = data;
         
         // REMOVE > MOVE TO findUpdateCachedDBCollection() FN. BELOW
         CACHED_DB_COLLECTIONS = CACHED_DB_COLLECTIONS.filter(collection => collection.name !== collectionName);

         CACHED_DB_COLLECTIONS.push(newCollection);
         
         console.log({CACHED_DB_COLLECTIONS})
      },

      returnCachedDBCollections: function() {
         return CACHED_DB_COLLECTIONS;
      },

      returnCachedDBCollection: function(collectionName) {
         const cachedDBCollection = CACHED_DB_COLLECTIONS.find(collection => collection.name === collectionName);
         // console.log({cachedDBCollection})
         return cachedDBCollection;
      },

      // TODO
      findUpdateCachedDBCollection: (collectionName, data) => {

         // 0. Make sure data is not null
         
         // 1. check if collection with same name already exists in cache
         
         // 2. check if new data is better? than old data

         // 3. replace the data in cache
      },

      deleteCachedDBCollection: (collectionName) => {
         CACHED_DB_COLLECTIONS = CACHED_DB_COLLECTIONS.filter(collection => collection.name !== collectionName);
      },

      saveRenderedGeojson: function(geoJSON) {
         // FIXME > TOO WEAK FOR CHECKING VALID GJ.
         // TODO > REPORT BACK SAVED SUCCEED OR NO
         if (geoJSON) { 
            renderedGeoJSONArray.push(geoJSON);
            currRenderedGeoJSON = geoJSON;
            console.log({currRenderedGeoJSON});
         };
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
      },
   };
})();