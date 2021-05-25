`use strict`;

const path = require("path");
const express = require("express");
const EXPRESS_SERVER = express();
const morgan = require("morgan");
const bodyParser = require("body-parser"); // get the contents OF request.body
const compression = require("compression"); // server response compression
const chalk = require('./utils/chalk-messages.js');
// const globalErrorHandler = require("./controllers/error-controller.js");

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
EXPRESS_SERVER.set("views", path.join(__dirname, "templates"));

// 3RD PARTY M-WARE > SERVE STATIC FILES
EXPRESS_SERVER.use(express.static(path.join(__dirname, "public")));

// middleware that transforms the raw string of req.body into json
EXPRESS_SERVER.use(bodyParser.json({ limit: "16mb" }));

// 3RD PARTY M-WARE > REQ. LOGGING IN DEV. OR PROD. MODE
if (process.env.NODE_ENV === "development") {
	console.log(
		chalk.interaction(
			`THE NODE EVIRONMENT IS CURRENTLY IN: [ ${process.env.NODE_ENV} ] MODE `
		)
	);
	EXPRESS_SERVER.use(morgan("dev"));
}

// CUSTOM M-WARE > ADD A CUSTOM PROPERTY ('requestTime) TO THE REQUEST OBJ.
EXPRESS_SERVER.use((request, response, next) => {
	request.requestTime = new Date().toISOString();
	next();
});

// SERVER RESPONSE COMPRESSION MIDDLEWARE FOR ALL TEXT SENT TO CLIENTS
EXPRESS_SERVER.use(compression());

// GLOBAL ERROR HANDLING M.WARE
// EXPRESS_SERVER.use(globalErrorHandler);

//
EXPRESS_SERVER.use(express.urlencoded({ extended: true }));

// Load the API routes
const viewRouter = require("./routes/view-routes.js");

// MOUNT THE ROUTES
EXPRESS_SERVER.use("/", viewRouter);

module.exports = EXPRESS_SERVER;