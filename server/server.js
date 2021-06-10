const appConfig = require("./config/config.js");
const EXPRESS_SERVER = require("./express.js");
const DB_CONNECT = require("./mongoose.js");
const LOCALIZE_DATA = require(`./jobs/localize-data.js`) 
const logger = require("./logger.js");
const chalk = require("./utils/chalk-messages.js");

async function startServer() {
	
	await DB_CONNECT();

	EXPRESS_SERVER.listen(appConfig.port, () => {
		logger.info(
			chalk.running(
				`🛡️ EXPRESS server listening on port: ${appConfig.port} 🛡️`
			)
		);
	}).on("error", (err) => {
		logger.error(err);
		process.exit(1);
	});

	// await LOCALIZE_DATA();
}

startServer();