const appConfig = require("./config/config.js");
const expressServer = require("./express.js");
const dbConnect = require("./mongoose.js");
const cacheAPIData = require(`./workers/cache-api-data.js`) 
const logger = require("./logger.js");
const chalk = require("./utils/chalk-messages.js");


async function startServer() {
	
	await dbConnect();

	expressServer.listen(appConfig.port, () => {
		logger.info(
			chalk.running(
				`🛡️ EXPRESS server listening on port: ${appConfig.port} 🛡️`
			)
		);
	}).on("error", (err) => {
		logger.error(err);
		process.exit(1);
	});

	// DOWNLOAD AND SAVE GEO CLUSTER DATA OFFLINE
	await cacheAPIData();
};


startServer();