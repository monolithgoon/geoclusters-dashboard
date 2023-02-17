const { exec } = require("child_process");
const readline = require("readline");

// Create a readline interface to prompt the user for a commit message and number of log lines
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

// Prompt the user for a commit message
rl.question("ENTER A COMMIT MESSAGE: ", (message) => {
	// Run the git add and commit commands using the entered message
	exec(`git add -A && git commit -m "${message}"`, (error, stdout, stderr) => {
		if (error) {
			console.error(`Error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.error(`stderr: ${stderr}`);
			return;
		}
		// console.log(`stdout: ${stdout}`);

		// Prompt the user for the number of log lines to show
		rl.question("ENTER THE NUMBER GIT LOG LINES TO SHOW: ", (numLines) => {

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

				// console.log(`Git log (${numLines} lines):\n${stdout}`);
				console.log(`Git log (${numLines} lines):\n}`);

        // Promit the user to push commit to remote origin or not
        rl.question(`PUSH COMMIT TO REMOTE ORIGIN? (YES | Y or NO | N)`, (response) => {
  
          // User chooses to commit to remote origin
          if (response.toLowerCase === "y") {
  
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
          // Close the readline interface
          rl.close();
        });
			});
		});
	});
});
