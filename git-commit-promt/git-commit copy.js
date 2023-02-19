`use strict`;
const { exec } = require("child_process");
const inquirer = require("inquirer");
const readline = require("readline");
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

// Transform the COMMIT_TYPES object into an array of objects with name and value properties
const choices = Object.entries(COMMIT_TYPES).map(([value, name]) => ({
	name, // Name of the option to display in the prompt
	value, // Value of the option to return when selected
}));

function promptAsync() {
	return new Promise((resolve, reject) => {
		inquirer
			.prompt([
				{
					type: "list",
					name: "option",
					message: "Select an option:",
					choices: choices,
				},
			])
			.then((answers) => {
				console.log(`You selected: ${answers.option}`);
				const commitType = COMMIT_TYPES[answers.option];
				// Additional code to process user input goes here
				// Ask the user if they want to continue or exit
				inquirer
					.prompt([
						{
							type: "confirm",
							name: "continue",
							message: "Do you want to continue?",
						},
					])
					.then((answers) => {
						if (answers.continue) {
							// Call promptAsync again to continue the process
							// promptAsync();
              // const commitMSg = readlineQuestionAsync("Enter a fucking commit message:");
              rl.question(chalk.highlight(`Enter a fucking commit message`))
						} else {
							// Exit the program
							process.exit(0);
						}
					});
			})
			// .then(async (commitType) => {
			// 	console.log({ commitType });
			// 	const commitMSg = await readlineQuestionAsync("Enter a fucking commit message:");
			// 	// console.log({ commitMSg })
			// 	process.stdin.resume();
			// })
			.catch((error) => {
				reject(error);
			});
	});
}

function execAsync(command, rl) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
				rl.close();
			} else if (stderr) {
				reject(stderr);
				rl.close();
			} else {
				resolve(stdout);
			}
		});
	});
}

function readlineQuestionAsync(question) {
	return new Promise((resolve, reject) => {
		rl.question(chalk.interaction(question) + " ", (answer) => {
			resolve(answer);
			rl.close();
		});
	});
}

async function executeCommands() {
	try {
		const gitStatus = await execAsync("git status && git log --oneline -5");
		// console.log(chalk.consoleGy(`\nGit status:\n${status}`));
		// console.log({ gitStatus });

		const gitLog = await execAsync("git log --oneline -5");
		// console.log(chalk.consoleGy(`\nGit status:\n${status}`));
		console.log({ gitLog });

		const commitType = await promptAsync();
		// console.log({ commitType });
		// promptAsync();

		process.stdin.resume();

		// const commitMSg = await readlineQuestionAsync("Enter a commit message:");
		// console.log({ commitMSg })

		// // const commitedRes = await execAsync(`git add -A && git commit -m "${commitType}: ${commitMSg}"`, rl);
		// const commitedRes = await execAsync(`git add -A && git commit -m "${commitMSg}"`, rl);
		// console.log({ commitedRes });

		// // Prompt user to commit to origin / master
		// const response = await readlineQuestionAsync(
		// 	`Push commit to remote origin? (YES | Y or NO | N):`
		// );
		// console.log(response);

		// // User chooses to commit to remote origin
		// if (response.toLowerCase() === "yes" || response.toLowerCase() === "y") {
		// 	const origin = await execAsync(`git push origin master`, rl);
		// 	console.log({ origin });
		// }

		// // Prompt the user for the num. of log lines to show
		// const numLines = await readlineQuestionAsync(`Enter the number of log lines to show:`);

		// const result3 = await execAsync(`git log --oneline -${numLines}`, rl);
		// console.log({ result3 });
	} catch (error) {
		console.error(error);
	} finally {
		// rl.close();
		process.exit();
	}
}

executeCommands();
