// GLOBAL ERR. HANDLER MIDDLEWARE > DERIVES PROPS. FROM ServerError CLASS
const AppError = require("../utils/app-error.js");
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
	return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use another value!`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);

	const message = `Invalid input data. ${errors.join(". ")}`;
	return new AppError(message, 400);
};

const handleJWTError = () => new AppError("Invalid token. Please login.", 401);

const handleJWTExpiredError = () =>
	new AppError("Your login session has expired! Please login again.", 401);

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
	// console.error("ERROR 🥺", err);
	console.error(chalk.fail("ERROR 🥺", err.statusCode, err.status, err.caller, err.message));

	// 2. Send error message
	return res.status(err.statusCode).render("404", {
		title: "Something went wrong...",
		msg: err.message,
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
		}
		// 1) Log error
		console.error("ERROR 🥺", err);

		// 2) Send error message
		return res.status(500).json({
			status: "error",
			message: "Something went wrong!",
		});
	}

	if (err.isOperational) {
		console.log(err);
		return res.status(err.statusCode).render("404", {
			title: "Something went wrong!",
			msg: err.message,
		});
	}
	// 1) Log error
	console.error("ERROR 🥺", err);

	// 2) Send error message
	return res.status(err.statusCode).render("404", {
		title: "Something went wrong...",
		msg: "Please try again later.",
	});
};

module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";
	err.caller = err.caller

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