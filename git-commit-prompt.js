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

function readlineQuestionAsync(question, rl) {
	return new Promise((resolve, reject) => {
		rl.question(chalk.interaction(question) + " ", (answer) => {
			resolve(answer);
		});
	});
}

async function executeCommands() {
	try {
		const gitStatus = await execAsync("git status && git log --oneline -5", rl);
		// console.log(chalk.consoleGy(`\nGit status:\n${status}`));
		// console.log({ gitStatus });

		const gitLog = await execAsync("git log --oneline -5", rl);
		console.log(chalk.consoleG(`\nGit log:\n${ gitLog }`));
		// console.log({ gitLog });

		const commitType = await readlineQuestionAsync("Enter a commit type:", rl);

		const commitDomain = await readlineQuestionAsync("Enter a commit domain:", rl);
		console.log({ commitDomain });

		const commitMSg = await readlineQuestionAsync("Enter a commit message:", rl);

		const completeCommitMsg = `${commitType.toUpperCase()} (${commitDomain}): ${commitMSg}"`
		
		console.log({ completeCommitMsg });

		const commitConfirm = await readlineQuestionAsync(
			"Confirm commit message? ( YES | Y or NO | N )",
			rl
		);

		if (!["yes", "y"].includes(commitConfirm.toLowerCase())) process.exit(0);

		// const commitedRes = await execAsync(`git add -A && git commit -m "${commitType}: ${commitMSg}"`, rl);
		const commitedRes = await execAsync(
			`git add -A && git commit -m "${completeCommitMsg}`,
			rl
		);
		console.log({ commitedRes });

		// Prompt user to commit to origin / master
		const response = await readlineQuestionAsync(
			`Push commit to remote origin? ( YES | Y or NO | N ):`,
			rl
		);
		console.log(response);

		// User chooses to commit to remote origin
		if (["yes", "y"].includes(response.toLowerCase())) {
			const origin = await execAsync(`git push origin master`, rl);
			console.log({ origin });
		}

		// Prompt the user for the num. of log lines to show
		const numLines = await readlineQuestionAsync(`Enter the number of log lines to show:`);

		const newGitLog = await execAsync(`git log --oneline -${numLines}`, rl);
		console.log({ newGitLog });
	} catch (error) {
		console.error(error);
	} finally {
		// rl.close();
		process.exit();
	}
}

executeCommands();
