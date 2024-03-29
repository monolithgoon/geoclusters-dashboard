`use strict`;
const cacheAPIData = require(`../workers/cache-geoclusters-api-data`);
const catchAsync = require("../middlewares/catch-async-server-error.js");

exports.cacheNewData = catchAsync((async(req, res, next) => {
   await cacheAPIData();
   res.status(200).json({
      status: `success`,
      message: `NEW GEO-CLUSTER DOWNLOADED & CACHED`,
      requested_at: req.requestTime,
   });
}), `cacheNewDataErr`);