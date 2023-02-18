const chalk = require('chalk')

// const highlight = chalk.blue.bgYellowBright.bold
// const result = chalk.yellow.bgCyan.bold
// const working = chalk.blue.bgGrey.bold
// const interaction = chalk.blue.bgWhiteBright.bold
// const running = chalk.blue.bgCyanBright.bold
// const success = chalk.white.bgGreen.bold
// const connected = chalk.white.bgBlue.bold
// const fail = chalk.white.bgRed.bold
// const warning  = chalk.whiteBright.bgYellow.bold
// const called = chalk.blue.bgGreenBright.bold

// module.exports = {
//    highlight,
//    result,
//    working,
//    interaction,
//    success,
//    connected,
//    warning,
//    fail,
//    running,
//    called,
// }

const highlight = chalk.blue.bgYellowBright.bold
const consoleY = chalk.yellowBright.bgBlack.bold
const consoleB = chalk.blueBright.bgBlack.bold
const consoleG = chalk.green.bgBlack.bold
const consoleGy = chalk.grey.bgBlack.bold
const result = chalk.yellowBright.bgCyan.bold
// const result = chalk.blueBright.bgCyanBright.bold
const working = chalk.blueBright.bgGrey.bold
const interaction = chalk.blue.bgWhiteBright.bold
const interactionB = chalk.black.bgWhiteBright.bold
// const running = chalk.blue.bgCyanBright.bold
const running = chalk.blue.bgGreenBright.bold
// const success = chalk.white.bgGreen.bold
const success = chalk.yellow.bgBlue.bold
const connected = chalk.white.bgBlue.bold
// const connected = chalk.whiteBright.bgBlueBright.bold
const fail = chalk.white.bgRed.bold
const warning  = chalk.whiteBright.bgYellow.bold
const warningBright  = chalk.yellowBright.bgYellow.bold
const warningStrong  = chalk.redBright.bgYellow.bold

module.exports = {
   highlight,
   consoleY,
   consoleB,
   consoleG,
   consoleGy,
   result,
   working,
   interaction,
   interactionB,
   running,
   running,
   success,
   connected,
   fail,
   warning,
   warningBright,
   warningStrong,
}