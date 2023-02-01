const dotenv = require("dotenv"); // read the data from the config file. and use them as env. variables in NODE
const path = require("path");
const chalk = require("../utils/chalk-messages.js");

// set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// LOAD THE .env VARIABLES INTO process.env
if (process.env.NODE_ENV === `development`) {
	const envConfig = dotenv.config({ path: path.resolve(__dirname, `../development.env`) }); // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE YOU CALL THE APP

	if (envConfig.error) {
		// this error should crash the whole process
		throw new Error(chalk.fail(`Couldn't find .env file. ${envConfig.error}`));
	}
}

module.exports = Object.freeze({
	
	nodeEnv: process.env.NODE_ENV,

	geoclustersHostUrl: process.env.GEOCLUSTERS_HOST_URL,

	port: parseInt(process.env.PORT, 10) || 8080,

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
		mailHost: process.env.MAIL_HOST,
		mailPort: process.env.MAIL_PORT,
		mailUser: process.env.MAIL_USERNAME,
		mailPass: process.env.MAIL_PASSWORD,
	},

	cloud: {
		cloudinaryURL: process.env.CLOUDINARY_URL,
	},

	logs: {
		level: process.env.LOG_LEVEL || "silly",
	},
});
