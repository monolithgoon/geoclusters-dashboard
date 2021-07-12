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

	await cacheAPIData();
};


startServer();
// https://cloudinary.com/blog/node_js_file_upload_to_a_local_server_or_to_the_cloud
// https://cloudinary.com/users/login?RelayState=%2Fconsole%2F%2Fmedia_library%2Ffolders%2F63647164f961dcc2142fb2ba5a946393%3Fcustomer_external_id%3Dc-3c4f14a6a5248e490a7766c6a3c6f6
// https://github.com/nelsonic/node-cdn
// https://stackoverflow.com/questions/46557300/how-to-upload-an-image-to-cloudinary
// https://support.cloudinary.com/hc/en-us/articles/202520752-Can-I-upload-files-to-a-folder-while-keeping-their-original-file-names-
// https://cloudinary.com/documentation/upload_widget
