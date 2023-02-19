`use strict`;
const { exec } = require("child_process");
const inquirer = require("inquirer");
const readline = require("readline");
const chalk = require("../server/utils/chalk-messages.js");

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

async function askCommitPrompt(prompt, rl) {
	let commitType = await readlineQuestionAsync(`\n${prompt}`, rl);
	if (typeof commitType !== "string" || commitType.trim() === "") {
		console.log(chalk.consoleY(`Your response is invalid`));
		commitType = askCommitPrompt(prompt, rl);
	}
	return commitType;
}

async function executeCommands() {
	// Create a readline interface to prompt the user for a commit message and number of log lines
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		let commitType = await askCommitPrompt("Enter a commit TYPE:", rl);

		const commitDomain = await askCommitPrompt("Enter a commit DOMAIN:", rl);

		const commitMSg = await askCommitPrompt("Enter a commit MESSAGE:", rl);

		const completeCommitMsg = `${commitType.toUpperCase()} (${commitDomain}): ${commitMSg}"`;

		console.log({ completeCommitMsg });

		const commitConfirm = await askCommitPrompt("Confirm commit message? ( Y / N )", rl);

		if (!["yes", "y"].includes(commitConfirm.toLowerCase())) process.exit(0);

		const commitRes = await execAsync(`git add -A && git commit -m "${completeCommitMsg}`, rl);
		console.log({ commitRes });

		// Prompt user to commit to origin / master
		const response = await readlineQuestionAsync(
			`\nPush commit to remote origin? ( Y / N ):`,
			rl
		);
		console.log(response);

		// User chooses to commit to remote origin
		if (["yes", "y"].includes(response.toLowerCase())) {
			const origin = await execAsync(`git push origin master`, rl);
			console.log({ origin });
		}
	} catch (error) {
		console.error(error);
	} finally {
		// rl.close();
		process.exit();
	}
}

executeCommands();
