`use strict`
const { exec } = require("child_process");
const readline = require("readline");
const chalk = require("./server/utils/chalk-messages.js");


// Create a readline interface to prompt the user for a commit message and number of log lines
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});


function execAsync(command, rl) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        rl.close();
      } else if (stderr) {
        reject(stderr);
        rl.close()
      } else {
        resolve(stdout);
      }
    });
  });
}

function readlineQuestionAsync(question) {
	return new Promise((resolve, reject) => {
		rl.question(chalk.interaction(question), (answer) => {
			resolve(answer);
		});
	});
}

async function executeCommands() {

	try {
    
		const gitStatus = await execAsync("git status && git log --oneline -5");
		console.log(chalk.consoleGy(`\nGit status:\n${gitStatus}`));

		const message = await readlineQuestionAsync("Enter a commit message:");

		const commit = await execAsync(`git add -A && git commit -m "${message}"`, rl);
		console.log(commit);

    // Prompt user to commit to origin / master
		const response = await readlineQuestionAsync(`Push commit to remote origin? (YES | Y or NO | N):`);
		// console.log(response);

    // User chooses to commit to remote origin
    if (response.toLowerCase() === "yes" || response.toLowerCase() === "y") {
      await execAsync(`git push origin master`, rl)
    }

    // Prompt the user for the num. of log lines to show
    const numLines = await readlineQuestionAsync(`Enter the number of log lines to show:`);

    const result3 = await execAsync(`git log --oneline -${numLines}`, rl);
    
	} catch (error) {

		console.error(error);

	} finally {
		rl.close();
		process.exit();
	}
}

executeCommands();
