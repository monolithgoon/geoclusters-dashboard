`use strict`
const turf = require("@turf/turf");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const CACHED_FILE_NAMES = require("../constants/cached-file-names.js");
const NGA_GEO_POL_REGIONS = require("../constants/nga-geo-pol-regions.js");
const catchAsync = require('../utils/catch-async.js');
const chalk = require("../utils/chalk-messages.js");
const { _formatNumByThousand } = require("../utils/helpers.js");


const parseString = async str => {
   try {
      return JSON.parse(str);
   } catch (parseStringErr) {
      console.error(`parseStringErr: ${parseStringErr.message}`);
   };
};


const ProcessFiles = ((root) => {

   const COMBINED_FILES_ARR = [];

   // PROMISE VERSION OF fs.readdir
   fs.readdirAsync = dirname => {
      return new Promise((resolve, reject) => {
         fs.readdir(dirname, (readdirErr, fileNames) => {
            if (readdirErr) reject(readdirErr)
            else resolve (fileNames);
         });
      });
   };

   // PROMISE VERSION OF fs.readFile();
   fs.readFileAsync = (fileName, encoding) => {
      return new Promise((resolve, reject) => {
         fs.readFile(fileName, encoding, (readFileErr, fileBuffer) => {
            if (readFileErr) reject(readFileErr)
            else resolve(fileBuffer);
         });
      });
   };

   // UTILITY FN. FOR fs.readFileAsync ... RETURNS A PROMISE
   const getFileData = (fileName, filesDirectory) => {
      return fs.readFileAsync(path.resolve(`${__approotdir}/${filesDirectory}/${fileName}`), `utf8`);
   };

   // FN. TO GET ONLY GEOJSON FILES
   const isGeoJSONFile = (fileName) => {
      return path.extname(fileName) === '.geojson';
   };


   return {
      
      initBaseFiles: async () => {
         try {            
            // START BLANK GEOJSON FILES THAT (WILL) EVENTUALLY HOLD THE MERGED DIR. FILES
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl1-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl2-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl3-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
         } catch (fielWriteErr) {
            throw new Error(`fielWriteErr: ${fielWriteErr.message}`);
         };   
      },

      // READ ALL THE GEOJSON FILES IN A DIR
      // FILTER OUT THOSE THAT NEED TO BE PROCESSED;
      // USE Promise.all to TIME WHEN ALL ASYNC readFiles HAS COMPLETED
      scanDirectory: async filesDirectory => {

         console.log(chalk.working(`READING GEOJSON FILE(S) DATA in ${filesDirectory}`));

         return fs.readdirAsync(path.resolve(`${root}/${filesDirectory}`))

            .then(gjFileNames => {
               gjFileNames = gjFileNames.filter(isGeoJSONFile);
               gjFileNames.forEach(gjFileName => console.log({gjFileName}));
               // console.log(chalk.consoleB(JSON.stringify({gjFileNames})));
               return Promise.all(gjFileNames.map(gjFileName => {
                  return getFileData(gjFileName, filesDirectory);
               }))
            })

            .then(gjFiles => {

               gjFiles.forEach(gjFile => {
                  // console.log({gjFile});
                  console.log(chalk.working(`[ parsing file buffer ]`))
                  const geojson_file = JSON.parse(gjFile);
                  COMBINED_FILES_ARR.push(geojson_file);
               });
               
               console.log(chalk.success(`Finished combining all the files`));
               
               return COMBINED_FILES_ARR;
            })

            .catch(err => console.error(err));
      },

      returnDirectoryFiles: async filesDirectory => {
         const ngaAdmiinBoundsLvl3Files = await ProcessFiles.scanDirectory(filesDirectory);
         return ngaAdmiinBoundsLvl3Files;
      },

      getCombinedDirFiles: async filesDirectory => {
         // TODO
      },

      retreiveFilesData: async fileNamesArr => {
         for (let fileName of fileNamesArr) {
            let fileData = await fsPromises.readFile(path.resolve(`${__approotdir}/localdata/${fileName}`), `utf8`, (readFileErr, fileBuffer) => {
               if (readFileErr) throw readFileErr;
               console.log(chalk.result(`FILE READ OK - ${fileName}`));
               resolve(fileBuffer);
            });
            return fileData;
         };
      },      

      /*
         This fn. creates a GeoJSON Feature Collection of 6 geographical and political regions in Nigeria. 
         Each Feature represents a geo. pol. region. It does this by combining the GeoJSON of each state of that pol. region

         The function performs the following operations:
         1. Retrieves the contents of a GeoJSON file `nga-state-admin-bounds.geojson` using the `retreiveFilesData` method from the `ProcessFiles` module.
         2. Parses the retrieved data into a GeoJSON Feature Collection using the `parseString` method.
         3. Iterates over the properties of the `NGA_GEO_POL_REGIONS` object and performs the following operations for each region:
            a. Filters the features of the `ngaAdmiinBoundsLvl1FeatColl` Feature Collection to find the ones that correspond to the states in the region.
            b. Unites the found features into a single Feature using the `turf.union` method.
            c. Adds properties to the resulting Feature indicating the region name and the names of the states in the region.
            d. Adds the Feature to the `geoPolRegionsGJ` Feature Collection.
         4. Writes the `geoPolRegionsGJ` Feature Collection to a file `nga-geo-pol-regions.geojson`. The path to the file is constructed using the `path.resolve` method and the current working directory.
      */
      getNGAGeoPolRegions: async () => {

         // Get a GeoJSON Feat. Collection for all the states in Nigeria
         const ngaAdmiinBoundsLvl1FeatColl = await parseString(await ProcessFiles.retreiveFilesData([`nga-state-admin-bounds.geojson`]));
         
         const geoPolRegionsGJ = {
            "type": "FeatureCollection",                                                                                         
            "features": [],
         };    
                  
         // Object.keys(geoPolRegions).forEach((key, idx) => {
         Object.keys(NGA_GEO_POL_REGIONS).forEach((key, idx) => {

            // Initialize an array to store the GeoJSON Feature corresponding to each state in the region
            const statesGeoJSONFeats = [];

            // Get the regions's states array
            const regionStates = NGA_GEO_POL_REGIONS[key];

            regionStates.forEach(state => {

               // Search for the GeoJSON Feature corresponding to the state in the ngaAdmiinBoundsLvl1FeatColl Feature Collection
               const matchingStateFeat = ngaAdmiinBoundsLvl1FeatColl.features.filter(adminBoundFeat => adminBoundFeat.properties.admin1Name === state);

               // Combine each matched state's GeoJSON into an array
               statesGeoJSONFeats.push(matchingStateFeat[0]);
            });

            // Unite the Features in the statesGeoJSONFeats array into a single Feature
            const regionGeoJSON = turf.union(...statesGeoJSONFeats);
            
            // Add properties to the regionGJ Feature indicating the region name and the names of the states in the region
            regionGeoJSON.properties = {
               "regionName": key,
               "admin1Names": NGA_GEO_POL_REGIONS[key],
            };
            
            console.log({regionGeoJSON});

            // Add the regionGJ Feature to the geoPolRegionsGJ Feature Collection
            geoPolRegionsGJ.features.push(regionGeoJSON)
         });
         
         // save to file
         fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-geo-pol-regions.geojson`), JSON.stringify(geoPolRegionsGJ), () => console.log(chalk.warningBright(`nga-geo-pol-regions.geojson file created`)));
      },

   };
})(__approotdir);


exports.getAdminBoundsLvl1GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl1Files = await ProcessFiles.returnDirectoryFiles(`/localdata/nga-state-admin-bounds`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl1Files,
   });
}), `getAdminBoundsLvl1Err`);


exports.getAdminBoundsLvl2GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl2Files = await ProcessFiles.returnDirectoryFiles(`/localdata/nga-lga-admin-bounds`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl2Files,
   });
}), `getAdminBoundsLvl2Err`);


exports.getAdminBoundsLvl3GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl3Files = await ProcessFiles.returnDirectoryFiles(`/localdata/nga-ward-admin-bounds-openAFRICA`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl3Files,
   });
}), `getAdminBoundsLvl3Err`);


exports.getGeoPolRegionsGeoJSON = catchAsync((async(req, res, next) => {
   const ngaGeoPolRegionsGJ = await parseString(await ProcessFiles.retreiveFilesData([`nga-geo-pol-regions.geojson`]));
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaGeoPolRegionsGJ,
   });
}), `getGeoPolRegionsErr`);


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


/** 
 * This function retreives geoclusters that have been downloaded from the database, 
 * prorcessed, convered to .json, and saved to disk by `server/workers/cache-api-data.js`
 * The files are cached in `server/localdata`
 * The exact file names correspond to the names of the collections in the database
 */
function retreiveClustersData(cachedFileNames) {

   const GEOCLUSTERS_DATA = [];

   // Loop through the list of cached files and read the data, parse it and push it to the GEOCLUSTERS_DATA array
   for (const fileName of cachedFileNames) {
      let geoClusterJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/${fileName}`), {encoding: 'utf8'});
      let geoClusterObj = JSON.parse(geoClusterJSON);
      GEOCLUSTERS_DATA.push(geoClusterObj);
   };
      
   // Combine the JSON for all the returned clusters into a single object
   const returnedClusters = combineObjArrays(...GEOCLUSTERS_DATA);

   // Create a summary of the returned clusters
   const clustersSummary = {
      totalNumClusters: _formatNumByThousand(returnedClusters.length),
      totalNumFeatures: (()=>{
         let featsCount = 0;
         const featsCounts = [];
         for (let idx = 0; idx < returnedClusters.length; idx++) {
            const cluster = returnedClusters[idx];
            featsCounts.push(cluster.features.length);
         }
         featsCount = _formatNumByThousand(featsCounts.reduce((sum, featCount) => sum + featCount));
         return featsCount;
      })(),
   };
         
   // Return the combined data and the clusters summary
   return {returnedClusters, clustersSummary};
};


/**
 * @function getClustersSummary
 * @description A function that retrieves geocluster summary data from the server's local cache and
 * stores it in the application's locals object.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If an error occurs while retrieving the cluster summary data.
 */
exports.getClustersSummary = catchAsync(async (req, res, next) => {
   
   // Retrieve the geocluster data and clusters summary from this server's localdata cache
   const { clustersSummary } = retreiveClustersData(CACHED_FILE_NAMES);
 
   // Store the clusters summary in the application's locals object
   req.app.locals.clustersSummary = clustersSummary;
 
   // Call the next middleware function
   next();
 }, `getClustersSummaryErr`);
 


/**
 * @function getCachedGeoClustersData
 * @description A function that retrieves geocluster data and summary information from the server's local cache
 * and stores it in the application's locals object.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If an error occurs while retrieving the geocluster data and summary information.
 */
exports.getCachedGeoClustersData = catchAsync(async (req, res, next) => {

   // Retrieve the geocluster data and clusters summary from this server's localdata cache
   const { returnedClusters, clustersSummary } = retreiveClustersData(CACHED_FILE_NAMES);
 
   // Store the geocluster data and clusters summary in the application's locals object
   req.app.locals.returnedClusters = returnedClusters;
   req.app.locals.clustersSummary = clustersSummary;
 
   // Call the next middleware function
   next();
 }, `getClustersDataErr`);
 