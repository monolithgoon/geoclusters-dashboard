`use strict`
const fs = require('fs');
const path = require('path');
const catchAsync = require('../utils/catch-async.js');


exports.getClustersData = catchAsync(async(req, res, next) => {
   
   const legacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/legacy-clusters.json`), {encoding: 'utf8'})
   const parcelizedClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-clusters.json`), {encoding: 'utf8'})
   const legacyClusters = JSON.parse(legacyClustersJSON);
   const parcelizedClusters = JSON.parse(parcelizedClustersJSON);

   const geoClusters = Object.assign(
      {},
      legacyClusters.legacy_agcs,
      parcelizedClusters.data.parcelized_agcs,
   );

   req.app.locals.parcelizedClusters = parcelizedClusters.data.parcelized_agcs;
   req.app.locals.legacyClusters = legacyClusters.legacy_agcs;
   req.app.locals.geoClusters = geoClusters;

   next();
});