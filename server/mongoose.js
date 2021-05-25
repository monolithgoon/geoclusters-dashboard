const chalk = require('./utils/chalk-messages.js');
const mongoose = require('mongoose');
const appConfig = require('./config/config.js');

// EXPORT DB. CONNECTION
async function DB_CONNECT() {

   try {

      console.log(chalk.working('Connecting to the remote Atlas DB...'));

      const database = appConfig.databaseURL.replace(`<PASSWORD>`, process.env.ATLAS_DB_PASSOWRD) // REPLACE THE PLACEHOLDER TEXT IN THE CONNECTION STRING
   
      mongoose.connect(database, {
         // handle mongoDB deprecation warnings
         useNewUrlParser: true,
         useCreateIndex: true,
         useFindAndModify: false,
         useUnifiedTopology: true
      })
      .then(connectionObject => {
         // console.log((connectionObject))
         console.log(chalk.connected('YOU CONNECTED TO THE ATLAS DATABASE SUCCESSFULLY '));
      })
      .catch(_err => {
         console.log(chalk.fail(`ERROR CONNECTING TO THE REMOTE DATABASE. CHECK YOUR INTERNET CONNECTION. `))
         console.log(chalk.fail(`${_err.message}`))
         process.exit();
      });
   
   } catch(_err) {
      console.log(chalk.fail(_err.message));
      process.exit();
   } 
}

module.exports = DB_CONNECT;