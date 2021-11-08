`use strict`
const turf = require("@turf/turf");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const catchAsync = require('../utils/catch-async.js');
const chalk = require("../utils/chalk-messages.js");


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
               // console.log(chalk.console(JSON.stringify({gjFileNames})));
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

      getNGAGeoPolRegions: async () => {

         const ngaAdmiinBoundsLvl1FeatColl = await parseString(await ProcessFiles.retreiveFilesData([`nga-state-admin-bounds.geojson`]));
         
         const geoPolRegionsGJ = {
            "type": "FeatureCollection",                                                                                         
            "features": [],
         };    
         
         const geoPolRegions = {
            northCentral: ["Benue", "Federal Capital Territory", "Kogi", "Kwara", "Nasarawa", "Niger", "Plateau"],
            northEast: ["Adamawa", "Bauchi", "Borno", "Gombe", "Taraba", "Yobe"],
            northWest: ["Kaduna", "Katsina", "Kano", "Kebbi", "Sokoto", "Jigawa", "Zamfara"],
            southEast: ["Abia", "Anambra", "Ebonyi", "Enugu", "Imo"],
            south: ["Akwa Ibom", "Bayelsa", "Cross River", "Delta", "Edo", "Rivers"],
            southWest: ["Ekiti", "Lagos", "Osun", "Ondo", "Ogun", "Oyo"],
         };
         
         Object.keys(geoPolRegions).forEach((key, idx) => {

            const stateFeats = [];

            const region = geoPolRegions[key];

            region.forEach(state => {

               // search stateAdminBounds;
               const matchingStateFeat = ngaAdmiinBoundsLvl1FeatColl.features.filter(adminBoundFeat => adminBoundFeat.properties.admin1Name === state);

               // populate feat. colls. array;
               stateFeats.push(matchingStateFeat[0]);
            });

            // unite feat. colls.
            const regionGJ = turf.union(...stateFeats);
            
            // derive properties
            regionGJ.properties = {
               "regionName": key,
               "admin1Names": geoPolRegions[key],
            };
            
            console.log({regionGJ});

            // return united feats.
            geoPolRegionsGJ.features.push(regionGJ)
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


exports.getGeoPolRegions = catchAsync((async(req, res, next) => {
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


function retreiveClustersData() {

   const cachedGeoClusterFiles = [
      "parcelized-agcs.json",
      // "legacy-agcs.json",
      "processed-legacy-agcs.json",
   ];

   const GEO_CLUSTERS_OBJS = [];

   for (const geoClusterFile of cachedGeoClusterFiles) {
      let geoClusterJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/${geoClusterFile}`), {encoding: 'utf8'});
      let geoClusterObj = JSON.parse(geoClusterJSON);
      GEO_CLUSTERS_OBJS.push(geoClusterObj);
   };

   // const parcelizedClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/parcelized-agcs.json`), {encoding: 'utf8'});
   // const legacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/legacy-agcs.json`), {encoding: 'utf8'});
   // const processedLegacyClustersJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/processed-legacy-agcs.json`), {encoding: 'utf8'});

   // let parcelizedClusters, legacyClusters, processedLegacyClusters;
   
   // if (parcelizedClustersJSON) {
   //    parcelizedClusters = JSON.parse(parcelizedClustersJSON);
   // };

   // if (legacyClustersJSON) {
   //    legacyClusters = JSON.parse(legacyClustersJSON);
   // };

   // if (processedLegacyClustersJSON) {
   //    processedLegacyClusters = JSON.parse(processedLegacyClustersJSON);
   // };
      
   // const returnedClusters = combineObjArrays(parcelizedClusters, legacyClusters, processedLegacyClusters);
   const returnedClusters = combineObjArrays(...GEO_CLUSTERS_OBJS);

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


exports.getCachedGeoClustersData = catchAsync(async(req, res, next) => {
   
   const returnedClusters = retreiveClustersData().returnedClusters;
      
   req.app.locals.returnedClusters = returnedClusters;

   next();
   
}, `getClustersDataErr`);