`use strict`
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catch-async.js');


function combineObjArrays(...baseArrays) {
   const newObjArray = [];
   const arrays = [...baseArrays];
   arrays.forEach(array => {
      array.forEach(el => {
         newObjArray.push(el);
      });
   });
   // for (const baseArray in baseArrays) {
   //    for (const obj in baseArray) {
   //       newObjArray.push(obj);
   //    };
   // };
   return newObjArray;
};


exports.getClustersData = catchAsync(async(req, res, next) => {
   
   // const parcelizedClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-clusters.json`), {encoding: 'utf8'})
   // const legacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/legacy-clusters.json`), {encoding: 'utf8'})

   const parcelizedClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-agcs.json`), {encoding: 'utf8'})
   const legacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/legacy-agcs.json`), {encoding: 'utf8'})

   const parcelizedClusters = JSON.parse(parcelizedClustersJSON);
   const legacyClusters = JSON.parse(legacyClustersJSON);
      
   const returnedClusters = combineObjArrays(parcelizedClusters, legacyClusters);
      
   req.app.locals.returnedClusters = returnedClusters;

   next();
});