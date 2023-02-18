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

const RUN_PROGRAM = async () => {
  
  // Transform the COMMIT_TYPES object into an array of objects with name and value properties
  const choices = Object.entries(COMMIT_TYPES).map(([value, name]) => ({
    name, // Name of the option to display in the prompt
    value, // Value of the option to return when selected
  }));

  // Display the prompt with the transformed options
  const { option } = await inquirer.prompt([
    {
      type: "list",
      name: "option",
      message: "Select an option:", // Message to display above the list of options
      choices: choices, // Array of objects representing the available options
    },
  ]);
  
  const commitType = COMMIT_TYPES[option];

  console.log(`You selected: ${commitType}`);

  const message = await new Promise((resolve, reject) => {
    rl.question(chalk.interaction("Enter a commit message:"), (message) => {
      console.log(`You entered: ${message}`);
      // resolve(message);
    });
  });

  console.log({ message });
};

RUN_PROGRAM();
