// REMOVE > DEPRECATED
// // This function Replaces the try / catch block in an async function

// function catchAsyncError(fn, fnDescr=null) {
//    // `fn` is the async function that used to have a try / catch block

//    // RETURN AN ANNONYMOUS FN. THAT EXPRESS IS GOING TO CALL FOR THE PARTICULAR RESOURCE
//    return function (request, response, next) {

//       // CALL | EXECUTE "fn"
//       // THE ASYNC FUNCTION THIS IS WRAPPED AROUND RETURNS A PROMISE IF THERE IS AN ERROR
//       // THAT ERROR IS PASSED VIA "next(err)" TO THE GLOBAL ERROR HANDLNG FN. IN error-controller.js
//       fn(request, response, next).catch(err => {
//          err.statusCode = 400;
//          err.caller = fnDescr || `undef. caller`;
//          next(err);
//       });

//       // fn(request, response, next).catch(next) // SAME AS ABOVE
//    };
// };

/**
 * @function catchAsyncError
 * @description Returns a middleware function that wraps an async function and handles any errors thrown
 * Replaces the try / catch block in an async function
 * @param {Function} fn - The async function to wrap
 * @param {string} [fnDescr] - An optional description of the async function for debugging purposes
 * @returns {Function} A middleware function that wraps the async function and handles any errors
 */
function catchAsyncError(fn, fnDescr = null) {

   return function (request, response, next) {

     // Call the async function and catch any errors
     fn(request, response, next).catch(err => {

       // Set a status code and a caller identifier for the error
       err.statusCode = 400;
       err.caller = fnDescr || `undefined caller`;
 
       // Pass the error to the global error handling middleware
       next(err);
     });
   };
 }
 
 module.exports = catchAsyncError;