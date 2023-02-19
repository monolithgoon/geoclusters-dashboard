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

// Prompt the user for a commit message
rl.question(chalk.interaction("Enter a commit message:"), (message) => {
	// Run the git add and commit commands using the entered message
	exec(`git add -A && git commit -m "${message}"`, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error.message}`);
			// SANDBOX
			rl.close()
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			// SANDBOX
			rl.close()
			return;
		}

		// console.log(`stdout: ${stdout}`);

		rl.question(
			chalk.interaction(`Push commit to remote origin? (YES | Y or NO | N):`),
			(response) => {
				// User chooses to commit to remote origin
				if (response.toLowerCase() === "yes" || response.toLowerCase() === "y") {
					exec(`git push origin master`, (error, stdout, stderr) => {
						if (error) {
							console.error(`Error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.error(`stderr: ${stderr}`);
							return;
						}
					});
				}

				// Prompt the user for the number of log lines to show
				rl.question(chalk.interaction("Enter the number of log lines to show:"), (numLines) => {
					// Run the git log command using the entered number of lines
					exec(`git log --oneline -n ${numLines}`, (error, stdout, stderr) => {
						if (error) {
							console.error(`Error: ${error.message}`);
							return;
						}
						if (stderr) {
							console.error(`stderr: ${stderr}`);
							return;
						}
						console.log(chalk.consoleY(`Git log (${numLines} lines):\n${stdout}`));
					});

					// Close the readline interface
					rl.close();
				});
			}
		);
	});
});
