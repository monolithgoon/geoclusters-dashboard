`use strict`;
const { exec } = require("child_process");
const readline = require("readline");
const chalk = require("../server/utils/chalk-messages.js");

async function askCommitPrompt(prompt, rl, promptFlag) {
	return new Promise((resolve, reject) => {
		rl.question(prompt, (answer) => {
			if (!answer) {
				reject(new Error("Answer cannot be empty"));
			} else {
				switch (promptFlag) {
					case "TYPE":
						if (answer.length < 2) {
							console.log("Commit type must be at least 2 characters long");
							resolve(askCommitPrompt(prompt, rl, promptFlag));
						} else {
							resolve(answer);
						}
						break;
					case "DOMAIN":
						if (answer.length < 3) {
							console.log("Commit domain must be at least 3 characters long");
							resolve(askCommitPrompt(prompt, rl, promptFlag));
						} else {
							resolve(answer);
						}
						break;
					case "MESSAGE":
						if (answer.length < 10) {
							console.log("Commit message must be at least 10 characters long");
							resolve(askCommitPrompt(prompt, rl, promptFlag));
						} else {
							resolve(answer);
						}
						break;
					case "CONFIRM":
						if (!["yes", "y", "no", "n"].includes(answer.toLowerCase())) {
							console.log("Invalid input. Please enter 'Y' or 'N'");
							resolve(askCommitPrompt(prompt, rl, promptFlag));
						} else {
							resolve(answer);
						}
						break;
					default:
						resolve(answer);
						break;
				}
			}
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

async function executeCommands() {

	// Create a readline interface to prompt the user for a commit message and number of log lines
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});

	try {

		let commitType,
			commitDomain,
			commitMSg,
			completeCommitMsg,
			commitConfirm,
			commitRes,
			response,
			origin;

		while (true) {
			commitType = await askCommitPrompt("Enter a commit TYPE:", rl, "TYPE");

			commitDomain = await askCommitPrompt("Enter a commit DOMAIN:", rl, "DOMAIN");

			commitMSg = await askCommitPrompt("Enter a commit MESSAGE:", rl, "MESSAGE");

			completeCommitMsg = `${commitType.toUpperCase()} (${commitDomain}): ${commitMSg}"`;

			console.log({ completeCommitMsg });

			commitConfirm = await askCommitPrompt("Confirm commit message? ( Y / N )", rl, "CONFIRM");

			if (["yes", "y"].includes(commitConfirm.toLowerCase())) {
				break;
			} else {
				// Take the user back to the first prompt
				continue;
			}
		}

		commitRes = await execAsync(`git add -A && git commit -m "${completeCommitMsg}`, rl);
		console.log({ commitRes });

		// Prompt user to commit to origin / master
		response = await readlineQuestionAsync(`\nPush commit to remote origin? ( Y / N ):`, rl);
		console.log(response);

		// User chooses to commit to remote origin
		if (["yes", "y"].includes(response.toLowerCase())) {
			origin = await execAsync(`git push origin master`, rl);
			console.log({ origin });
		}

	} catch (error) {
		console.error(chalk.consoleY(error))
	} finally {
		rl.close();
		process.exit();
	}
}

executeCommands();