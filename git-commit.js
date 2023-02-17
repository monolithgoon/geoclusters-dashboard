const { exec } = require('child_process');
const readline = require('readline');

// Create a readline interface to prompt the user for a commit message and number of log lines
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user for a commit message
rl.question('Enter a commit message: ', (message) => {
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
    console.log(`stdout: ${stdout}`);

    // Prompt the user for the number of log lines to show
    rl.question('Enter the number of log lines to show: ', (numLines) => {
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
        console.log(`Git log (${numLines} lines):\n${stdout}`);
      });

      // Close the readline interface
      rl.close();
    });
  });
});
