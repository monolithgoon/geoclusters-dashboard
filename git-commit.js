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

//
const logError = (error, stderr) => {
	if (error) {
		console.error(`Error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.error(`stderr: ${stderr}`);
		return;
	}
};

// // Prompt the user for a commit message
// rl.question(chalk.interaction("Enter a commit message:"), (message) => {
// 	// Run the git add and commit commands using the entered message
// 	exec(`git add -A && git commit -m "${commitType}: ${message}"`, (error, stdout, stderr) => {

// 		logError(error, stderr)

// 		// console.log(`stdout: ${stdout}`);

// 		rl.question(
// 			chalk.interaction(`Push commit to remote origin? (YES | Y or NO | N):`),
// 			(response) => {

// 				// User chooses to commit to remote origin
// 				if (response.toLowerCase === "yes" || response.toLowerCase === "y") {
// 					exec(`git push origin master`, (error, stdout, stderr) => {
// 						logError(error, stderr)
// 					});
// 				}

// 				// Prompt the user for the number of log lines to show
// 				rl.question(chalk.interaction("Enter the number of log lines to show:"), (numLines) => {

// 					// Run the git log command using the entered number of lines
// 					exec(`git log --oneline -n ${numLines}`, (error, stdout, stderr) => {

// 						logError(error, stderr);

// 						console.log(chalk.consoleY(`Git log (${numLines} lines):\n${stdout}`));
// 					});

// 					// Close the readline interface
// 					rl.close();
// 				});
// 			}
// 		);
// 	});
// });

function readlineQuestionAsync(question) {
	return new Promise((resolve, reject) => {
		rl.question(chalk.interaction(question), (answer) => {
			resolve(answer);
		});
	});
}

function execAsync(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error);
			} else if (stderr) {
				reject(stderr);
			} else {
				resolve(stdout);
			}
		});
	});
}

async function executeCommands() {

	try {
    
		const gitStatus = await execAsync("git status");
		console.log(chalk.consoleGy(`\nGit status:\n${gitStatus}`));

		const message = await readlineQuestionAsync("Enter a commit message:");

		const result2 = await execAsync(`git add -A && git comiit -m "${message}"`);
		console.log(result2);

    // Prompt user to commit to origin / master
		const response = await readlineQuestionAsync(`Push commit to remote origin? (YES | Y or NO | N):`);
		// console.log(response);

    // User chooses to commit to remote origin
    if (response.toLowerCase === "yes" || response.toLowerCase === "y") {
      await execAsync(`git push origin master`)
    }

    // Prompt the user for the num. of log lines to show
    const numLines = await readlineQuestionAsync(`Enter the number of log lines to show:`);

    const result3 = await execAsync(`git log --oneline -${numLines}`);
    
	} catch (error) {

		console.error(error);

	} finally {
		rl.close();
		process.exit();
	}
}

executeCommands();
