`use strict`
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catch-async.js');


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


exports.getClustersData = catchAsync(async(req, res, next) => {
   
   const returnedClusters = retreiveClustersData().returnedClusters;
      
   req.app.locals.returnedClusters = returnedClusters;

   next();
}, `getClustersDataErr`);


exports.getClustersSummary = catchAsync(async(req, res, next) => {
   const clustersSummary = retreiveClustersData().clustersSummary;
   req.app.locals.clustersSummary = clustersSummary;
   next();
}, `getClustersSummaryErr`);