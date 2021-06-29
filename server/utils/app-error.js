class ServerError extends Error {
   constructor(message, statusCode, caller) {
      super(message); // call the parent's constructor class; assign 'message' to the message param.

      // ServerError properties
      this.caller = caller;
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith(`4`) ? 'fail' : 'error';
      this.isOperational = true;

      Error.captureStackTrace(this, this.constructor);;
   };
};

module.exports = ServerError;