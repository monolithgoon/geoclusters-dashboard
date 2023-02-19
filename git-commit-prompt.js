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
				if (!["test", "feat", "refactor", "style", "fix", "chore", "docs", "perf", "ci", "revert"].includes(promptResponse.toLowerCase())) {
					console.log(
						chalk.consoleYlow(`Invalid input. Please enter one of:`)
						);
					console.log(COMMIT_TYPES);
					promptResponse = await askCommitPrompt(prompt, rl, promptFlag);
				}
				break;
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
						chalk.consoleYlow("Invalid input. Please enter 'TYPE', 'DOMAIN', 'MESSAGE' or 'NONE'")
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

async function executeCommands() {

	// Create a readline interface to prompt the user for a commit message and number of log lines
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {
		let commitType,
			commitDomain,
			commitMsg,
			completeCommitMsg,
			commitConfirm,
			commitAmendChoice,
			commitResponse,
			okCommitOrigin;

		while (true) {

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
					commitType = await askCommitPrompt("Enter a commit TYPE:", rl, "TYPE");

					commitDomain = await askCommitPrompt("Enter a commit DOMAIN:", rl, "DOMAIN");

					commitMsg = await askCommitPrompt("Enter a commit MESSAGE:", rl, "MESSAGE");

					console.log({ completeCommitMsg });
					
					break;
			}

			completeCommitMsg = `${commitType.toUpperCase()} (${commitDomain}): ${commitMsg}"`;

			console.log({ completeCommitMsg });

			commitConfirm = await askCommitPrompt("Confirm commit message? ( Y / N )", rl, "CONFIRM");

			if (["yes", "y"].includes(commitConfirm.toLowerCase())) {
				break;
			} else {
				console.log({ commitType });
				console.log({ commitDomain });
				console.log({ commitMsg });
				commitAmendChoice = await askCommitPrompt(
					`Select which prompt to change: ( "TYPE", "DOMAIN", "MESSAGE", "NONE")`,
					rl,
					"CHANGE"
				);
			}
		}

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
			okCommitOrigin = await execAsync(`git push origin master`, rl);
			console.log({ okCommitOrigin });
		}
	} catch (error) {
		console.error(error);
	} finally {
		rl.close();
		process.exit();
	}
}
executeCommands();
