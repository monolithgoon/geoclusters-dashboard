const dotenv = require("dotenv");
const path = require("path");
const chalk = require("../utils/chalk-messages.js");

// set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// LOAD THE .env VARIABLES INTO process.env
if (process.env.NODE_ENV === `development`) {
	const envConfig = dotenv.config({ path: path.resolve(__dirname, `../development.env`) }); // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE YOU CALL THE APP

	if (envConfig.error) {
		// this error should crash the whole process
		throw new Error(chalk.fail(`Couldn't find a .env file. ${envConfig.error}`));
	}
}

module.exports = Object.freeze({
	
	appDeveloper: process.env.APP_DEVELOPER,
	appTitle: process.env.APP_TITLE,
	appOwner: process.env.APP_OWNER,
	
	nodeEnv: process.env.NODE_ENV,

	geoclustersHostUrl: process.env.GEOCLUSTERS_HOST_URL,

	port: parseInt(process.env.PORT, 10) || 9090,

	databaseURL: process.env.ATLAS_DB_STRING,

	jwtSecret: process.env.JWT_SECRET,
	jwtAlgorithm: process.env.JWT_ALGO,
	jwtExpiresInDays: process.env.JWT_EXPIRES_IN_DAYS,
	jwtCookieExpiresInDays: process.env.JWT_COOKIE_EXPIRES_IN_DAYS,

	// emails: {
	// 	apiKey: process.env.MAILGUN_API_KEY,
	// 	apiUsername: process.env.MAILGUN_USERNAME,
	// 	domain: process.env.MAINGUN_DOMAIN,
	// },

	emails: {
		mailHost: process.env.EMAIL_HOST,
		mailPort: process.env.MAILTRAP_PORT,
		mailUser: process.env.MAILTRAP_USERNAME,
		mailPass: process.env.MAILTRAP_PASSWORD,
	},

	cloud: {
		cloudinaryURL: process.env.CLOUDINARY_URL,
	},

	logs: {
		level: process.env.LOG_LEVEL || "silly",
	},
});
