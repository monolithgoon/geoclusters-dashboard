`use strict`
const nodemailer = require("nodemailer");
const APP_CONFIG = require("../config/config.js");
const chalk = require("../utils/chalk-messages.js")

const sendEmail = async (options) => {

	try {
		
		// 1) Create a transporter
		const transporter = nodemailer.createTransport({
			host: APP_CONFIG.emails.mailHost,
			port: APP_CONFIG.emails.mailPort,
			auth: {
				user: APP_CONFIG.emails.mailUser,
				pass: APP_CONFIG.emails.mailPass,
			},
			// IF USING GMAIL: REM. TO ACTIVATE 'less secure app" OPTION
		});
	
		// 2) Define the email options
		const mailOptions = {
			from: "Justin Bieber <justin.bieber@gmail.com>",
			to: options.emailAddr,
			subject: options.emailSubject,
			text: options.emailText,
			// html:
		};
	
		// 3) Actually send the email
		await transporter.sendMail(mailOptions);

	} catch (sendEmailErr) {
		throw new Error(sendEmailErr);
	};
};


module.exports = sendEmail;
