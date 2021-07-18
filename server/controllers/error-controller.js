`use strict`


// GLOBAL ERR. HANDLER MIDDLEWARE > DERIVES PROPS. FROM ServerError CLASS
const ServerError = require("../utils/app-error.js");
const chalk = require("../utils/chalk-messages.js");


// module.exports = (err, req, res, next) => {
// 	// console.log(err.stack);
// 	console.log(err.name);
// 	err.statusCode = err.statusCode || 500;
// 	err.status = err.status || `error`;
// 	err.owner = err.owner || `undef. owner`;
// 	res.status(err.statusCode).json({
// 		status: err.status,
// 		message: err.message,
// 		owner: err.owner,
// 	});
// 	next();
// };


const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new ServerError(message, 400);
};


const handleDuplicateFieldsDB = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new ServerError(message, 400);
};


const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join(". ")}`;
	return new ServerError(message, 400);
};


const handleJWTError = () => new ServerError("Invalid token. Please login.", 401);


const handleJWTExpiredError = () =>
	new ServerError("Session expired. Please login again.", 401);


const sendErrorDev = (err, req, res) => {

	if (req.originalUrl.startsWith("/api")) {
		return res.status(err.statusCode).json({
			status: err.status,
			error: err,
			message: err.message,
			stack: err.stack,
		});
	};

	// 1. Log error
	console.error(chalk.fail(`ERROR 🥺🥺🥺`, `[ ${err.caller} ]`, err.message));

	// 3. Send error message
	return res.status(err.statusCode).render("404", {
		err_status_code: err.statusCode,
		err_title: "Something went wrong...",
		err_msg: `[ ${err.message} ]`,
	});
};


const sendErrorProd = (err, req, res) => {

	if (req.originalUrl.startsWith("/api")) {

		// Operational, trusted error: send message to client
		if (err.isOperational) {
			return res.status(err.statusCode).json({
				status: err.status,
				message: err.message,
			});
		};

		// 1) Log error
		console.error("ERROR 🥺", err);

		// 2) Send error message
		return res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	};

	if (err.isOperational) {

		console.log(err);
		return res.status(err.statusCode).render("404", {
			err_status_code: err.statusCode,
			err_title: "Something went wrong!",
			err_msg: err.message,
		});
	};

	// 1) Log error
	console.error("ERROR 🥺", err);

	// 2) Send error message
	return res.status(err.statusCode).render("404", {
		err_status_code: err.statusCode,
		err_title: "Something went wrong...",
		err_msg: "Please try again later.",
	});
};


module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";
	err.caller = err.caller || `💥 This is probably not a server error.`

	if (process.env.NODE_ENV === "development") {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === "production") {
		let error = { ...err };
		error.message = err.message;
		if (error.name === "CastError") error = handleCastErrorDB(error);
		if (error.code === 11000) error = handleDuplicateFieldsDB(error);
		if (error.name === "ValidationError") error = handleValidationErrorDB(error);
		if (error.name === "JsonWebTokenError") error = handleJWTError(error);
		if (error.name === "TokenExpiredError") error = handleJWTExpiredError(error);
		sendErrorProd(error, req, res);
	};
};