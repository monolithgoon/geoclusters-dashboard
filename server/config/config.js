const dotenv = require("dotenv"); // read the data from the config file. and use them as env. variables in NODE
const path = require('path');
const chalk = require('../utils/chalk-messages.js');

// set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config({path: path.resolve(__dirname, `../config.env`)}) // IMPORTANT > CONFIGURE ENV. VARIABLES BEFORE U CALL THE APP 

if (envFound.error) {
	// this error should crash the whole process
	throw new Error(chalk.fail(`Couldn't find .env file. ${envFound.error}`));
}

module.exports = {
	port: parseInt(process.env.PORT, 10) || 8080,

	databaseURL: process.env.ATLAS_DB_STRING,

	jwtSecret: process.env.JWT_SECRET,
	jwtAlgorithm: process.env.JWT_ALGO,

	emails: {
		apiKey: process.env.MAILGUN_API_KEY,
		apiUsername: process.env.MAILGUN_USERNAME,
		domain: process.env.MAINGUN_DOMAIN,
	},

	cloudinary: {
		cloudinaryURL: process.env.CLOUDINARY_URL,
	},

	logs: {
		level: process.env.LOG_LEVEL || "silly",
	},
};