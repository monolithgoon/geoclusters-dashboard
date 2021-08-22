`use strict`
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const catchAsync = require('../utils/catch-async.js');


const getFileData = async fileNamesArr => {
   for (let fileName of fileNamesArr) {
      let fileData = await fsPromises.readFile(path.resolve(`${__approotdir}/localdata/${fileName}`), `utf8`, (readFileErr, fileBuffer) => {
         if (readFileErr) throw readFileErr;
         resolve(fileBuffer);
         console.log(`FILE READ OK - ${fileName}`);
      });
      return fileData;
   };
};


const parseString = async str => {
   return JSON.parse(str);
};


exports.getAdminBoundsGeoJSON = catchAsync((async(req, res, next) => {

   console.log(`READING GEOJSON FILE(S) DATA`);
   
   // getFileData([`nga-state-admin-bounds.geojson`, `nga-state-admin-bounds.geojson`, `nga-ward-bounds-openAFRICA.geojson`]);

   const ngaAdmiinBoundsLvl1 = await parseString(await getFileData([`nga-state-admin-bounds.geojson`]));
   // const ngaAdmiinBoundsLvl1 = {};
   const ngaAdmiinBoundsLvl2 = await parseString(await getFileData([`nga-lga-admin-bounds.geojson`]));
   // const ngaAdmiinBoundsLvl2 = {};
   // const ngaAdmiinBoundsLvl3 = await getFileData([`nga-ward-bounds-openAFRICA.geojson`]);
   const ngaAdmiinBoundsLvl3 = {};

   let ngaAdminBounds;
   if (ngaAdmiinBoundsLvl1 && ngaAdmiinBoundsLvl2 && ngaAdmiinBoundsLvl3) {
      ngaAdminBounds = {
         ngaAdmiinBoundsLvl1,
         ngaAdmiinBoundsLvl2,
         ngaAdmiinBoundsLvl3,
      };
   };

   if (ngaAdminBounds) req.app.locals.ngaAdminBounds = ngaAdminBounds;
   
   next();

}), `getAdminBoundsErr`)


function combineObjArrays(...baseArrays) {
   const newObjArray = [];
   const arrays = [...baseArrays];
   arrays.forEach(array => {
      if (array) {
         array.forEach(el => {
            newObjArray.push(el);
         });
      };
   });
   // for (const baseArray in baseArrays) {
   //    for (const obj in baseArray) {
   //       newObjArray.push(obj);
   //    };
   // };
   return newObjArray;
};


function retreiveClustersData() {

   const parcelizedClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-agcs.json`), {encoding: 'utf8'});
   const legacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/legacy-agcs.json`), {encoding: 'utf8'});

   let parcelizedClusters, legacyClusters;
   
   if (parcelizedClustersJSON) {
      parcelizedClusters = JSON.parse(parcelizedClustersJSON);
   };

   if (legacyClustersJSON) {
      legacyClusters = JSON.parse(legacyClustersJSON);
   };
      
   const returnedClusters = combineObjArrays(parcelizedClusters, legacyClusters);

   const clustersSummary = {
      totalNumClusters: returnedClusters.length,
      totalNumFeatures: (()=>{
         const featsCounts = [];
         for (let idx = 0; idx < returnedClusters.length; idx++) {
            const cluster = returnedClusters[idx];
            featsCounts.push(cluster.features.length);
         }
         return featsCount = featsCounts.reduce((sum, featCount) => sum + featCount);
      })(),
   };
         
   return {returnedClusters, clustersSummary};
};


exports.getClustersSummary = catchAsync(async(req, res, next) => {
   const clustersSummary = retreiveClustersData().clustersSummary;
   req.app.locals.clustersSummary = clustersSummary;
   next();
}, `getClustersSummaryErr`);


exports.getClustersData = catchAsync(async(req, res, next) => {
   
   const returnedClusters = retreiveClustersData().returnedClusters;
      
   req.app.locals.returnedClusters = returnedClusters;

   next();
   
}, `getClustersDataErr`);