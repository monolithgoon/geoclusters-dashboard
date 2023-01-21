let fs = require('fs');
const chalk = require('./server/utils/chalk-messages.js')

// REQUIRE THE OBFUSCATOR MODULE
let Obfuscator = require('javascript-obfuscator');

// READ THE ORIGINAL JS FILE
fs.readFile('./server/public/dist/bundle.js', "UTF-8", (err, data) => {
   if (err) {
      throw err;
   };
   
   // DISPLAY MESSAGE TO USER
   console.log(chalk.working('[ Reading & obfuscating the source code ]'));

   // START TIMER
   let execStart = process.hrtime();

   // OBFUSCATE THE FILE
   let obfuscationResult = Obfuscator.obfuscate(data);

   // WRITE RESULT TO NEW FILE
   fs.writeFile('./server/public/dist/jquery-2.3.1.slim.min.js', obfuscationResult.getObfuscatedCode(), (err, data) =>{
      if(err) {

         return console.log(err.message);
         
      } else {

         console.log(chalk.success('[ The obfuscated source code was saved to file ]'));
      };

      // END TIMER
      let execEnd = process.hrtime(execStart)
      console.info(chalk.interaction(`[ The execution time was: ${execEnd[0]}s ${(execEnd[1] / 1000000).toFixed(0)}ms ]`));
   });
});