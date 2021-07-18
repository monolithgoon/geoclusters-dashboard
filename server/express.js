`use strict`;
const path = require("path");
const express = require("express");
const EXPRESS_SERVER = express();
// const helmet = require('helmet');
const morgan = require("morgan");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser"); // get the contents OF request.body
const cookieParser = require('cookie-parser');
const compression = require("compression"); // server response compression
const chalk = require('./utils/chalk-messages.js');
const ServerError = require('./utils/app-error.js');
const globalErrorHandler = require("./controllers/error-controller.js");


// APPEND THE APP BASE DIR. TO THE GLOBAL OBJ.
global.__approotdir = __dirname;


// * HEALTH CHECK ENDPOINTS
EXPRESS_SERVER.get("/status", (req, res) => {
	res.status(200).end();
});
EXPRESS_SERVER.head("/status", (req, res) => {
	res.status(200).end();
});


// SET THE TEMPLATING ENGINE TO "PUG"
EXPRESS_SERVER.set("view engine", "pug");
EXPRESS_SERVER.set("views", path.join(__dirname, "views"));


// GLOBAL 3RD PARTY M-WARE >


// 1. SET SECURITY HTTP HEADERS
// EXPRESS_SERVER.use(helmet());


// 2. RATE LIMITING M-WARE
const limiter = rateLimit({
	max: 10, // num. reqs. per IP addr.,
	window: 60 * 60 * 1000, // millisecs.
	message: `Too many requests from this IP address. Please try again in 1 hour.`
});

EXPRESS_SERVER.use(`/api`, limiter);


// 3. SERVE STATIC FILES
EXPRESS_SERVER.use(express.static(path.join(__dirname, "public")));


// 4. middleware that parses JSON data from the request body into req.body
EXPRESS_SERVER.use(bodyParser.json({ limit: "100kb" }));


// DATA SANITIZATION AGAINST NoSQL Q-INJECTION


// DATA SANITIZATION AGAINST XSS


// 5. get the cookies sent in the request
EXPRESS_SERVER.use(cookieParser());


// 6. REQ. LOGGING IN DEV. OR PROD. MODE
if (process.env.NODE_ENV === "development") {
	console.log(chalk.interaction(`THE NODE EVIRONMENT IS CURRENTLY IN: [ ${process.env.NODE_ENV} ] MODE `));
	EXPRESS_SERVER.use(morgan("dev"));
};


// CUSTOM M-WARE > ADD A CUSTOM PROPERTY ('requestTime) TO THE REQUEST OBJ.
EXPRESS_SERVER.use((request, response, next) => {

	request.requestTime = new Date().toISOString();

	console.log(request.headers);

	// console.log(JSON.stringify(request.cookies));

	next();
});


// SERVER RESPONSE COMPRESSION MIDDLEWARE FOR ALL TEXT SENT TO CLIENTS
EXPRESS_SERVER.use(compression());


EXPRESS_SERVER.use(express.urlencoded({ extended: true }));


// Load the routes
const viewRouter = require("./routes/view-routes.js");
const userRouter = require("./routes/user-routes.js");


// REMOVE > SEEMS TO BE BLOCKING ALL ROUTES
// // HANDLE ALL INVALID ROUTES
// EXPRESS_SERVER.all(`*`, (req, res, next) => {
// 	next(new ServerError(`Can't find ${req.originalUrl} on this server`, 404));
// });


// MOUNT THE ROUTES
EXPRESS_SERVER.use("/", viewRouter);
EXPRESS_SERVER.use("/api/v1/users/", userRouter);


// GLOBAL ERROR HANDLING M.WARE
EXPRESS_SERVER.use(globalErrorHandler);


module.exports = EXPRESS_SERVER;