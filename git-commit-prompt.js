`use strict`;
const { exec } = require("child_process");
const readline = require("readline");
const chalk = require("./server/utils/chalk-messages.js");

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

async function askCommitPrompt(prompt, rl, promptFlag) {
	let promptResponse = await readlineQuestionAsync(`\n${prompt}`, rl);
	if (typeof promptResponse !== "string" || promptResponse.trim() === "") {
		console.log(chalk.consoleYlow(`Response must be a non-empty string`));
		promptResponse = askCommitPrompt(prompt, rl, promptFlag);
	} else {
		switch (promptFlag) {
			case "TYPE":
				if (promptResponse.length < 2) {
					console.log(chalk.consoleYlow("Commit type must be at least 2 characters long"));
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				if (typeof promptResponse === "string") {
					if (!Object.values(COMMIT_TYPES).includes(promptResponse.toUpperCase())) {
						console.log(chalk.consoleYlow(`Invalid input. Please enter a correct type:`));
						console.log(COMMIT_TYPES);
						promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
					}
					break;
				}
				if (typeof promptResponse === "number") {
					if (!Object.keys(COMMIT_TYPES).includes(promptResponse.toUpperCase())) {
						console.log(chalk.consoleYlow(`Invalid input. Please select a number:`));
						console.log(COMMIT_TYPES);
						promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
					}
				}
			case "DOMAIN":
				if (promptResponse.length < 3) {
					console.log(chalk.consoleYlow("Commit domain must be at least 3 characters long"));
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				break;
			case "MESSAGE":
				if (promptResponse.length < 10) {
					console.log(chalk.consoleYlow("Commit message must be at least 10 characters long"));
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				break;
			case "CONFIRM":
				if (!["yes", "y", "no", "n"].includes(promptResponse.toLowerCase())) {
					console.log(chalk.consoleYlow("Invalid input. Please enter 'Y' or 'N'"));
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				break;
			case "CHANGE":
				if (!["TYPE", "DOMAIN", "MESSAGE", "NONE"].includes(promptResponse.toUpperCase())) {
					console.log(
						chalk.consoleYlow(
							"Invalid input. Please enter 'TYPE', 'DOMAIN', 'MESSAGE' or 'NONE'"
						)
					);
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				break;
			case "ORIGIN":
				if (!["yes", "y", "no", "n"].includes(promptResponse.toLowerCase())) {
					console.log(chalk.consoleYlow("Invalid input. Please enter 'Y' or 'N'"));
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
			default:
				// resolve(answer);
				break;
		}
	}
	return promptResponse;
}

/**
 * @description Prompts the user for a commit message and number of log lines, then
 * executes a git commit and push to origin.
 * @function executeCommitPrompts
 */
async function executeCommitPrompts() {
	// Create a readline interface to prompt the user for input
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	console.log(chalk.consoleYlow(`Valid commit types:`));
	console.log(COMMIT_TYPES);

	try {
		// Declare variables to store commit information
		let commitType,
			commitDomain,
			commitMsg,
			completeCommitMsg,
			commitConfirm,
			commitAmendChoice,
			commitResponse,
			okCommitOrigin,
			pushOriginResponse;

		// Prompt the user for commit information until they confirm their message
		while (true) {
			// Check if the user has requested to change a specific part of the commit message
			switch (commitAmendChoice?.toUpperCase()) {
				case "TYPE":
					commitType = await askCommitPrompt("Enter a commit TYPE:", rl, "TYPE");
					break;

				case "DOMAIN":
					commitDomain = await askCommitPrompt("Enter a commit DOMAIN:", rl, "DOMAIN");
					break;

				case "MESSAGE":
					commitMsg = await askCommitPrompt("Enter a commit MESSAGE:", rl, "MESSAGE");
					break;

				case "NONE":
					break;

				default:
					// Prompt the user for the full commit message if no amendment is requested
					commitType = await askCommitPrompt("Enter a commit TYPE:", rl, "TYPE");
					commitDomain = await askCommitPrompt("Enter a commit DOMAIN:", rl, "DOMAIN");
					commitMsg = await askCommitPrompt("Enter a commit MESSAGE:", rl, "MESSAGE");
					break;
			}

			// Combine the commit information into a single message
			completeCommitMsg = `${commitType.toUpperCase()} (${commitDomain}): ${commitMsg}"`;

			console.log({ completeCommitMsg });

			// Confirm the commit message with the user
			commitConfirm = await askCommitPrompt("Confirm commit message is OK? ( Y / N )", rl, "CONFIRM");

			if (["yes", "y"].includes(commitConfirm.toLowerCase())) {
				break;
			} else {
				// If the user doesn't confirm their message, allow them to amend it
				console.log({ commitType });
				console.log({ commitDomain });
				console.log({ commitMsg });
				commitAmendChoice = await askCommitPrompt(
					`Select which prompt to amend ( "TYPE", "DOMAIN", "MESSAGE", "NONE"):`,
					rl,
					"CHANGE"
				);
			}
		}

		// Add and commit the changes using the complete commit message
		commitResponse = await execAsync(`git add -A && git commit -m "${completeCommitMsg}`, rl);
		console.log({ commitResponse });

		// Prompt user to commit to origin / master
		okCommitOrigin = await askCommitPrompt(
			"Push commit to remote origin? ( Y / N )",
			rl,
			"ORIGIN"
		);

		// User chooses to commit to remote origin
		if (["yes", "y"].includes(okCommitOrigin.toLowerCase())) {
			pushOriginResponse = await execAsync(`git push origin master`, rl);
			console.log({ pushOriginResponse });
		}
	} catch (error) {
		console.error(chalk.fail(error.message));
		console.error(error);
	} finally {
		// Close the readline interface and exit the process
		rl.close();
		process.exit();
	}
}

executeCommitPrompts();
