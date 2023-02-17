`use strict`
const turf = require("@turf/turf");
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const CACHED_FILE_NAMES = require("../constants/cached-file-names.js");
const LOCAL_FILE_NAMES = require("../constants/local-file-names.js");
const NGA_GEO_POL_REGIONS = require("../constants/nga-geo-pol-regions.js");
const catchAsync = require('../middlewares/catch-async-error.js');
const chalk = require("../utils/chalk-messages.js");
const { _formatNumByThousand, _combineObjArrays, _catchAsync } = require("../utils/helpers.js");


const parseString = async str => {
   try {
      return JSON.parse(str);
   } catch (parseStringErr) {
      console.error(chalk.fail(`parseStringErr: ${parseStringErr.message}`));
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
            // START BLANK GEOJSON FILES THAT (WILL) EVENTUALLY HOLD MERGED GEOJSON FILES
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl1-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl2-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
            fs.writeFile(path.resolve(`${__approotdir}/localdata/nga-lvl3-admin-bounds.geojson`), ``, () => console.log(chalk.warningBright(`Base nga-ward-bounds.geojson file created`)));
         } catch (fielWriteErr) {
            throw new Error(`fielWriteErr: ${fielWriteErr.message}`);
         };   
      },

			// REMOVE > DEPRECATED FOR loadGeoJSONFilesFromDirectory()
			/**
			 * @function loadDirGeojsonFiles
			 * @description Read all the GeoJSON files in a directory and load their contents into an array
			 *   - USE Promise.all to to time when all the async readFiles HAS COMPLETED
			 *   - Tt is more performant to work with an array of geojson files split from one large file
			 * @param {string} filesDirectory - The path of the directory containing the GeoJSON files
			 * @returns {Promise} A Promise that resolves to an array of the contents of the GeoJSON files in the directory
			 */
			loadDirGeojsonFiles: async filesDirectory => {

				console.log(chalk.working(`READING GEOJSON FILE(S) DATA in ${filesDirectory}`));

				// Get an array of all the file names in the directory
				return fs.readdirAsync(path.resolve(`${root}/${filesDirectory}`))

					// Filter out any files that are not GeoJSON files
					.then(gjFileNames => {

							gjFileNames = gjFileNames.filter(isGeoJSONFile);

							gjFileNames.forEach(gjFileName => console.log({gjFileName}));
							// console.log(chalk.consoleB(JSON.stringify({gjFileNames})));
							// Read the contents of each GeoJSON file in parallel
							return Promise.all(gjFileNames.map(gjFileName => {
								return getFileData(gjFileName, filesDirectory);
							}))
					})

					// Combine the contents of all the GeoJSON files into a single array
					.then(gjFiles => {

							gjFiles.forEach(gjFile => {
								console.log(chalk.working(`[ parsing file buffer ]`))
								const geojson_file = JSON.parse(gjFile);
								COMBINED_FILES_ARR.push(geojson_file);
							});
							
							console.log(chalk.success(`Finished combining all the files`));
							
							return COMBINED_FILES_ARR;
					})

					// Handle any errors that occur while reading the files
					.catch(err => {
							console.error(err);
							return [];
					})
			},

			/**
			 * @function loadGeoJSONFilesFromDirectory
			 * @description Reads all the GeoJSON files in a directory and loads their contents into an array
			 * Some of the GeoJSON this app needs have been split into separate files
			 * It is more performant to work with an array of geojson files that have been split from one large file
			 * @param {string} filesDirectory - The path of the directory containing the GeoJSON files
			 * @returns {Promise} A Promise that resolves to an array of the contents of the GeoJSON files in the directory
			 */
			loadGeoJSONFilesFromDirectory: _catchAsync(async (filesDirectory) => {

				console.log(chalk.working(`Reading GeoJSON file(s) data in ${filesDirectory}`));

				// try {

					// Get an array of all the file names in the directory
					const fileNames = await fs.readdirAsync(path.join(root, filesDirectory));

					// Filter out any files that are not GeoJSON files and parse each GeoJSON file in parallel
					const geojsonFiles = fileNames.filter(isGeoJSONFile).map(async (fileName) => {
						const fileData = await getFileData(fileName, filesDirectory);
						console.log(chalk.consoleY(`Parsing file - ${fileName}`))
						return JSON.parse(fileData);
					});

					// Init var. to hold the combined files
					let combinedFiles = [];

					// Wait for all the parsed GeoJSON files to be resolved and return them as an array
					combinedFiles = await Promise.all(geojsonFiles);

					console.log(chalk.success(`Finished combining all the files`));

					return combinedFiles;

				// } catch (err) {
				// 	// Handle any errors that occur while reading the files
				// 	console.error(err);
				// 	return [];
				// }
			}, "loadGeoJSONFilesFromDirectory"),
 
			// REMOVE > DEPRECATED BELOW
      // returnLocalFiles: async (fileNamesArr) => {
      //    for (let fileName of fileNamesArr) {
      //       let fileData = await fsPromises.readFile(path.resolve(`${__approotdir}/${LOCAL_FILE_NAMES.BASE_DIRECTORY}/${fileName}`), `utf8`, (readFileErr, fileBuffer) => {
      //          if (readFileErr) throw readFileErr;
      //          console.log(chalk.result(`FILE READ OK - ${fileName}`));
      //          resolve(fileBuffer);
      //       });
      //       if (!fileData) null;
      //       return fileData;
      //    };
      // },
			
			/**
			 * @function returnLocalFiles
			 * @description Reads the contents of an array of files from the local filesystem
			 * @param {string[]} fileNamesArr - An array of file names to read
			 * @returns {Promise} A Promise that resolves to an array of file contents
			 */
			returnLocalFiles: _catchAsync(async (fileNamesArr) => {

				// Create an empty array to store the file contents
				const fileContents = [];

				// Loop through each file name in the array and read its contents
				for (let fileName of fileNamesArr) {
					const fileData = await fsPromises.readFile(path.resolve(`${__approotdir}/${LOCAL_FILE_NAMES.BASE_DIRECTORY}/${fileName}`), `utf8`);
					console.log(chalk.result(`FILE READ OK - ${fileName}`));
					fileContents.push(fileData);
				};

				return fileContents;
				
			}, `returnLocalFiles`),

      getCombinedDirFiles: async filesDirectory => {
         // TODO
      },


      /*
         This fn. creates a GeoJSON Feature Collection of 6 geographical and political regions in Nigeria. 
         Each Feature represents a geo. pol. region. It does this by combining the GeoJSON of each state of that pol. region

         The function performs the following operations:
         1. Retrieves the contents of a GeoJSON file `nga-state-admin-bounds.geojson` using the `returnLocalFiles` method from the `ProcessFiles` module.
         2. Parses the retrieved data into a GeoJSON Feature Collection using the `parseString` method.
         3. Iterates over the properties of the `NGA_GEO_POL_REGIONS` object and performs the following operations for each region:
            a. Filters the features of the `ngaAdmiinBoundsLvl1FeatColl` Feature Collection to find the ones that correspond to the states in the region.
            b. Unites the found features into a single Feature using the `turf.union` method.
            c. Adds properties to the resulting Feature indicating the region name and the names of the states in the region.
            d. Adds the Feature to the `geoPolRegionsGJ` Feature Collection.
         4. Writes the `geoPolRegionsGJ` Feature Collection to a file `nga-geo-pol-regions.geojson`. The path to the file is constructed using the `path.resolve` method and the current working directory.
      */
      getNGAGeoPolRegions: _catchAsync(async () => {

         // Get a GeoJSON Feat. Collection for all the states in Nigeria
         const ngaAdmiinBoundsLvl1FeatColl = await parseString(await ProcessFiles.returnLocalFiles([`nga-state-admin-bounds.geojson`]));
         
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
      }, `getNGAGeoPolRegions`),

   };
})(__approotdir);


exports.getAdminBoundsLvl1GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl1Files = await ProcessFiles.loadGeoJSONFilesFromDirectory(`/localdata/nga-state-admin-bounds`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl1Files,
   });
}), `getAdminBoundsLvl1Err`);


exports.getAdminBoundsLvl2GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl2Files = await ProcessFiles.loadGeoJSONFilesFromDirectory(`/localdata/nga-lga-admin-bounds`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl2Files,
   });
}), `getAdminBoundsLvl2Err`);


exports.getAdminBoundsLvl3GeoJSON = catchAsync((async(req, res, next) => {
   const ngaAdmiinBoundsLvl3Files = await ProcessFiles.loadGeoJSONFilesFromDirectory(`/localdata/nga-ward-admin-bounds-openAFRICA`);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaAdmiinBoundsLvl3Files,
   });
}), `getAdminBoundsLvl3Err`);


exports.getGeoPolRegionsGeoJSON = catchAsync((async(req, res, next) => {
   const ngaGeoPolRegionsGJ = await parseString(await ProcessFiles.returnLocalFiles([`nga-geo-pol-regions.geojson`]));
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaGeoPolRegionsGJ,
   });
}), `getGeoPolRegionsErr`);


exports.getNgaMarketsGeoJSON = catchAsync((async(req, res, next) => {
   const ngaMarketsGeoJSON = await ProcessFiles.loadGeoJSONFilesFromDirectory(LOCAL_FILE_NAMES.DIRECTORIES.NGA.MARKETS);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaMarketsGeoJSON,
   })
}), `getNgaMarketsErr`)


exports.getNgaWaterwaysGeoJSON = catchAsync((async(req, res, next) => {
   const ngaWaterwaysGeoJSON = await ProcessFiles.loadGeoJSONFilesFromDirectory(LOCAL_FILE_NAMES.DIRECTORIES.NGA.WATERWAYS);
   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: ngaWaterwaysGeoJSON,
   })
}), `getNgaWaterwaysErr`);


exports.getWorldCountriesGeoJSON = catchAsync((async(req, res, next) => {

   const worldCountriesGeoJSON = await parseString(await ProcessFiles.returnLocalFiles([LOCAL_FILE_NAMES.FILES.WORLD.COUNTRIES]));

   res.status(200).json({
      status: `success`,
      requested_at: req.requestTime,
      data: worldCountriesGeoJSON,
   })
}), `getWorldCountriesErr`);


/** 
 * This function retreives geoclusters that have been downloaded from the database, 
 * prorcessed, convered to .json, and saved to disk by `server/workers/cache-api-data.js`
 * The files are cached in `server/localdata`
 * The exact file names correspond to the names of the collections in the database
 */
// function retrieveCachedClustersJSON(JSONFiles) {

//    const GEOCLUSTERS_DATA = [];

//    // Loop through the list of cached files and read the data, parse it and push it to the GEOCLUSTERS_DATA array
//    for (const fileName of JSONFiles) {
//       let geoClusterJSON = fs.readFileSync(path.resolve(`${__approotdir}/localdata/${fileName}`), {encoding: 'utf8'});
//       let geoClusterObj = JSON.parse(geoClusterJSON);
//       GEOCLUSTERS_DATA.push(geoClusterObj);
//    };
      
//    // Combine the JSON for all the returned clusters into a single object
//    const returnedClusters = _combineObjArrays(...GEOCLUSTERS_DATA);

//    // Create a summary of the returned clusters
//    const clustersSummary = {
//       totalNumClusters: _formatNumByThousand(returnedClusters.length),
//       totalNumFeatures: (()=>{
//          let featsCount = 0;
//          const featsCounts = [];
//          for (let idx = 0; idx < returnedClusters.length; idx++) {
//             const cluster = returnedClusters[idx];
//             featsCounts.push(cluster.features.length);
//          }
//          featsCount = _formatNumByThousand(featsCounts.reduce((sum, featCount) => sum + featCount));
//          return featsCount;
//       })(),
//    };
         
//    // Return the combined data and the clusters summary
//    return {returnedClusters, clustersSummary};
// };

/**
 * 
 * @function retrieveCachedClustersJSON
 * @description Retrieves geoclusters data from the server's local cache.
 * @returns {object} Returns an object with two properties:
 *   - returnedClusters: an array of geocluster objects
 *   - clustersSummary: an object with a summary of the returned geoclusters, containing the following properties:
 *       - totalNumClusters: a formatted string representing the total number of clusters returned
 *       - totalNumFeatures: a formatted string representing the total number of features across all clusters returned
 */
function retrieveCachedClustersJSON(JSONFiles) {

	// Initialize an array to store geocluster data
	const GEOCLUSTERS_DATA = [];

	// Loop through the list of cached files and read the data, parse it and push it to the GEOCLUSTERS_DATA array
	for (const fileName of JSONFiles) {
		// Get the file path
		const filePath = path.resolve(`${__approotdir}/localdata/${fileName}`);

		// Read the file content and parse the JSON data
		const geoClusterJSON = fs.readFileSync(filePath, { encoding: "utf8" });
		const geoClusterObj = JSON.parse(geoClusterJSON);

		// Push the parsed data to the array
		GEOCLUSTERS_DATA.push(geoClusterObj);
	}

	// TODO -> SPLIT INTO SEPARATE FN.
	// Combine the JSON for all the returned clusters into a single object
	const returnedClusters = _combineObjArrays(...GEOCLUSTERS_DATA);

	// TODO -> SPLIT INTO SEPARATE FN.
	// Calculate a summary of the returned clusters
	const clustersSummary = {
		// Format the number of clusters as a string with commas
		totalNumClusters: _formatNumByThousand(returnedClusters.length),
		// Calculate the total number of features and format the result as a string with commas
		totalNumFeatures: (() => {
			// Initialize a variable to keep track of the total number of features
			let total = 0;

			// Loop through each cluster and add the number of features to the total
			for (const cluster of returnedClusters) {
				total += cluster.features.length;
			}

			// Format the total number of features as a string with commas and return the result
			return _formatNumByThousand(total);
		})(),
	};

	// Return the combined data and the clusters summary as an object
	return { returnedClusters, clustersSummary };
}; 


/**
 * @function getCachedClustersSummary
 * @description A function that retrieves geocluster summary data from the server's local cache and stores it in the application's locals object.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If an error occurs while retrieving the cluster summary data.
 */
exports.getCachedClustersSummary = catchAsync(async (req, res, next) => {

   // Retrieve the geocluster data and clusters summary from this server's localdata cache
   const { clustersSummary } = retrieveCachedClustersJSON(LOCAL_FILE_NAMES.FILES.GEOCLUSTERS);
 
   // Store the clusters summary in the application's locals object
   req.app.locals.clustersSummary = clustersSummary;
 
   // Call the next middleware function
   next();
 }, `getClustersSummaryErr`);
 

/**
 * @function getCachedClustersData
 * @description A function that retrieves geocluster data and summary information from the server's local cache and stores it in the application's locals object.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next middleware function
 * @throws {Error} If an error occurs while retrieving the geocluster data and summary information.
 */
exports.getCachedClustersData = catchAsync(async (req, res, next) => {

   // Retrieve the geocluster data and clusters summary from this server's localdata cache
   const { returnedClusters, clustersSummary } = retrieveCachedClustersJSON(LOCAL_FILE_NAMES.FILES.GEOCLUSTERS);
 
   // Store the geocluster data and clusters summary in the application's locals object
   req.app.locals.returnedClusters = returnedClusters;
   req.app.locals.clustersSummary = clustersSummary;
 
   // Call the next middleware function
   next();
 }, `getClustersDataErr`);
 