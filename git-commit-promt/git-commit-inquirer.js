`use strict`;
const { exec } = require("child_process");
const readline = require("readline");
const inquirer = require("inquirer");
const chalk = require("./server/utils/chalk-messages.js");

// Create a readline interface to prompt the user for a commit message and number of log lines
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const COMMIT_TYPES = Object.freeze({
	1: "TEST",
	2: "FEAT",
	3: "REFACTOR",
	4: "STYLE",
	5: "FIX",
	6: "CHORE",
	7: "DOCS",
	8: "PERF",
	9: "CI",
	10: "REVERT",
});

const RUN_PROGRAM = async () => {
  
	// Transform the COMMIT_TYPES object into an array of objects with name and value properties
	const choices = Object.entries(COMMIT_TYPES).map(([value, name]) => ({
		name, // Name of the option to display in the prompt
		value, // Value of the option to return when selected
	}));

	// Display the prompt with the transformed options
	inquirer
		.prompt([
			{
				type: "list",
				name: "option",
				message: "Select an option:", // Message to display above the list of options
				choices: choices, // Array of objects representing the available options
			},
		])
		.then((answers) => {
			console.log(`You selected: ${answers.option}`);
			return COMMIT_TYPES[answers.option];
		})
		.then((commitType) => {
			console.log(`You selected: ${commitType}`);

			const askCommitMessage = () => {
				return new Promise((resolve, reject) => {
					rl.question(chalk.interaction("Enter a commit message:"), (message) => {
						console.log(`You entered: ${message}`);
						resolve(message);
					});
				});
			};

			return askCommitMessage();
		})
		.then((message) => {
			console.log({ message }); // do something with the commit message
			rl.close(); // Close the readline interface to exit the program
		})
		.catch((error) => {
			console.error(error); // Handle any errors that occur
		});
};

RUN_PROGRAM();
