const winston = require("winston");
const appConfig = require("./config/config.js");

const transports = [];
if (process.env.NODE_ENV !== "development") {
	transports.push(new winston.transports.Console());
} else {
	transports.push(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.cli(),
				winston.format.splat()
			),
		})
	);
}

loggerInstance = winston.createLogger({
	level: appConfig.logs.level,
	// levels: winston.appConfig.npm.levels,
	format: winston.format.combine(
		winston.format.timestamp({
			format: "YYYY-MM-DD HH:mm:ss",
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json()
	),
	transports,
});

module.exports = loggerInstance;